"""
models/db_models.py — SQLAlchemy ORM models for DataNexus AI.

Tables:
    users       — ride customers
    vehicles    — fleet vehicles
    rides       — individual ride records (central fact table)
    payments    — payment per ride
    ratings     — customer rating per ride

Relationships mirror the SQL foreign keys in database/schema.sql.
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Numeric, Boolean,
    DateTime, Text, ForeignKey, CheckConstraint, JSON
)
from sqlalchemy.orm import relationship
from app.database.connection import Base


class AuthUser(Base):
    __tablename__ = "auth_users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<AuthUser id={self.id} email={self.email!r}>"


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(150), unique=True, nullable=False, index=True)
    phone         = Column(String(20))
    city          = Column(String(80), index=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

    # Relationships
    rides   = relationship("Ride", back_populates="user")
    ratings = relationship("Rating", back_populates="user")

    def __repr__(self):
        return f"<User id={self.id} name={self.name!r} city={self.city!r}>"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id              = Column(Integer, primary_key=True, index=True)
    registration_no = Column(String(20), unique=True, nullable=False)
    vehicle_type    = Column(String(50), nullable=False, index=True)  # Sedan, SUV, Auto, Bike
    model           = Column(String(100))
    driver_name     = Column(String(100))
    city            = Column(String(80), index=True)
    active          = Column(Boolean, default=True)
    created_at      = Column(DateTime, default=datetime.utcnow)

    # Relationships
    rides   = relationship("Ride", back_populates="vehicle")
    ratings = relationship("Rating", back_populates="vehicle")

    def __repr__(self):
        return f"<Vehicle id={self.id} type={self.vehicle_type!r} model={self.model!r}>"


class Ride(Base):
    __tablename__ = "rides"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vehicle_id       = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    pickup_location  = Column(String(150))
    dropoff_location = Column(String(150))
    distance_km      = Column(Numeric(8, 2))
    duration_min     = Column(Integer)
    ride_date        = Column(DateTime, nullable=False, index=True)
    status           = Column(String(30), default="completed", index=True)
    created_at       = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user    = relationship("User", back_populates="rides")
    vehicle = relationship("Vehicle", back_populates="rides")
    payment = relationship("Payment", back_populates="ride", uselist=False)  # one-to-one
    ratings = relationship("Rating", back_populates="ride")

    def __repr__(self):
        return f"<Ride id={self.id} status={self.status!r} date={self.ride_date}>"


class Payment(Base):
    __tablename__ = "payments"

    id             = Column(Integer, primary_key=True, index=True)
    ride_id        = Column(Integer, ForeignKey("rides.id"), nullable=False, unique=True, index=True)
    amount         = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50))   # Cash, UPI, Card, Wallet
    payment_status = Column(String(30), default="success")  # success, failed, pending
    paid_at        = Column(DateTime)

    # Relationships
    ride = relationship("Ride", back_populates="payment")

    def __repr__(self):
        return f"<Payment id={self.id} amount={self.amount} method={self.payment_method!r}>"


class Rating(Base):
    __tablename__ = "ratings"

    id         = Column(Integer, primary_key=True, index=True)
    ride_id    = Column(Integer, ForeignKey("rides.id"), nullable=False, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    rating     = Column(Numeric(3, 1))
    comment    = Column(Text)
    rated_at   = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="rating_range_check"),
    )

    # Relationships
    ride    = relationship("Ride", back_populates="ratings")
    user    = relationship("User", back_populates="ratings")
    vehicle = relationship("Vehicle", back_populates="ratings")

    def __repr__(self):
        return f"<Rating id={self.id} rating={self.rating} ride_id={self.ride_id}>"


class EtlStaging(Base):
    """
    Staging table for CSV uploads processed by the ETL Agent.

    Design decision:
        We deliberately do NOT insert uploaded data into users/vehicles/rides/etc.
        This prevents a bad CSV from corrupting the core analytics data.
        All ETL loads land here first.

    Schema:
        batch_id      — UUID string that groups all rows from one upload
        source_file   — original filename
        row_index     — row position within the original CSV (0-based)
        row_data      — each CSV row stored as a JSON object (flexible schema)
        content_hash  — SHA-256 of row_data for idempotent deduplication
        loaded_at     — timestamp of the load
    """
    __tablename__ = "etl_staging"

    id           = Column(Integer, primary_key=True, index=True)
    batch_id     = Column(String(50), nullable=False, index=True)
    source_file  = Column(String(255), nullable=False)
    row_index    = Column(Integer, nullable=False)
    row_data     = Column(JSON, nullable=False)
    content_hash = Column(String(64), nullable=True, unique=True, index=True)
    loaded_at    = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<EtlStaging batch={self.batch_id!r} row={self.row_index}>"
