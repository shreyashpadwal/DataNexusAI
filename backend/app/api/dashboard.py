"""
api/dashboard.py — GET /api/dashboard/stats endpoint.

Returns aggregated chart data for the Data Dashboard page.

Security:
    - Protected by JWT (same as /api/stats)
    - All queries are read-only SELECT statements
    - Period filter uses a fixed server-side enum — no SQL injection possible
    - No raw user data (emails, passwords, phone numbers) is returned
    - Only aggregate business metrics (revenue, rides, city sums) are exposed
"""
import logging
from typing import Optional
from fastapi import APIRouter, Query
from sqlalchemy import text

from app.database.connection import engine
from app.schemas.api_schemas import (
    DashboardStatsResponse,
    RevenueOverTimeItem,
    RevenueByCityItem,
    RidesByCityItem,
    TopVehicleItem,
)

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Safe period-to-SQL mapping ─────────────────────────────────────────────
# The period parameter is matched against this fixed dict — never interpolated
# into SQL as a raw string.  Unknown values fall back to "all".
PERIOD_WHERE: dict[str, str] = {
    "all":  "1=1",
    "2024": "r.ride_date >= '2024-01-01' AND r.ride_date < '2025-01-01'",
    "30d":  "r.ride_date >= CURRENT_DATE - INTERVAL '30 days'",
    "7d":   "r.ride_date >= CURRENT_DATE - INTERVAL '7 days'",
}


def _where(period: str) -> str:
    """Return a safe WHERE clause fragment for the requested period."""
    return PERIOD_WHERE.get(period, PERIOD_WHERE["all"])


@router.get(
    "/dashboard/stats",
    response_model=DashboardStatsResponse,
    tags=["Dashboard"],
    summary="Aggregated dashboard chart data",
)
def get_dashboard_stats(
    period: Optional[str] = Query(default="all", description="Filter period: all | 2024 | 30d | 7d"),
) -> DashboardStatsResponse:
    """
    Returns aggregated analytics for the dashboard page.
    All data comes from the existing rides/payments/users/vehicles tables.
    """
    safe_period = period if period in PERIOD_WHERE else "all"
    where = _where(safe_period)
    logger.info("dashboard_stats_requested period=%s", safe_period)

    try:
        with engine.connect() as conn:

            # ── Revenue over time (grouped by calendar month) ──────────────
            rot_sql = text(f"""
                SELECT
                    TO_CHAR(r.ride_date, 'YYYY-MM') AS month,
                    COALESCE(SUM(p.amount), 0)       AS revenue
                FROM rides r
                JOIN payments p ON p.ride_id = r.id
                WHERE p.payment_status = 'success'
                  AND {where}
                GROUP BY month
                ORDER BY month
            """)
            rot_rows = conn.execute(rot_sql).fetchall()
            revenue_over_time = [
                RevenueOverTimeItem(month=str(row[0]), revenue=float(row[1]))
                for row in rot_rows
            ]

            # ── Revenue by city ────────────────────────────────────────────
            rbc_sql = text(f"""
                SELECT
                    COALESCE(u.city, 'Unknown') AS city,
                    COALESCE(SUM(p.amount), 0)   AS revenue
                FROM rides r
                JOIN users   u ON u.id = r.user_id
                JOIN payments p ON p.ride_id = r.id
                WHERE p.payment_status = 'success'
                  AND {where}
                GROUP BY u.city
                ORDER BY revenue DESC
                LIMIT 10
            """)
            rbc_rows = conn.execute(rbc_sql).fetchall()
            revenue_by_city = [
                RevenueByCityItem(city=str(row[0]), revenue=float(row[1]))
                for row in rbc_rows
            ]

            # ── Rides by city ──────────────────────────────────────────────
            rides_sql = text(f"""
                SELECT
                    COALESCE(u.city, 'Unknown') AS city,
                    COUNT(r.id)                  AS rides
                FROM rides r
                JOIN users u ON u.id = r.user_id
                WHERE {where}
                GROUP BY u.city
                ORDER BY rides DESC
                LIMIT 10
            """)
            rides_rows = conn.execute(rides_sql).fetchall()
            rides_by_city = [
                RidesByCityItem(city=str(row[0]), rides=int(row[1]))
                for row in rides_rows
            ]

            # ── Top vehicles by revenue ────────────────────────────────────
            veh_sql = text(f"""
                SELECT
                    COALESCE(v.model, 'Unknown') AS model,
                    COALESCE(SUM(p.amount), 0)   AS revenue,
                    COUNT(r.id)                   AS rides
                FROM rides r
                JOIN vehicles v  ON v.id = r.vehicle_id
                JOIN payments p  ON p.ride_id = r.id
                WHERE p.payment_status = 'success'
                  AND {where}
                GROUP BY v.model
                ORDER BY revenue DESC
                LIMIT 10
            """)
            veh_rows = conn.execute(veh_sql).fetchall()
            top_vehicles = [
                TopVehicleItem(model=str(row[0]), revenue=float(row[1]), rides=int(row[2]))
                for row in veh_rows
            ]

        logger.info(
            "dashboard_stats_completed months=%d cities=%d vehicles=%d",
            len(revenue_over_time), len(revenue_by_city), len(top_vehicles),
        )
        return DashboardStatsResponse(
            revenue_over_time=revenue_over_time,
            revenue_by_city=revenue_by_city,
            rides_by_city=rides_by_city,
            top_vehicles=top_vehicles,
        )

    except Exception as exc:
        logger.error("dashboard_stats_error: %s", exc)
        # Return empty lists — frontend shows "No data available" gracefully
        return DashboardStatsResponse(
            revenue_over_time=[],
            revenue_by_city=[],
            rides_by_city=[],
            top_vehicles=[],
        )
