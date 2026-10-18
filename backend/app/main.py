import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
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
    # Startup: ensure SQLite database tables exist
    logger.info("Initializing SQLite database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("ContentFlow AI Backend started successfully.")
    yield
    # Shutdown
    logger.info("ContentFlow AI Backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered social media content planning & workflow automation platform for luxury design agencies.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
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
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "demo_mode": settings.LLM_PROVIDER == "demo"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
