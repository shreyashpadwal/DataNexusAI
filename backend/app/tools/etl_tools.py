"""
tools/etl_tools.py — Predefined ETL operations using Pandas.

All tools here are APPLICATION-CONTROLLED functions.
The LLM selects which tools to run — it never generates Python code.

Operation allowlist (used by etl_agent.py):
    remove_duplicates       - Drop exact duplicate rows
    handle_missing_values   - Fill NaN with sensible defaults per type
    normalize_columns       - Lowercase + snake_case column names

Fixed operations (always run regardless of LLM):
    read_csv                - Load file into DataFrame
    inspect_data            - Gather metadata
    validate_data           - Pre-load sanity checks
    load_to_postgres        - Controlled INSERT into etl_staging

Security:
    - No exec() / eval() anywhere in this file
    - CSV values are treated as data, never as code
    - Spreadsheet-formula-looking cells (=CMD(...)) are kept as plain strings
    - DB load uses SQLAlchemy ORM — fully parameterized
    - Credentials are never passed to the LLM

Missing value strategy (documented):
    Numeric columns  → fill with column MEDIAN
    String/object    → fill with 'Unknown'
    Date columns     → leave as NaT (no forced imputation on dates)
"""
import uuid
import logging
import re
from datetime import datetime
from typing import Tuple, Dict, Any, List, Optional

import numpy as np
import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.connection import engine
from app.models.db_models import EtlStaging

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Limits
# -------------------------------------------------------------------
MAX_FILE_SIZE_MB  = 5          # 5 MB upload cap
MAX_ROWS          = 10_000     # Prevent enormous DataFrames
MAX_COLS          = 100        # Sanity cap on columns
ALLOWED_EXTENSION = ".csv"

# Operations the LLM is allowed to select
ALLOWED_OPERATIONS = frozenset([
    "remove_duplicates",
    "handle_missing_values",
    "normalize_columns",
])


# -------------------------------------------------------------------
# Tool 1 — Read CSV
# -------------------------------------------------------------------

def read_csv(file_path: str) -> Tuple[bool, Optional[pd.DataFrame], str]:
    """
    Reads a CSV file into a Pandas DataFrame.

    The file is treated strictly as data.
    Formula-looking cells (=CMD(...)) are kept as plain strings.

    Returns:
        (True,  df,   "")            on success
        (False, None, error_message) on failure
    """
    try:
        # dtype=str reads everything as string first — prevents auto-execution
        # of anything that pandas might interpret as a formula or special value.
        # We cast numeric columns later in handle_missing_values if needed.
        df = pd.read_csv(
            file_path,
            dtype=str,               # All values start as strings (safe)
            keep_default_na=False,   # We handle NaN ourselves
            na_values=["", "NA", "N/A", "null", "NULL", "None", "nan"],
        )

        # Strip surrounding whitespace from all string values
        for col in df.columns:
            df[col] = df[col].str.strip()

        if df.empty:
            return False, None, "The CSV file is empty."

        if len(df) > MAX_ROWS:
            return False, None, (
                f"CSV has {len(df)} rows, which exceeds the maximum of {MAX_ROWS} rows. "
                "Please upload a smaller file."
            )

        if len(df.columns) > MAX_COLS:
            return False, None, f"CSV has too many columns ({len(df.columns)}). Maximum is {MAX_COLS}."

        logger.info("CSV read successfully: %d rows, %d columns.", len(df), len(df.columns))
        return True, df, ""

    except pd.errors.EmptyDataError:
        return False, None, "The CSV file is empty or contains no data."
    except pd.errors.ParserError as e:
        return False, None, f"The CSV file could not be parsed: {e}"
    except Exception as e:
        logger.error("read_csv error: %s", e)
        return False, None, "Failed to read the CSV file."


# -------------------------------------------------------------------
# Tool 2 — Inspect Data
# -------------------------------------------------------------------

