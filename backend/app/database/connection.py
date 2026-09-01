"""
database/connection.py — SQLAlchemy engine and session setup.

Two engines:
  - engine        : read-write (used by ETL in Module 3)
  - analytics_engine : intended as read-only (used by SQL Agent in Module 2)

In development both point to the same DB with the same user.
In production you would create a dedicated read-only PostgreSQL user
and set ANALYTICS_DATABASE_URL accordingly.
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings

settings = get_settings()

# -------------------------------------------------------------------
# Read-write engine  (ETL writes, admin operations)
# -------------------------------------------------------------------
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,   # Detect stale connections automatically
    pool_size=2,          # Reduced for Neon free tier (max 5-25 connections)
    max_overflow=3,       # At most 5 total connections per engine
    pool_recycle=300,     # Recycle connections every 5 minutes (Neon idle timeout)
    echo=False,           # Set True to log SQL in development
)

# -------------------------------------------------------------------
# Analytics engine  (SQL Agent — SELECT only in production)
# -------------------------------------------------------------------
analytics_engine = create_engine(
    settings.analytics_url,
    pool_pre_ping=True,
    pool_size=2,
    max_overflow=3,
    pool_recycle=300,
    echo=False,
)

# -------------------------------------------------------------------
# Session factories
# -------------------------------------------------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AnalyticsSession = sessionmaker(autocommit=False, autoflush=False, bind=analytics_engine)


# -------------------------------------------------------------------
# Declarative base — all ORM models inherit from this
# -------------------------------------------------------------------
class Base(DeclarativeBase):
    pass


# -------------------------------------------------------------------
# FastAPI dependency helpers
# -------------------------------------------------------------------
def get_db():
    """Yield a read-write DB session. Use as a FastAPI dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_analytics_db():
    """Yield an analytics (read-only intent) DB session."""
    db = AnalyticsSession()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Return True if the database is reachable, False otherwise."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
