"""
schemas/api_schemas.py — Pydantic models for API request/response validation.

These are NOT the same as the ORM models.
Pydantic schemas define what the API accepts and returns.
ORM models define what the database stores.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# -----------------------------------------------------------------------
# Health & Status
# -----------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    database: str
    version: str = "1.0.0"


# -----------------------------------------------------------------------
# User schemas
# -----------------------------------------------------------------------

class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    city: Optional[str] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# -----------------------------------------------------------------------
# Vehicle schemas
# -----------------------------------------------------------------------

class VehicleBase(BaseModel):
    registration_no: str
    vehicle_type: str
    model: Optional[str] = None
    driver_name: Optional[str] = None
    city: Optional[str] = None
    active: bool = True


class VehicleResponse(VehicleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# -----------------------------------------------------------------------
# Ride schemas
# -----------------------------------------------------------------------

class RideResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    vehicle_id: int
    pickup_location: Optional[str]
    dropoff_location: Optional[str]
    distance_km: Optional[Decimal]
    duration_min: Optional[int]
    ride_date: datetime
    status: str


# -----------------------------------------------------------------------
# Payment schemas
# -----------------------------------------------------------------------

class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ride_id: int
    amount: Decimal
    payment_method: Optional[str]
    payment_status: str
    paid_at: Optional[datetime]


# -----------------------------------------------------------------------
# Rating schemas
# -----------------------------------------------------------------------

class RatingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ride_id: int
    user_id: int
    vehicle_id: int
    rating: Optional[Decimal]
    comment: Optional[str]
    rated_at: datetime


# -----------------------------------------------------------------------
# Database test / stats response
# -----------------------------------------------------------------------

class DatabaseStatsResponse(BaseModel):
    total_users: int
    total_vehicles: int
    total_rides: int
    total_payments: int
    total_ratings: int
    total_revenue: float
    average_rating: float


# -----------------------------------------------------------------------
# Generic error response
# -----------------------------------------------------------------------

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


# -----------------------------------------------------------------------
# Chat / Agent schemas  (Module 2)
# -----------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {"message": "What is the total revenue?"}
        }
    )


class ChatInsight(BaseModel):
    summary: str
    key_observations: List[str]

class ChatResponse(BaseModel):
    success: bool
    question: str
    agent: str                          # "sql", "etl", or "error"
    answer: Optional[str] = None
    insight: Optional[ChatInsight] = None
    sql: Optional[str] = None           # Generated SQL (SQL agent only)
    data: Optional[list] = None         # Raw query result rows
    steps: Optional[list] = None        # Execution trace
    error: Optional[str] = None
    # Module 5 — Observability
    request_id: Optional[str] = None    # UUID per request
    duration_ms: Optional[float] = None # Total processing time in milliseconds


# -----------------------------------------------------------------------
# ETL schemas  (Module 3)
# -----------------------------------------------------------------------

class EtlResponse(BaseModel):
    success:                  bool
    agent:                    str = "etl"
    filename:                 str
    batch_id:                 Optional[str] = None
    rows_read:                int = 0
    columns:                  Optional[List[str]] = None
    operations_performed:     List[str] = []
    duplicates_removed:       int = 0    # in-CSV duplicate rows removed before load
    missing_values_handled:   int = 0
    rows_loaded:              int = 0    # rows actually inserted into PostgreSQL
    rows_skipped:             int = 0    # rows skipped because they already exist in DB
    destination:              str = "etl_staging"
    answer:                   Optional[str] = None
    error:                    Optional[str] = None
    # Module 5 — Observability
    request_id:               Optional[str] = None
    duration_ms:              Optional[float] = None


# -----------------------------------------------------------------------
# Stats schema  (Module 5)
# -----------------------------------------------------------------------

class StatsResponse(BaseModel):
    """Safe, application-level statistics — no credentials or secrets."""
    total_users:       int
    total_vehicles:    int
    total_rides:       int
    total_payments:    int
    total_ratings:     int
    total_revenue:     float
    average_rating:    float
    etl_rows_loaded:   int   # Rows in etl_staging
    version:           str = "1.0.0"


# -----------------------------------------------------------------------
# Dashboard chart data schemas
# -----------------------------------------------------------------------

class RevenueOverTimeItem(BaseModel):
    month: str        # "YYYY-MM"
    revenue: float


class RevenueByCityItem(BaseModel):
    city: str
    revenue: float


class RidesByCityItem(BaseModel):
    city: str
    rides: int


class TopVehicleItem(BaseModel):
    model: str
    revenue: float
    rides: int


class DashboardStatsResponse(BaseModel):
    """Aggregated analytics data for the dashboard charts."""
    revenue_over_time: List[RevenueOverTimeItem]
    revenue_by_city:   List[RevenueByCityItem]
    rides_by_city:     List[RidesByCityItem]
    top_vehicles:      List[TopVehicleItem]
