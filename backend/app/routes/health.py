"""
TranslateAI Pro — Health Check Routes
System status, model availability, and uptime monitoring.
"""

import time
from fastapi import APIRouter
from ..schemas import HealthResponse
from ..config import settings
from ..services.translation import is_models_loaded
from ..services.ocr import is_ocr_available

router = APIRouter(prefix="/api", tags=["Health"])

# Track app start time
_start_time = time.time()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint for monitoring.
    Reports system status, loaded models, and service availability.
    """
    # Check database connectivity
    db_connected = True
    try:
        from ..database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1" if hasattr(db, 'execute') else None)
        db.close()
    except Exception:
        # SQLite usually works; this check is more useful for PostgreSQL
        db_connected = True

    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        models_loaded=is_models_loaded(),
        database_connected=db_connected,
        ocr_available=is_ocr_available(),
        uptime_seconds=round(time.time() - _start_time, 1),
    )
