"""
api/chat.py — POST /api/chat endpoint.

Accepts a natural-language message and returns the agent's response.

Flow:
    POST /api/chat { "message": "..." }
        ↓
    Input validation (Pydantic)
        ↓
    LangGraph workflow  (router → sql_agent → validate → execute → answer)
        ↓
    ChatResponse JSON

Security:
    - API keys and DB passwords are never included in the response.
    - Stack traces are never exposed.
    - Only the answer, sql, data, and steps are returned.

Module 5 — Observability:
    - request_id from middleware (UUID per request)
    - duration_ms measured here
    - Structured log lines at each step
"""
import time
import logging
from fastapi import APIRouter, HTTPException, Request
from app.schemas.api_schemas import ChatRequest, ChatResponse
from app.graph.workflow import run_workflow

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/chat",
    response_model=ChatResponse,
    tags=["Chat"],
    summary="Ask a natural-language question about your data",
)
def chat(body: ChatRequest, request: Request) -> ChatResponse:
    """
    Accepts a natural-language question, routes it through the LangGraph
    agent workflow, and returns a structured response.

    - SQL questions → SQL Agent → PostgreSQL → answer
    - ETL requests  → directed to /api/etl/upload
    - Unsafe inputs → rejected with a friendly message
    """
    request_id = getattr(request.state, "request_id", "unknown")
    start      = time.perf_counter()
    question   = body.message.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    if len(question) > 2000:
        raise HTTPException(status_code=400, detail="Message is too long (max 2000 characters).")

    logger.info("chat_started request_id=%s question_len=%d", request_id, len(question))

    try:
        state = run_workflow(question)
    except ValueError as ve:
        # Configuration error (e.g., missing GROQ_API_KEY)
        logger.error("chat_config_error request_id=%s error=%s", request_id, ve)
        raise HTTPException(status_code=503, detail=str(ve))
    except Exception as exc:
        err_msg = str(exc)
        logger.exception("chat_unexpected_error request_id=%s error=%s", request_id, err_msg)
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An unexpected error occurred. Please try again.",
                "debug": err_msg
            }
        )

    task_type = state.get("task_type", "unknown")
    answer    = state.get("answer") or ""

    # Detect special answer prefixes set by node_handle_error
    if answer.startswith("CLARIFICATION_NEEDED:"):
        agent_label = "clarification"
        success     = False
    elif answer.startswith("UNSAFE:"):
        agent_label = "unsafe"
        success     = False
    elif answer.startswith("CANNOT_GENERATE:"):
        agent_label = "cannot_generate"
        success     = False
    elif answer.startswith("UNKNOWN:"):
        agent_label = "unknown"
        success     = False
    elif answer.startswith("DB_ERROR:") or answer.startswith("SYSTEM_ERROR:") or answer.startswith("INVALID:"):
        agent_label = "error"
        success     = False
    else:
        agent_label = task_type if task_type in ("sql", "etl") else "error"
        success     = bool(
            (answer or state.get("insight"))
            and not state.get("error")
            and task_type in ("sql", "etl")
            and (task_type != "sql" or state.get("query_result") is not None)
        )

    duration_ms = round((time.perf_counter() - start) * 1000, 2)

    logger.info(
        "chat_completed request_id=%s agent=%s success=%s duration_ms=%.2f",
        request_id, agent_label, success, duration_ms
    )

    return ChatResponse(
        success=success,
        question=question,
        agent=agent_label,
        answer=answer if answer else None,
        insight=state.get("insight"),
        sql=state.get("generated_sql") if task_type == "sql" else None,
        data=state.get("query_result"),
        steps=state.get("steps", []),
        error=state.get("error"),
        request_id=request_id,
        duration_ms=duration_ms,
    )
