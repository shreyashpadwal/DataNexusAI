"""
middleware/observability.py — Lightweight observability middleware.

Adds per-request:
    - X-Request-ID header (UUID)
    - X-Duration-Ms header (processing time in milliseconds)
    - Structured log lines at request start/end

Security:
    - No credentials, secrets, or database URLs are logged
    - Request bodies are NOT logged (may contain user data)
    - Only metadata is captured (path, method, status, timing)
"""
import time
import uuid
import logging

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("datanexus.request")


class ObservabilityMiddleware(BaseHTTPMiddleware):
    """
    Middleware that:
    1. Generates a unique request_id for every request
    2. Measures total request duration
    3. Emits structured log lines (start + end)
    4. Adds X-Request-ID and X-Duration-Ms to response headers
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())[:8]   # Short 8-char ID — readable in logs
        start_time = time.perf_counter()

        # Store on request.state so API handlers can access it
        request.state.request_id = request_id

        # Log request start (no body — could contain sensitive data)
        logger.info(
            "request_started request_id=%s method=%s path=%s",
            request_id, request.method, request.url.path
        )

        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(
                "request_error request_id=%s path=%s duration_ms=%.2f error=%s",
                request_id, request.url.path, duration_ms, str(exc)[:200]
            )
            raise

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Add headers — useful for debugging with browser devtools or curl
        response.headers["X-Request-ID"]  = request_id
        response.headers["X-Duration-Ms"] = str(duration_ms)

        logger.info(
            "request_completed request_id=%s path=%s status=%s duration_ms=%.2f",
            request_id, request.url.path, response.status_code, duration_ms
        )

        return response
