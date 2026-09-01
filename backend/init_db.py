"""
init_db.py — One-time database initialization script.

Run this ONCE to:
  1. Create the datanexus_ai PostgreSQL database
  2. Create all tables from SQLAlchemy models
  3. Load seed data from database/seed.sql

Usage (from the backend/ directory):
    python init_db.py

Requirements:
  - PostgreSQL must be running
  - .env must exist with DATABASE_URL
  - pip install -r requirements.txt must have been run
"""
import os
import sys
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlalchemy import text
from dotenv import load_dotenv

# Load .env from this directory (backend/)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in .env")
    sys.exit(1)

# -------------------------------------------------------------------
# Parse connection components from DATABASE_URL
# Format: postgresql://user:password@host:port/dbname
# -------------------------------------------------------------------
def parse_db_url(url: str):
    """Parse a PostgreSQL URL into connection components."""
    # Remove the scheme
    url = url.replace("postgresql://", "").replace("postgres://", "")
    # Split user:pass from host:port/dbname
    user_pass, host_db = url.split("@", 1)
    user, password = user_pass.split(":", 1)
    # URL-decode password (%40 → @)
    from urllib.parse import unquote
    password = unquote(password)
    # Split host:port from dbname
    host_port, dbname = host_db.split("/", 1)
    if ":" in host_port:
        host, port = host_port.split(":", 1)
    else:
        host, port = host_port, "5432"
    return user, password, host, int(port), dbname


def create_database_if_not_exists(user, password, host, port, dbname):
    """Connect to postgres (default DB) and create datanexus_ai if needed."""
    print(f"Connecting to PostgreSQL at {host}:{port} as '{user}'...")
    conn = psycopg2.connect(
        host=host, port=port, user=user, password=password, database="postgres"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()

    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (dbname,))
    exists = cursor.fetchone()

    if exists:
        print(f"Database '{dbname}' already exists. Skipping creation.")
    else:
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(dbname)))
        print(f"Database '{dbname}' created successfully.")

    cursor.close()
    conn.close()


def create_tables():
    """Create all tables via SQLAlchemy models."""
    print("Creating tables...")
    # Import models so SQLAlchemy knows about them
    from app.database.connection import Base, engine
    import app.models.db_models  # noqa: F401 — registers all models

    Base.metadata.create_all(bind=engine)
    print("Tables created: users, vehicles, rides, payments, ratings")


def seed_data():
    """Load seed data from database/seed.sql."""
    seed_file = os.path.join(os.path.dirname(__file__), "..", "database", "seed.sql")
    seed_file = os.path.abspath(seed_file)

    if not os.path.exists(seed_file):
        print(f"WARNING: Seed file not found at {seed_file}. Skipping seed.")
        return

    print(f"Loading seed data from {seed_file}...")
    from app.database.connection import engine

    with open(seed_file, "r", encoding="utf-8") as f:
        sql_content = f.read()

    with engine.connect() as conn:
        # Check if already seeded
        result = conn.execute(text("SELECT COUNT(*) FROM users"))
        count = result.scalar()
        if count > 0:
            print(f"Seed data already present ({count} users found). Skipping seed.")
            return

        # Execute seed SQL
        conn.execute(text(sql_content))
        conn.commit()
        print("Seed data loaded successfully.")


def verify():
    """Print row counts to verify everything worked."""
    print("\n--- Verification ---")
    from app.database.connection import engine

    with engine.connect() as conn:
        for table in ["users", "vehicles", "rides", "payments", "ratings"]:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            print(f"  {table}: {count} rows")

        revenue = conn.execute(
            text("SELECT SUM(amount) FROM payments WHERE payment_status = 'success'")
        ).scalar()
        print(f"  Total revenue: Rs.{revenue:,.2f}")

        avg_rating = conn.execute(text("SELECT AVG(rating) FROM ratings")).scalar()
        print(f"  Average rating: {avg_rating:.2f}")
    print("\n✓ Module 1 database initialization complete!")


if __name__ == "__main__":
    user, password, host, port, dbname = parse_db_url(DATABASE_URL)

    print("=" * 50)
    print("DataNexus AI — Database Initialization")
    print("=" * 50)

    # Step 1: Create database
    create_database_if_not_exists(user, password, host, port, dbname)

    # Step 2: Create tables
    create_tables()

    # Step 3: Seed data
    seed_data()

    # Step 4: Verify
    verify()
