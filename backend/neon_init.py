"""
neon_init.py — Neon PostgreSQL initialization for DataNexus AI.

This replaces the local init_db.py for Neon-managed databases.
Neon creates and manages the database itself — we only need to:
  1. Test the connection
  2. Create tables (CREATE TABLE IF NOT EXISTS — safe to re-run)
  3. Seed demo data (only if tables are empty)
  4. Verify row counts

Usage (from the backend/ directory):
    python neon_init.py

Requirements:
  - backend/.env must exist with DATABASE_URL pointing to Neon
  - pip install -r requirements.txt must have been run
"""
import os
import sys
from dotenv import load_dotenv
from sqlalchemy import text

# Load .env from this directory (backend/)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in .env")
    sys.exit(1)

# Redact the URL for safe display
def _redact(url: str) -> str:
    """Return URL with password replaced by ***"""
    try:
        at = url.index("@")
        scheme_end = url.index("://") + 3
        creds = url[scheme_end:at]
        if ":" in creds:
            user, _ = creds.split(":", 1)
            return url[:scheme_end] + user + ":***@" + url[at + 1:]
    except Exception:
        pass
    return "***redacted***"

print("=" * 55)
print("DataNexus AI — Neon PostgreSQL Initialization")
print("=" * 55)
print(f"Connecting to: {_redact(DATABASE_URL)}")


# ── Step 1: Test connection ──────────────────────────────────────
def test_connection(engine):
    print("\n[1] Testing connection...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 AS ok"))
            row = result.fetchone()
            assert row[0] == 1
        print("    ✓ Connection successful")
        return True
    except Exception as e:
        print(f"    ✗ Connection FAILED: {e}")
        return False


# ── Step 2: Create tables ────────────────────────────────────────
def create_tables(engine):
    print("\n[2] Creating tables (CREATE IF NOT EXISTS — safe to re-run)...")
    # Import all models to register them with Base metadata
    from app.database.connection import Base
    import app.models.db_models  # noqa: F401 — registers all ORM models

    try:
        Base.metadata.create_all(bind=engine)
        print("    ✓ Tables verified: auth_users, users, vehicles, rides, payments, ratings, etl_staging")
    except Exception as e:
        print(f"    ✗ Table creation FAILED: {e}")
        sys.exit(1)


# ── Step 3: Seed data (only if tables are empty) ─────────────────
def seed_data(engine):
    print("\n[3] Checking seed data...")
    seed_file = os.path.join(os.path.dirname(__file__), "..", "database", "seed.sql")
    seed_file = os.path.abspath(seed_file)

    if not os.path.exists(seed_file):
        print(f"    WARNING: Seed file not found at {seed_file}. Skipping.")
        return

    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()

    if count > 0:
        print(f"    ✓ Seed data already present ({count} users). Skipping — no data overwritten.")
        return

    print(f"    Loading seed data from {seed_file} ...")
    with open(seed_file, "r", encoding="utf-8") as f:
        sql_content = f.read()

    try:
        with engine.begin() as conn:
            conn.execute(text(sql_content))
        print("    ✓ Seed data loaded successfully.")
    except Exception as e:
        print(f"    ✗ Seeding FAILED: {e}")
        sys.exit(1)


# ── Step 4: Verify row counts ────────────────────────────────────
def verify(engine):
    print("\n[4] Verifying row counts...")
    tables = ["auth_users", "users", "vehicles", "rides", "payments", "ratings", "etl_staging"]
    with engine.connect() as conn:
        for table in tables:
            try:
                count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                print(f"    {table:20s} → {count} rows")
            except Exception as e:
                print(f"    {table:20s} → ERROR: {e}")

        try:
            revenue = conn.execute(
                text("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'success'")
            ).scalar()
            print(f"\n    Revenue (success payments): Rs.{float(revenue):,.2f}")
        except Exception:
            pass

        try:
            avg_rating = conn.execute(text("SELECT ROUND(AVG(rating)::numeric, 2) FROM ratings")).scalar()
            print(f"    Average rating:             {avg_rating}")
        except Exception:
            pass

    print("\n✓ Neon database initialization complete!")


# ── Main ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    from app.database.connection import engine

    ok = test_connection(engine)
    if not ok:
        sys.exit(1)

    create_tables(engine)
    seed_data(engine)
    verify(engine)
