from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.config import settings, get_settings
from app.services.llm_provider import get_llm_provider

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Verify DB connectivity
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    current_settings = get_settings()
    provider = get_llm_provider()
    is_demo = getattr(provider, "generate_calendar", None) is not None and provider.__class__.__name__ == "DemoProvider"

    return {
        "status": "healthy" if db_status == "ok" else "degraded",
        "database": db_status,
        "configured_provider": current_settings.LLM_PROVIDER,
        "active_provider": provider.__class__.__name__,
        "is_demo_mode": is_demo,
        "environment": current_settings.ENVIRONMENT,
        "project": current_settings.PROJECT_NAME
    }
