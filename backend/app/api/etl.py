"""
api/etl.py — POST /api/etl/upload endpoint.

Accepts a CSV file + optional instruction text.
Runs the full ETL pipeline:
    1. File validation (extension, size, readability)
    2. Read CSV into Pandas DataFrame
    3. Inspect data (rows, columns, missing values, duplicates)
    4. ETL Agent (LLM) selects operations from allowlist
    5. Execute selected operations (remove_duplicates, handle_missing, normalize)
    6. Validate final DataFrame
    7. Load into etl_staging via SQLAlchemy ORM
    8. Generate LLM natural-language summary
    9. Return EtlResponse

Security:
    - File type/extension enforced before reading
    - File size capped at 5 MB
    - No exec() / eval() anywhere
    - CSV values are data, not code
    - DB load is fully parameterized (SQLAlchemy ORM)
    - API keys and DB passwords never returned to caller
"""
import os
import time
import logging
import tempfile
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, Request

from app.schemas.api_schemas import EtlResponse
from app.tools.etl_tools import (
    MAX_FILE_SIZE_MB,
    read_csv,
    inspect_data,
    remove_duplicates,
    handle_missing_values,
    normalize_columns,
    validate_data,
    load_to_postgres,
)
from app.agents.etl_agent import select_etl_operations
from app.agents.answer_generator import generate_answer
from app.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

settings = get_settings()
MAX_UPLOAD_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024   # 5 MB in bytes


