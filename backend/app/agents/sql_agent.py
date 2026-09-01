"""
agents/sql_agent.py — SQL Agent: converts natural language → validated SQL.

Responsibilities:
  1. Build a prompt containing the DB schema and the user's question.
  2. Call Groq LLM to generate a SQL SELECT statement.
  3. Extract the raw SQL from the LLM response.
  4. Return the SQL string (validation happens in the LangGraph node, not here).

Security:
  - Schema info (column names/types) is passed to the LLM — NOT credentials.
  - LLM is instructed to generate only SELECT statements.
  - Actual validation is done by validate_sql() in tools/sql_tools.py.

Design note:
  This module only generates SQL.
  Validation and execution are separate concerns handled in graph/workflow.py.
"""
import logging
import re
from langchain_core.messages import SystemMessage, HumanMessage
from app.llm.groq_client import get_llm
from app.tools.sql_tools import get_schema_info

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# System prompt for SQL generation
# -------------------------------------------------------------------
SQL_SYSTEM_PROMPT = """You are a PostgreSQL SQL expert for a ride-analytics database.

Your ONLY job is to generate a single, safe PostgreSQL SELECT query based on the user's question.

{schema}

STRICT RULES — follow these exactly:
1. Output ONLY the SQL query — no explanation, no markdown, no backticks, no commentary.
2. Generate ONLY a SELECT statement. NEVER generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, GRANT, or REVOKE.
3. Use ONLY the tables and columns listed in the schema above. Do not invent tables or columns.
4. Do NOT use multiple statements. One SELECT only.
5. Do NOT access system tables (pg_catalog, information_schema, etc.).
6. If you cannot answer the question with a SELECT query, output exactly: CANNOT_GENERATE
7. Use proper PostgreSQL syntax (e.g., DATE_TRUNC for date operations).
8. For revenue, always filter: WHERE payment_status = 'success'
9. All amounts are in Indian Rupees (Rs.).
10. Always add LIMIT 50 to any query that returns full rows (SELECT * or all columns), unless the user is asking for an aggregate (SUM, COUNT, AVG, MAX, MIN).
11. DATES: If the user asks for "this year" or "current year", remember the dataset is from 2024. Use EXTRACT(YEAR FROM ride_date) = 2024. Do NOT use CURRENT_DATE.
12. AUTHENTICATION / SECURITY QUERIES:
    - If the user asks for passwords, password hashes, credentials, JWTs, tokens, or auth_users, you MUST refuse safely.
    - Output exactly: CANNOT_GENERATE_AUTH
13. AMBIGUOUS REQUESTS — VERY IMPORTANT:
    - If the user explicitly names a table (e.g. "users", "rides", "vehicles", "payments", "ratings", "top 5 users", "rides by city"), generate the query immediately. Do NOT output CLARIFICATION_NEEDED.
    - If the user's request is completely ambiguous and does NOT name a table (e.g., "show all records", "show me everything", "show records from Pune"), do NOT guess.
    - Instead, output exactly: CLARIFICATION_NEEDED:users,vehicles,rides,payments,ratings
    - Only list the tables that are actually relevant.
"""


def generate_sql(question: str) -> str:
    """
    Generates a SQL SELECT statement for the given natural-language question.

    Returns:
        A SQL string, or "CANNOT_GENERATE" if the LLM cannot answer.
    """
    schema = get_schema_info()
    system_prompt = SQL_SYSTEM_PROMPT.format(schema=schema)

    llm = get_llm()

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Question: {question}\n\nSQL Query:"),
    ]

    logger.info("Calling Groq LLM for SQL generation. Question: %r", question)

    response = llm.invoke(messages)
    raw = response.content.strip()

    logger.info("LLM raw response: %r", raw)

    # Extract SQL — strip markdown code fences if the LLM added them despite instructions
    sql = _extract_sql(raw)

    logger.info("Extracted SQL: %r", sql)
    return sql


def _extract_sql(raw: str) -> str:
    """
    Extracts the SQL query from the LLM response.
    Handles cases where the LLM wraps output in markdown despite instructions.
    """
    # Remove ```sql ... ``` or ``` ... ``` fences
    fenced = re.search(r"```(?:sql)?\s*(.*?)\s*```", raw, re.DOTALL | re.IGNORECASE)
    if fenced:
        return fenced.group(1).strip()

    # Return the raw text (already clean in most cases)
    return raw.strip()
