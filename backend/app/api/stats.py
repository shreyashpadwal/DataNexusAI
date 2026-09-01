"""
api/stats.py — GET /api/stats endpoint (Module 5).

Returns safe, application-level statistics from PostgreSQL.

Security:
    - Credentials are never exposed
    - Only aggregate/count data is returned
    - No raw user data is returned
    - Read-only queries
"""
import logging
from fastapi import APIRouter
from sqlalchemy import text

from app.database.connection import engine
from app.schemas.api_schemas import StatsResponse

logger = logging.getLogger(__name__)
router = APIRouter()

APP_VERSION = "1.0.0"


@router.get(
    "/stats",
    response_model=StatsResponse,
    tags=["Stats"],
    summary="Application-level statistics",
)
def get_stats() -> StatsResponse:
    """
    Returns aggregate statistics from the database.
    Safe for public consumption — no credentials, no raw data.
    """
    logger.info("stats_requested")
    try:
        with engine.connect() as conn:
            users      = conn.execute(text("SELECT COUNT(*) FROM users")).scalar() or 0
            vehicles   = conn.execute(text("SELECT COUNT(*) FROM vehicles")).scalar() or 0
            rides      = conn.execute(text("SELECT COUNT(*) FROM rides")).scalar() or 0
            payments   = conn.execute(text("SELECT COUNT(*) FROM payments")).scalar() or 0
            ratings    = conn.execute(text("SELECT COUNT(*) FROM ratings")).scalar() or 0
            revenue    = conn.execute(
                text("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'success'")
            ).scalar() or 0.0
            avg_rating = conn.execute(
                text("SELECT COALESCE(AVG(rating), 0) FROM ratings")
            ).scalar() or 0.0
            etl_rows   = conn.execute(
                text("SELECT COUNT(*) FROM etl_staging")
            ).scalar() or 0

        stats = StatsResponse(
            total_users     = int(users),
            total_vehicles  = int(vehicles),
            total_rides     = int(rides),
            total_payments  = int(payments),
            total_ratings   = int(ratings),
            total_revenue   = round(float(revenue), 2),
            average_rating  = round(float(avg_rating), 2),
            etl_rows_loaded = int(etl_rows),
            version         = APP_VERSION,
        )
        logger.info(
            "stats_completed users=%d rides=%d revenue=%.2f",
            stats.total_users, stats.total_rides, stats.total_revenue
        )
        return stats

    except Exception as exc:
        logger.error("stats_error: %s", exc)
        # Return zeros rather than crashing — dashboard degrades gracefully
        return StatsResponse(
            total_users=0, total_vehicles=0, total_rides=0,
            total_payments=0, total_ratings=0,
            total_revenue=0.0, average_rating=0.0,
            etl_rows_loaded=0, version=APP_VERSION,
        )
