"""
api/database.py — Database verification endpoints (Module 1 only).

These endpoints exist purely to verify that FastAPI ↔ PostgreSQL works.
They will be kept as utility/debug endpoints in later modules.

Endpoints:
    GET /api/database/stats   — row counts and aggregate stats
    GET /api/database/users   — first 10 users (sample)
    GET /api/database/vehicles — first 10 vehicles (sample)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from typing import List

from app.database.connection import get_db
from app.models.db_models import User, Vehicle, Ride, Payment, Rating
from app.schemas.api_schemas import (
    DatabaseStatsResponse, UserResponse, VehicleResponse, ErrorResponse
)

router = APIRouter()


@router.get(
    "/database/stats",
    response_model=DatabaseStatsResponse,
    tags=["Database"],
    summary="Get database row counts and aggregate statistics",
)
def get_database_stats(db: Session = Depends(get_db)):
    """
    Returns basic statistics from all tables.
    Used to verify that seed data was loaded correctly.
    """
    try:
        total_users    = db.query(func.count(User.id)).scalar()
        total_vehicles = db.query(func.count(Vehicle.id)).scalar()
        total_rides    = db.query(func.count(Ride.id)).scalar()
        total_payments = db.query(func.count(Payment.id)).scalar()
        total_ratings  = db.query(func.count(Rating.id)).scalar()
        total_revenue  = db.query(func.sum(Payment.amount)).scalar() or 0
        avg_rating     = db.query(func.avg(Rating.rating)).scalar() or 0

        return DatabaseStatsResponse(
            total_users=total_users,
            total_vehicles=total_vehicles,
            total_rides=total_rides,
            total_payments=total_payments,
            total_ratings=total_ratings,
            total_revenue=float(total_revenue),
            average_rating=round(float(avg_rating), 2),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Database query failed. Check connection and seed data.",
        )


@router.get(
    "/database/users",
    response_model=List[UserResponse],
    tags=["Database"],
    summary="Sample of first 10 users",
)
def get_sample_users(db: Session = Depends(get_db)):
    """Returns first 10 users. Used to verify user table and ORM models."""
    try:
        users = db.query(User).limit(10).all()
        return users
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch users.")


@router.get(
    "/database/vehicles",
    response_model=List[VehicleResponse],
    tags=["Database"],
    summary="Sample of first 10 vehicles",
)
def get_sample_vehicles(db: Session = Depends(get_db)):
    """Returns first 10 vehicles. Used to verify vehicle table and ORM models."""
    try:
        vehicles = db.query(Vehicle).limit(10).all()
        return vehicles
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch vehicles.")
