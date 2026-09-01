"""
agents/router.py — Request Router: classifies user input as SQL or ETL.

The router uses Groq LLM with a simple classification prompt.
It returns one of three task types:
  "sql"     — analytics/data query  → SQL Agent
  "etl"     — data processing task  → ETL Agent (Module 3)
  "unknown" — cannot be handled     → Friendly error

Design:
  The router is intentionally simple — it just classifies.
  It does not execute anything. The LangGraph workflow decides what to do next.

Module 3 extension:
  When the ETL Agent is added, the graph will route "etl" to etl_agent.py.
  No changes to this file will be needed.
"""
import logging
from langchain_core.messages import SystemMessage, HumanMessage
from app.llm.groq_client import get_llm

logger = logging.getLogger(__name__)

ROUTER_SYSTEM_PROMPT = """You are a request classifier for a data analytics application.

Classify the user's request into exactly ONE of these categories:

- "sql": The user is asking a question about data that can be answered with a SELECT query.
  Examples: total revenue, number of rides, top vehicles, average rating, monthly trends, 
  count of users, highest earning city, etc.

- "etl": The user wants to process, clean, transform, or upload data.
  Examples: upload CSV, remove duplicates, clean dataset, handle missing values,
  load data into database, transform columns, etc.

- "unknown": The request is unclear, unsupported, or dangerous.
  Examples: run a script, delete records, drop tables, access system files, etc.

Rules:
1. Reply with ONLY one word: sql, etl, or unknown
2. No explanation. No punctuation. Just the single word.
3. If in doubt between sql and unknown, prefer sql.
4. Requests containing DROP, DELETE, UPDATE, INSERT are "unknown".
"""


def classify_request(question: str) -> str:
    """
    Classifies the user's request as 'sql', 'etl', or 'unknown'.

    Returns:
        One of: "sql", "etl", "unknown"
    """
    llm = get_llm()

    messages = [
        SystemMessage(content=ROUTER_SYSTEM_PROMPT),
        HumanMessage(content=f"Request: {question}"),
    ]

    logger.info("Classifying request: %r", question)

    response = llm.invoke(messages)
    classification = response.content.strip().lower()

    # Normalize — only accept expected values
    if classification not in ("sql", "etl", "unknown"):
        logger.warning("Unexpected classification %r — defaulting to 'unknown'", classification)
        classification = "unknown"

    logger.info("Classification result: %s", classification)
    return classification
