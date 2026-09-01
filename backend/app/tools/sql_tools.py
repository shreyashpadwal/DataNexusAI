"""
tools/sql_tools.py — SQL utilities for the SQL Agent.

Three responsibilities:
  1. get_schema_info()   — Returns a schema description string for the LLM prompt.
                          The LLM sees column names and types, NOT credentials.
  2. validate_sql()      — Uses sqlglot to parse and verify only SELECT is present.
                          Rejects any DDL/DML or multi-statement input.
  3. execute_sql()       — Runs the validated SQL via the analytics engine.
                          Returns rows as a list of plain dicts (JSON-safe).

Security design:
  - Credentials never leave the backend.
  - LLM only receives schema text, not connection strings.
  - Only validated SELECT statements reach PostgreSQL.
"""
import logging
from typing import Tuple, List, Dict, Any

import sqlglot
from sqlalchemy import text

from app.database.connection import analytics_engine

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Forbidden SQL keywords — used as a fast pre-check
# Keywords representing DML/DDL operations that are strictly forbidden.
# Only SELECT is allowed. We also block common auth/security columns/tables.
FORBIDDEN_KEYWORDS = [
    "insert", "update", "delete", "drop", "alter", "truncate",
    "create", "grant", "revoke", "exec", "execute", "call",
    "replace", "merge", "upsert", "password", "password_hash",
    "hashed_password", "access_token", "refresh_token", "jwt",
    "secret", "api_key", "token", "auth_users"
]


# -------------------------------------------------------------------
# Database schema description provided to the LLM
# Based on the ACTUAL Module 1 schema — columns verified from db_models.py
# -------------------------------------------------------------------
SCHEMA_INFO = """
PostgreSQL Database: datanexus_ai
Domain: Indian ride/transportation analytics

TABLE: users
  id          INTEGER  PRIMARY KEY
  name        VARCHAR  Customer full name
  email       VARCHAR  Customer email (unique)
  phone       VARCHAR  Phone number
  city        VARCHAR  City of the customer (Mumbai, Delhi, Bangalore, Chennai, Pune, Hyderabad, Kolkata)
  created_at  TIMESTAMP

TABLE: vehicles
  id              INTEGER  PRIMARY KEY
  registration_no VARCHAR  Vehicle registration plate (unique)
  vehicle_type    VARCHAR  Type: 'Sedan', 'SUV', 'Auto', 'Bike'
  model           VARCHAR  Vehicle model name (e.g., 'Honda City', 'Toyota Innova')
  driver_name     VARCHAR  Driver's name
  city            VARCHAR  City where vehicle operates
  active          BOOLEAN  Whether vehicle is currently active
  created_at      TIMESTAMP

TABLE: rides
  id               INTEGER  PRIMARY KEY
  user_id          INTEGER  FK → users.id
  vehicle_id       INTEGER  FK → vehicles.id
  pickup_location  VARCHAR  Starting location name
  dropoff_location VARCHAR  Ending location name
  distance_km      NUMERIC  Distance of ride in kilometres
  duration_min     INTEGER  Duration in minutes
  ride_date        TIMESTAMP  Date and time of ride (rides are from Jan 2024 – Dec 2024)
  status           VARCHAR  'completed', 'cancelled', or 'ongoing'
  created_at       TIMESTAMP

TABLE: payments
  id              INTEGER  PRIMARY KEY
  ride_id         INTEGER  FK → rides.id (one payment per ride)
  amount          NUMERIC  Payment amount in Indian Rupees (Rs.)
  payment_method  VARCHAR  'Cash', 'UPI', 'Card', or 'Wallet'
  payment_status  VARCHAR  'success', 'failed', or 'pending'
  paid_at         TIMESTAMP

TABLE: ratings
  id          INTEGER  PRIMARY KEY
  ride_id     INTEGER  FK → rides.id
  user_id     INTEGER  FK → users.id
  vehicle_id  INTEGER  FK → vehicles.id
  rating      NUMERIC  Rating score from 1.0 to 5.0
  comment     TEXT     Customer review text
  rated_at    TIMESTAMP

KEY RELATIONSHIPS:
  users     1 ──< rides >── 1  vehicles
  rides     1 ──< payments    (one payment per ride)
  rides     1 ──< ratings
  users     1 ──< ratings
  vehicles  1 ──< ratings

IMPORTANT NOTES:
  - Revenue = SUM(payments.amount) WHERE payment_status = 'success'
  - Completed rides use status = 'completed'
  - All monetary amounts are in Indian Rupees (Rs.)
  - Date range of data: January 2024 to December 2024
"""