@router.post(
    "/etl/upload",
    response_model=EtlResponse,
    tags=["ETL"],
    summary="Upload a CSV file and run the ETL pipeline",
)
async def upload_and_process(
    request: Request,
    file: UploadFile = File(..., description="CSV file to process"),
    instructions: str = Form(
        default="Clean this CSV and load it into PostgreSQL.",
        description="Optional instructions for the ETL agent."
    ),
) -> EtlResponse:
    """
    Accepts a CSV file and natural-language instructions.

    The ETL Agent (Groq) selects which predefined operations to run.
    The data is cleaned with Pandas and loaded into the etl_staging table.

    Supported instructions include:
    - "Remove duplicates"
    - "Handle missing values"
    - "Clean and load"
    - "Normalize column names and remove duplicates"
    """
    request_id = getattr(request.state, "request_id", "unknown")
    start      = time.perf_counter()
    filename   = file.filename or "upload.csv"
    logger.info("etl_started request_id=%s filename=%s", request_id, filename)

    # ── 1. File extension check ─────────────────────────────────────
    ext = os.path.splitext(filename)[1].lower()
    if ext != ".csv":
        logger.warning("Rejected file with extension '%s'.", ext)
        return EtlResponse(
            success=False,
            filename=filename,
            error=f"Unsupported file type '{ext}'. Only .csv files are accepted.",
        )

    # ── 2. File size check ──────────────────────────────────────────
    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_UPLOAD_BYTES:
        size_mb = len(raw_bytes) / (1024 * 1024)
        logger.warning("Rejected file: %.1f MB exceeds limit.", size_mb)
        return EtlResponse(
            success=False,
            filename=filename,
            error=(
                f"File is too large ({size_mb:.1f} MB). "
                f"Maximum allowed size is {MAX_FILE_SIZE_MB} MB."
            ),
        )

    if len(raw_bytes) == 0:
        return EtlResponse(success=False, filename=filename, error="Uploaded file is empty.")

    # ── 3. Write to temp file for pandas to read ────────────────────
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=".csv",
            delete=False,
            dir=settings.upload_dir,
        ) as tmp:
            tmp.write(raw_bytes)
            tmp_path = tmp.name

        logger.info("Temp file written: %s (%d bytes).", tmp_path, len(raw_bytes))

        # ── 4. Read CSV ─────────────────────────────────────────────
        ok, df, read_error = read_csv(tmp_path)
        if not ok:
            return EtlResponse(success=False, filename=filename, error=read_error)

        rows_read = len(df)
        columns   = list(df.columns)
        logger.info("CSV read: %d rows, columns: %s", rows_read, columns)

        # ── 5. Inspect ──────────────────────────────────────────────
        inspection = inspect_data(df)
        logger.info("Inspection complete: %s", inspection)

        # ── 6. ETL Agent selects operations ─────────────────────────
        selected_ops = select_etl_operations(instructions, inspection)
        logger.info("Operations to run: %s", selected_ops)

        # ── 7. Execute selected operations ──────────────────────────
        duplicates_removed     = 0
        missing_values_handled = 0
        ops_performed          = []

        for op in selected_ops:
            if op == "normalize_columns":
                df = normalize_columns(df)
                columns = list(df.columns)
                ops_performed.append("normalize_columns")
                logger.info("normalize_columns done.")

            elif op == "remove_duplicates":
                df, n_removed = remove_duplicates(df)
                duplicates_removed += n_removed
                ops_performed.append("remove_duplicates")
                logger.info("remove_duplicates done: %d removed.", n_removed)

            elif op == "handle_missing_values":
                df, fill_report = handle_missing_values(df)
                missing_values_handled += sum(fill_report.values())
                ops_performed.append("handle_missing_values")
                logger.info("handle_missing_values done: %s", fill_report)

        # ── 8. Validate ─────────────────────────────────────────────
        valid, val_error = validate_data(df)
        if not valid:
            return EtlResponse(
                success=False,
                filename=filename,
                rows_read=rows_read,
                columns=columns,
                operations_performed=ops_performed,
                duplicates_removed=duplicates_removed,
                missing_values_handled=missing_values_handled,
                error=f"Validation failed: {val_error}",
            )

        # ── 9. Load to PostgreSQL ────────────────────────────────────
        load_ok, rows_loaded, rows_skipped, batch_id, load_error = load_to_postgres(df, filename)
        if not load_ok:
            return EtlResponse(
                success=False,
                filename=filename,
                rows_read=rows_read,
                columns=columns,
                operations_performed=ops_performed,
                error=load_error,
            )

        logger.info(
            "ETL load complete: %d inserted, %d skipped, batch_id=%s.",
            rows_loaded, rows_skipped, batch_id
        )

        # ── 10. Generate natural-language summary ───────────────────
        # generate_answer() returns a dict {"summary": ..., "key_observations": [...]}
        # We extract just the summary string for EtlResponse.answer
        etl_summary_data = [{
            "rows_read":              rows_read,
            "duplicates_removed":     duplicates_removed,
            "missing_values_handled": missing_values_handled,
            "rows_loaded":            rows_loaded,
            "rows_skipped":           rows_skipped,
            "operations":             ops_performed,
            "destination":            "etl_staging",
        }]
        try:
            answer_dict = generate_answer(
                question=f"Summarize what happened when processing '{filename}'.",
                sql="(ETL pipeline — no SQL)",
                data=etl_summary_data,
            )
            # generate_answer returns a dict — pull out just the summary string
            if isinstance(answer_dict, dict):
                answer_str = answer_dict.get("summary", "ETL completed successfully.")
            else:
                answer_str = str(answer_dict)
        except Exception as ans_exc:
            logger.warning("Answer generation failed (non-fatal): %s", ans_exc)
            answer_str = f"ETL completed: {rows_loaded} rows inserted, {rows_skipped} duplicates skipped."

        logger.info(
            "etl_completed request_id=%s rows_read=%d rows_loaded=%d rows_skipped=%d duration_ms=%.2f",
            request_id, rows_read, rows_loaded, rows_skipped,
            round((time.perf_counter() - start) * 1000, 2)
        )

        return EtlResponse(
            success=True,
            filename=filename,
            batch_id=batch_id,
            rows_read=rows_read,
            columns=columns,
            operations_performed=ops_performed,
            duplicates_removed=duplicates_removed,
            missing_values_handled=missing_values_handled,
            rows_loaded=rows_loaded,
            rows_skipped=rows_skipped,
            destination="etl_staging",
            answer=answer_str,
            request_id=request_id,
            duration_ms=round((time.perf_counter() - start) * 1000, 2),
        )

    except Exception as exc:
        err_msg = str(exc)
        logger.exception("Unexpected ETL error: %s", err_msg)
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An unexpected error occurred during ETL processing.",
                "debug": err_msg,
            }
        )

    finally:
        # ── 11. Clean up temp file ───────────────────────────────────
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
                logger.info("Temp file cleaned up: %s", tmp_path)
            except OSError:
                pass
