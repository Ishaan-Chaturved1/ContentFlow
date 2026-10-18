import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.config import get_settings
from app.services.llm_provider import get_llm_provider

logger = logging.getLogger("contentflow.health")
router = APIRouter(tags=["Health"])


def run_health_check(db: Session):
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Health check database ping failed: {e}")
        db_status = "unhealthy: database unreachable"

    current_settings = get_settings()
    provider = get_llm_provider()
    is_demo = getattr(provider, "generate_calendar", None) is not None and provider.__class__.__name__ == "DemoProvider"

    return {
        "status": "healthy" if db_status == "ok" else "degraded",
        "database": db_status,
        "configured_provider": current_settings.active_llm_provider,
        "active_provider": provider.__class__.__name__,
        "is_demo_mode": is_demo,
        "environment": current_settings.ENVIRONMENT,
        "project": current_settings.PROJECT_NAME
    }


@router.get("/api/health")
def api_health(db: Session = Depends(get_db)):
    return run_health_check(db)


@router.get("/health")
def root_health(db: Session = Depends(get_db)):
    """Convenience health endpoint for cloud hosting providers (e.g. Render)."""
    return run_health_check(db)