def get_schema_info() -> str:
    """Returns the schema description to include in the LLM prompt."""
    return SCHEMA_INFO.strip()


# -------------------------------------------------------------------
# SQL Validation
# -------------------------------------------------------------------

def validate_sql(sql: str) -> Tuple[bool, str]:
    """
    Validates that the SQL is a safe, single SELECT statement.

    Returns:
        (True, "")            — SQL is valid and safe
        (False, reason_str)   — SQL is invalid, with a reason

    Approach:
      1. Fast keyword pre-check on lowercased SQL
      2. sqlglot parse to confirm statement type
      3. Multi-statement detection
    """
    if not sql or not sql.strip():
        return False, "Empty SQL statement."

    sql_stripped = sql.strip().rstrip(";")
    sql_lower = sql_stripped.lower()

    # --- Fast pre-check: reject obvious forbidden keywords ---
    for keyword in FORBIDDEN_KEYWORDS:
        # Word-boundary check: keyword must appear as a standalone word
        import re
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, sql_lower):
            logger.warning("SQL rejected — forbidden keyword '%s' detected.", keyword)
            return False, f"SQL contains forbidden operation: '{keyword.upper()}'. Only SELECT queries are allowed."

    # --- Multi-statement check: reject if semicolon splits multiple statements ---
    # Allow semicolons inside string literals but reject multiple actual statements
    try:
        statements = sqlglot.parse(sql_stripped, dialect="postgres")
    except Exception as parse_err:
        logger.warning("SQL parse error: %s", parse_err)
        return False, f"SQL could not be parsed: {parse_err}"

    if len(statements) > 1:
        logger.warning("SQL rejected — multiple statements detected.")
        return False, "Multiple SQL statements are not allowed. Please provide a single SELECT query."

    if not statements:
        return False, "No valid SQL statement found."

    stmt = statements[0]

    # --- Statement type check: must be SELECT ---
    if not isinstance(stmt, sqlglot.expressions.Select):
        stmt_type = type(stmt).__name__.upper()
        logger.warning("SQL rejected — statement type is '%s', expected SELECT.", stmt_type)
        return False, f"Only SELECT statements are allowed. Got: {stmt_type}."

    logger.info("SQL validation passed.")
    return True, ""


# -------------------------------------------------------------------
# SQL Execution
# -------------------------------------------------------------------

def execute_sql(sql: str, limit: int = 500) -> Tuple[bool, List[Dict[str, Any]], str]:
    """
    Executes a validated SELECT statement using the analytics engine.

    Args:
        sql:   A pre-validated SELECT statement
        limit: Maximum rows to return (prevents accidentally huge result sets)

    Returns:
        (True,  rows_as_list_of_dicts, "")     — success
        (False, [],                    error)   — failure
    """
    # Append LIMIT if not already present — safety cap
    sql_safe = sql.strip().rstrip(";")
    sql_lower = sql_safe.lower()
    if "limit" not in sql_lower:
        sql_safe = f"{sql_safe} LIMIT {limit}"

    logger.info("Executing SQL: %s", sql_safe)

    try:
        with analytics_engine.connect() as conn:
            result = conn.execute(text(sql_safe))
            columns = list(result.keys())
            rows = result.fetchall()

        # Convert to list of plain dicts — JSON-serializable
        # Handle: datetime → ISO string, Decimal/float → float, None → None, rest → str
        import decimal
        import datetime as dt

        def _safe(val: Any) -> Any:
            if val is None:
                return None
            if isinstance(val, (dt.datetime, dt.date, dt.time)):
                return val.isoformat()
            if isinstance(val, decimal.Decimal):
                return float(val)
            if isinstance(val, float):
                return val
            if isinstance(val, int):
                return val
            if isinstance(val, bool):
                return val
            if isinstance(val, str):
                return val
            # Fallback: try float, then str
            try:
                return float(val)
            except (TypeError, ValueError):
                return str(val)

        data = [
            {col: _safe(val) for col, val in zip(columns, row)}
            for row in rows
        ]

        logger.info("SQL execution returned %d rows.", len(data))
        return True, data, ""

    except Exception as exc:
        err_msg = str(exc)
        logger.error("SQL execution error: %s\nQuery was: %s", err_msg, sql_safe)
        # Return the actual error so it can be logged/displayed in the dev console
        return False, [], f"Database query failed: {err_msg}"
