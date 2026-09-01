"""
api/health.py — Health check endpoint.

GET /api/health
    Returns service status and database connectivity.
    Safe to call from monitoring tools — never exposes credentials.
"""
from fastapi import APIRouter
from app.database.connection import check_db_connection
from app.schemas.api_schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Returns application health status and database connectivity.
    Used by Module 1 verification and future monitoring.
    """
    db_ok = check_db_connection()
    return HealthResponse(
        status="ok",
        database="connected" if db_ok else "unavailable",
    )
