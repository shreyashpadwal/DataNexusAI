"""
main.py — FastAPI application entry point for DataNexus AI.

Startup sequence:
  1. Configure structured logging
  2. Load settings from .env
  3. Register ObservabilityMiddleware (request_id + timing)
  4. Register CORS middleware
  5. Mount API routers
  6. Create DB tables on startup
  7. Expose OpenAPI docs at /docs

Modules:
  Module 1 — /api/health, /api/database/*
  Module 2 — /api/chat  (LangGraph SQL Agent)
  Module 3 — /api/etl/upload  (ETL Agent)
  Module 4 — React frontend (separate process, port 5173)
  Module 5 — /api/stats, ObservabilityMiddleware, structured logging
"""
import os
import logging
import logging.config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api import health, database
from app.api import chat   # Module 2
from app.api import etl    # Module 3
from app.api import stats  # Module 5
from app.database.connection import engine
from app.models.db_models import Base
from app.middleware.observability import ObservabilityMiddleware

settings = get_settings()

# -------------------------------------------------------------------
# Configure structured logging (Module 5)
# -------------------------------------------------------------------
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "structured": {
            "format": "%(asctime)s %(levelname)-8s %(name)s %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "structured",
            "stream": "ext://sys.stdout",
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console"],
    },
    "loggers": {
        "datanexus": {"level": "INFO", "propagate": True},
        "uvicorn.access": {"level": "WARNING"},   # Suppress noisy per-request uvicorn logs
    },
}
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("datanexus.startup")

# -------------------------------------------------------------------
# Create FastAPI app
# -------------------------------------------------------------------
app = FastAPI(
    title="DataNexus AI",
    description=(
        "AI-powered data analytics platform — natural language SQL analytics "
        "and ETL operations over PostgreSQL, powered by LangGraph + Groq."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# -------------------------------------------------------------------
# ObservabilityMiddleware — request_id + timing (Module 5)
# MUST be added before CORSMiddleware to time the full request
# -------------------------------------------------------------------
app.add_middleware(ObservabilityMiddleware)

# -------------------------------------------------------------------
# CORS — allow React dev server (localhost:5173) and configured origins
# -------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Ensure upload directory exists + create any new DB tables at startup
# -------------------------------------------------------------------
os.makedirs(settings.upload_dir, exist_ok=True)


@app.on_event("startup")
def on_startup():
    """Create any tables that don't exist yet (e.g. etl_staging added in Module 3)."""
    Base.metadata.create_all(bind=engine)
    logger.info("DataNexus AI started — tables verified, upload dir ready.")


from app.api import auth   # Auth module
from app.api import dashboard  # Dashboard module
from fastapi import Depends
from app.auth_utils import get_current_user

# -------------------------------------------------------------------
# Register routers
# -------------------------------------------------------------------
app.include_router(health.router,     prefix="/api", tags=["Health"])
app.include_router(auth.router,       prefix="/api/auth", tags=["Auth"])

# Protected routes
protect = [Depends(get_current_user)]
app.include_router(database.router,   prefix="/api", tags=["Database"],  dependencies=protect)
app.include_router(chat.router,       prefix="/api", tags=["Chat"],      dependencies=protect)
app.include_router(etl.router,        prefix="/api", tags=["ETL"],       dependencies=protect)
app.include_router(stats.router,      prefix="/api", tags=["Stats"],     dependencies=protect)
app.include_router(dashboard.router,  prefix="/api", tags=["Dashboard"], dependencies=protect)


# -------------------------------------------------------------------
# Root
# -------------------------------------------------------------------
@app.get("/", include_in_schema=False)
def root():
    return {
        "application": "DataNexus AI",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "stats": "/api/stats",
    }