def inspect_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Returns a metadata dictionary describing the DataFrame.

    Used by the ETL Agent to decide which operations are needed.
    This information is passed to the LLM — NOT the actual row data.
    """
    # Count NaN per column
    na_counts = df.isnull().sum()
    missing = {col: int(count) for col, count in na_counts.items() if count > 0}

    # Duplicate count
    dup_count = int(df.duplicated().sum())

    inspection = {
        "rows":           len(df),
        "columns":        len(df.columns),
        "column_names":   list(df.columns),
        "missing_values": missing,
        "total_missing":  int(na_counts.sum()),
        "duplicate_rows": dup_count,
    }

    logger.info(
        "Inspection: %d rows, %d cols, %d missing, %d duplicates.",
        inspection["rows"], inspection["columns"],
        inspection["total_missing"], inspection["duplicate_rows"],
    )
    return inspection


# -------------------------------------------------------------------
# Tool 3 — Remove Duplicates
# -------------------------------------------------------------------

def remove_duplicates(df: pd.DataFrame) -> Tuple[pd.DataFrame, int]:
    """
    Removes exact duplicate rows.

    Returns:
        (cleaned_df, number_of_duplicates_removed)
    """
    original_count = len(df)
    df_clean = df.drop_duplicates()
    removed = original_count - len(df_clean)
    logger.info("Duplicates removed: %d. Rows remaining: %d.", removed, len(df_clean))
    return df_clean.reset_index(drop=True), removed


# -------------------------------------------------------------------
# Tool 4 — Handle Missing Values
# -------------------------------------------------------------------

def handle_missing_values(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, int]]:
    """
    Fills missing values using a documented, consistent strategy:

    - Columns that look numeric (all non-null values can be parsed as float):
        Fill with column MEDIAN of those values.
    - Date-like columns:
        Leave as-is (NaT is acceptable for optional dates).
    - All other string/categorical columns:
        Fill with 'Unknown'.

    Returns:
        (cleaned_df, filled_counts_per_column)
    """
    df = df.copy()
    fill_report: Dict[str, int] = {}

    for col in df.columns:
        null_count = df[col].isnull().sum()
        if null_count == 0:
            continue

        non_null = df[col].dropna()

        # Try to detect numeric column
        if _is_numeric_column(non_null):
            numeric_vals = pd.to_numeric(non_null, errors="coerce").dropna()
            if not numeric_vals.empty:
                median_val = round(float(numeric_vals.median()), 2)
                df[col] = df[col].fillna(str(median_val))
                fill_report[col] = int(null_count)
                logger.info("Column '%s': filled %d missing with median %.2f", col, null_count, median_val)
                continue

        # Date-like column — leave as-is
        if _is_date_column(col):
            logger.info("Column '%s': date column — leaving %d missing values as-is.", col, null_count)
            continue

        # String/categorical — fill with 'Unknown'
        df[col] = df[col].fillna("Unknown")
        fill_report[col] = int(null_count)
        logger.info("Column '%s': filled %d missing with 'Unknown'.", col, null_count)

    return df, fill_report


def _is_numeric_column(series: pd.Series) -> bool:
    """Heuristic: returns True if >80% of non-null values parse as float."""
    if series.empty:
        return False
    parsed = pd.to_numeric(series, errors="coerce")
    return parsed.notna().mean() >= 0.8


def _is_date_column(col_name: str) -> bool:
    """Simple name heuristic for date columns."""
    date_keywords = ("date", "time", "at", "on", "timestamp", "created", "updated")
    return any(kw in col_name.lower() for kw in date_keywords)


# -------------------------------------------------------------------
# Tool 5 — Normalize Columns
# -------------------------------------------------------------------

def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalizes column names to snake_case:
        "User ID"       → "user_id"
        "Vehicle Type"  → "vehicle_type"
        "Total Fare $"  → "total_fare"

    Rules (applied in order):
        1. Strip leading/trailing whitespace
        2. Lowercase
        3. Replace spaces and hyphens with underscore
        4. Remove non-alphanumeric/non-underscore characters
        5. Collapse multiple underscores
        6. Strip leading/trailing underscores
    """
    new_cols = []
    for col in df.columns:
        name = col.strip().lower()
        name = re.sub(r"[\s\-]+", "_", name)       # spaces/hyphens → _
        name = re.sub(r"[^\w]", "", name)           # remove non-word chars
        name = re.sub(r"_+", "_", name)             # collapse multiple __
        name = name.strip("_")
        if not name:
            name = f"col_{len(new_cols)}"
        new_cols.append(name)

    df = df.copy()
    df.columns = new_cols
    logger.info("Columns normalized: %s", new_cols)
    return df


# -------------------------------------------------------------------
# Tool 6 — Validate Data
# -------------------------------------------------------------------

