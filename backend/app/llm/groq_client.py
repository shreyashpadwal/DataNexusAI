"""
llm/groq_client.py — Groq LLM client setup.

Creates a single shared ChatGroq instance used by all agents.
The API key comes from .env — it is never exposed through any API response.

Usage:
    from app.llm.groq_client import get_llm
    llm = get_llm()
    response = llm.invoke("Hello")
"""
from functools import lru_cache
from langchain_groq import ChatGroq
from app.config import get_settings


@lru_cache()
def get_llm() -> ChatGroq:
    """
    Returns a cached ChatGroq instance.
    lru_cache ensures the client is created only once per process.
    """
    settings = get_settings()

    if not settings.groq_api_key:
        raise ValueError(
            "GROQ_API_KEY is not set in .env. "
            "Please add your Groq API key to backend/.env"
        )

    return ChatGroq(
        api_key=settings.groq_api_key,
        model_name=settings.groq_model,
        temperature=0,        # Deterministic — important for SQL generation
        max_tokens=1024,
    )
