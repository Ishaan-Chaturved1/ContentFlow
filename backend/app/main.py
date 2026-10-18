import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base
from app.routers import health, campaigns, posts

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("contentflow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure database tables exist (SQLite or PostgreSQL)
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema synchronized successfully.")
    except Exception as exc:
        logger.error(f"Error initializing database tables: {exc}", exc_info=True)
        raise exc

    logger.info("ContentFlow AI Backend started successfully.")
    yield
    # Shutdown
    logger.info("ContentFlow AI Backend shutting down.")


settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered social media content planning & workflow automation platform for luxury design agencies.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration: strict whitelist of allowed frontend origins (local + production Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Exported-Count"]
)

# Include Routers
app.include_router(health.router)
app.include_router(campaigns.router)
app.include_router(posts.router)


@app.get("/")
def root():
    curr_settings = get_settings()
    return {
        "app": curr_settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/health",
        "demo_mode": curr_settings.active_llm_provider == "demo"
    }


if __name__ == "__main__":
    import uvicorn
    curr_settings = get_settings()
    port = int(os.environ.get("PORT", curr_settings.PORT))
    uvicorn.run("app.main:app", host=curr_settings.HOST, port=port, reload=False)