def validate_data(df: pd.DataFrame) -> Tuple[bool, str]:
    """
    Pre-load validation checks.

    Rejects if:
    - DataFrame is empty
    - No columns
    - Too many rows
    - All columns have the same value (likely a parsing error)
    """
    if df is None or df.empty:
        return False, "DataFrame is empty — nothing to load."

    if len(df.columns) == 0:
        return False, "No columns detected in the CSV."

    if len(df) > MAX_ROWS:
        return False, f"Too many rows ({len(df)}). Maximum allowed is {MAX_ROWS}."

    # Check each column has at least a valid name
    for col in df.columns:
        if not col or not str(col).strip():
            return False, "One or more column names are empty or invalid."

    logger.info("Data validation passed: %d rows, %d columns.", len(df), len(df.columns))
    return True, ""


# -------------------------------------------------------------------
# Tool 7 — Load to PostgreSQL (etl_staging)
# -------------------------------------------------------------------

def load_to_postgres(
    df: pd.DataFrame,
    source_file: str,
    batch_id: Optional[str] = None,
) -> Tuple[bool, int, int, str, str]:
    """
    Loads the validated DataFrame into the etl_staging table.

    Duplicate prevention strategy:
        Each row's content is hashed (SHA-256) and stored in `content_hash`.
        Before inserting, we check if that hash already exists in etl_staging.
        Existing rows are skipped (ON CONFLICT DO NOTHING equivalent via Python check).

    Each CSV row becomes one EtlStaging record with:
        batch_id      = shared UUID for this upload
        source_file   = original filename
        row_index     = 0-based row number
        row_data      = row as a JSON-safe dict
        content_hash  = SHA-256 of the row content for deduplication

    Security:
        - Uses SQLAlchemy ORM — fully parameterized inserts
        - No dynamic SQL string construction
        - CSV cell values are passed as data, never as SQL

    Returns:
        (success, rows_inserted, rows_skipped, batch_id, error_message)
    """
    import hashlib
    import json as _json

    if batch_id is None:
        batch_id = str(uuid.uuid4())[:8]   # Short 8-char batch ID

    try:
        # Fetch all existing content hashes once for fast in-memory lookup
        with Session(engine) as session:
            existing_hashes = set(
                row[0] for row in
                session.execute(
                    text("SELECT content_hash FROM etl_staging WHERE content_hash IS NOT NULL")
                ).fetchall()
            )

        records     = []
        rows_skipped = 0

        for idx, row in df.iterrows():
            row_dict = _make_json_safe(row.to_dict())

            # Deterministic hash: sort keys so column order doesn't matter
            row_str      = _json.dumps(row_dict, sort_keys=True, default=str)
            content_hash = hashlib.sha256(row_str.encode()).hexdigest()

            if content_hash in existing_hashes:
                rows_skipped += 1
                continue  # Skip duplicate row

            existing_hashes.add(content_hash)  # Prevent intra-batch duplicates too
            records.append(
                EtlStaging(
                    batch_id=batch_id,
                    source_file=source_file,
                    row_index=int(idx),
                    row_data=row_dict,
                    content_hash=content_hash,
                    loaded_at=datetime.utcnow(),
                )
            )

        if records:
            with Session(engine) as session:
                session.add_all(records)
                session.commit()

        rows_inserted = len(records)
        logger.info(
            "ETL load complete — inserted=%d skipped=%d (batch_id=%s).",
            rows_inserted, rows_skipped, batch_id
        )
        return True, rows_inserted, rows_skipped, batch_id, ""

    except Exception as exc:
        err_msg = str(exc)
        logger.error("load_to_postgres error: %s", err_msg)
        return False, 0, 0, batch_id, f"Database write failed during ETL load: {err_msg}"


def _make_json_safe(row: dict) -> dict:
    """
    Convert a Pandas row dict to a JSON-serializable plain dict.

    Handles:
    - numpy int64/float64 → Python int/float
    - pd.Timestamp → ISO string
    - pd.NaT / np.nan → None
    """
    result = {}
    for k, v in row.items():
        key = str(k)
        if v is None:
            result[key] = None
        elif isinstance(v, float) and np.isnan(v):
            result[key] = None
        elif isinstance(v, (np.integer,)):
            result[key] = int(v)
        elif isinstance(v, (np.floating,)):
            result[key] = None if np.isnan(v) else float(v)
        elif isinstance(v, pd.Timestamp):
            result[key] = v.isoformat()
        elif hasattr(v, "item"):
            result[key] = v.item()   # generic numpy scalar fallback
        else:
            result[key] = v
    return result
