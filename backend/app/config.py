"""
config.py — Application settings loaded from .env
All configuration comes from environment variables. Nothing is hardcoded.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str
    analytics_database_url: str = ""  # Falls back to database_url if not set

    # App
    secret_key: str = "datanexus-dev-secret"
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 10

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # Groq — LLM provider for Module 2+
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"  # Override via GROQ_MODEL in .env

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore unknown env vars

    @property
    def analytics_url(self) -> str:
        """Return the analytics DB URL, falling back to the main DB URL."""
        return self.analytics_database_url or self.database_url

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """Cached settings — loaded once, reused everywhere."""
    return Settings()
