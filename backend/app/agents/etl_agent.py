"""
agents/etl_agent.py — ETL operation selector using Groq LLM.

The LLM is a DECISION-MAKER here, not a code generator.

It receives:
    - The user's instruction (e.g., "remove duplicates and load")
    - A compact inspection summary of the CSV

It outputs:
    - A JSON array of operation names to run (from the allowed list)

It NEVER:
    - Generates Python code
    - Accesses the database directly
    - Sees the actual CSV data (only metadata)
    - Receives credentials

Allowed operations (enforced by application, not just prompt):
    remove_duplicates       - Drop duplicate rows
    handle_missing_values   - Fill NaN with sensible defaults
    normalize_columns       - Clean up column names to snake_case

Fixed operations (always run — not LLM-controlled):
    read_csv / inspect / validate / load_to_postgres
"""
import json
import logging
from typing import List, Dict, Any

from langchain_core.messages import SystemMessage, HumanMessage
from app.llm.groq_client import get_llm
from app.tools.etl_tools import ALLOWED_OPERATIONS

logger = logging.getLogger(__name__)

ETL_SYSTEM_PROMPT = """You are an ETL coordinator for a CSV data pipeline.

You will receive:
1. The user's instruction
2. A short inspection report about the uploaded CSV

Your job is to select which optional data-cleaning operations to run.

ALLOWED OPERATIONS (choose only from these):
  - "remove_duplicates"      : Remove exact duplicate rows
  - "handle_missing_values"  : Fill missing values (median for numbers, 'Unknown' for text)
  - "normalize_columns"      : Clean column names to snake_case (e.g. "User ID" → "user_id")

RULES:
1. Reply with ONLY a valid JSON array of operation names. Nothing else.
2. Only include operations that are actually needed based on the inspection data.
3. If no cleaning is needed, reply with: []
4. Order matters: put normalize_columns first if needed, then remove_duplicates, then handle_missing_values.
5. Do NOT invent new operations. Only use operations from the list above.

Examples of valid responses:
  ["remove_duplicates", "handle_missing_values"]
  ["normalize_columns", "remove_duplicates"]
  ["handle_missing_values"]
  []
"""


def select_etl_operations(
    user_instruction: str,
    inspection: Dict[str, Any],
) -> List[str]:
    """
    Uses Groq LLM to decide which ETL operations to run.

    The LLM receives only:
    - The user's instruction
    - Compact inspection metadata (no actual row data)

    Returns:
        A list of validated operation names (subset of ALLOWED_OPERATIONS).
        Any unrecognized names from the LLM are silently removed.
    """
    llm = get_llm()

    # Build compact inspection summary for the LLM
    missing_summary = (
        ", ".join(f"{col}: {cnt} missing" for col, cnt in inspection.get("missing_values", {}).items())
        or "none"
    )
    inspection_text = (
        f"Rows: {inspection.get('rows', '?')}\n"
        f"Columns ({inspection.get('columns', '?')}): "
        f"{', '.join(inspection.get('column_names', []))}\n"
        f"Missing values: {missing_summary}\n"
        f"Duplicate rows: {inspection.get('duplicate_rows', 0)}"
    )

    user_message = (
        f"User instruction: {user_instruction}\n\n"
        f"CSV inspection:\n{inspection_text}\n\n"
        f"Which operations should I run? Reply with a JSON array only."
    )

    messages = [
        SystemMessage(content=ETL_SYSTEM_PROMPT),
        HumanMessage(content=user_message),
    ]

    logger.info("ETL Agent selecting operations. Inspection: %s", inspection)

    try:
        response = llm.invoke(messages)
        raw = response.content.strip()
        logger.info("ETL Agent raw response: %r", raw)

        # Parse JSON — if the LLM wraps in markdown, strip it
        if "```" in raw:
            import re
            match = re.search(r"\[.*?\]", raw, re.DOTALL)
            raw = match.group(0) if match else "[]"

        operations = json.loads(raw)

        # Validate against allowlist — reject anything not in ALLOWED_OPERATIONS
        validated = [op for op in operations if op in ALLOWED_OPERATIONS]

        if len(validated) != len(operations):
            rejected = [op for op in operations if op not in ALLOWED_OPERATIONS]
            logger.warning("ETL Agent returned unknown operations (rejected): %s", rejected)

        logger.info("ETL operations selected: %s", validated)
        return validated if validated else _fallback_operations(inspection)

    except (json.JSONDecodeError, AttributeError) as e:
        logger.warning("ETL Agent JSON parse failed (%s). Using smart fallback.", e)
        return _fallback_operations(inspection)
    except Exception as e:
        logger.error("ETL Agent error: %s", e)
        return _fallback_operations(inspection)


def _fallback_operations(inspection: dict) -> List[str]:
    """
    Fallback when LLM fails or returns empty list.
    Selects operations automatically based on inspection data.
    Always safe: only picks operations that are actually needed.
    """
    ops = []
    if inspection.get("duplicate_rows", 0) > 0:
        ops.append("remove_duplicates")
    if inspection.get("total_missing", 0) > 0:
        ops.append("handle_missing_values")
    logger.info("ETL fallback operations selected: %s", ops)
    return ops
