"""
agents/answer_generator.py — Generates a natural-language answer from SQL results.

The LLM receives:
  - The original question
  - The ACTUAL row count from PostgreSQL
  - A sample of the data rows (capped to avoid token overload)
  - The SQL that was executed

Critical rule:
  The LLM MUST use the actual row_count provided, NOT count the sample rows.
  The sample may be truncated but the count is always the real PostgreSQL result.

This separation ensures:
  LLM = reasoning/language
  PostgreSQL = source of truth for all numbers
"""
import json
import logging
from langchain_core.messages import SystemMessage, HumanMessage
from app.llm.groq_client import get_llm

logger = logging.getLogger(__name__)

# Max rows passed to the LLM in the prompt (avoids token overflow).
# The actual count is always passed separately so the LLM never under-counts.
_SAMPLE_SIZE = 30

ANSWER_SYSTEM_PROMPT = """You are a helpful data analyst assistant.

Your job is to explain a database query result in clear, concise natural language and extract key observations.

Rules:
1. Base your answer ONLY on the data provided. Do NOT invent or assume any numbers.
2. CRITICAL — AGGREGATES vs ROW COUNTS: 
   - If the query returns an aggregate value (e.g., COUNT, SUM, AVG), use the actual value inside the result row.
   - For example, if the result is `[{"count": 30}]`, it means there are 30 items, NOT 1 item.
   - Never interpret "1 row" as "1 item" when the row contains an aggregate value.
   - You will also be provided the number of rows returned by the query. Use this ONLY if the query returns a list of individual records (e.g., "Show users from Mumbai" returning 5 rows means 5 users).
3. Be concise. Summaries should be 1-2 sentences.
4. Use Indian Rupees (₹) for monetary values.
5. If the result is empty, say "No matching records were found."
6. Do NOT mention SQL, databases, or technical terms in your answer.
7. Do NOT repeat the question.
8. NEVER list every record. Only provide aggregate insights.

You MUST respond ONLY with a valid JSON object in this exact format:
{
  "summary": "Concise 1-2 sentence summary of what the data shows.",
  "key_observations": [
    "Observation 1 (e.g. Average revenue is ₹135)",
    "Observation 2"
  ]
}
"""


def generate_answer(question: str, sql: str, data: list) -> dict:
    """
    Generates a natural-language answer from the database result.

    Args:
        question: The original user question
        sql:      The SQL that was executed (for context)
        data:     The FULL rows returned by PostgreSQL (list of dicts)

    Returns:
        A dict with 'summary' and 'key_observations'
    """
    llm = get_llm().bind(response_format={"type": "json_object"})

    actual_count = len(data)
    sample       = data[:_SAMPLE_SIZE]
    data_str     = json.dumps(sample, indent=2, default=str)

    count_note = (
        f"IMPORTANT: The database query returned {actual_count} row(s) in total."
        + (f" The sample below shows the first {len(sample)} rows."
           if len(sample) < actual_count else "")
    )

    user_message = f"Question: {question}\n\n{count_note}\n\nDatabase result (sample):\n{data_str}"

    messages = [
        SystemMessage(content=ANSWER_SYSTEM_PROMPT),
        HumanMessage(content=user_message),
    ]

    logger.info("Generating JSON answer for question: %r | actual_count=%d", question, actual_count)

    response = llm.invoke(messages)
    try:
        raw = response.content.strip()
        # strip markdown code blocks if the LLM returned any
        if raw.startswith("```json"):
            raw = raw[7:-3].strip()
        return json.loads(raw)
    except Exception as e:
        logger.error("Failed to parse JSON response: %s", e)
        return {
            "summary": "Data retrieved successfully.",
            "key_observations": [f"{actual_count} row(s) returned."]
        }
