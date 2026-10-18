import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ContentFlow AI"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Database
    DATABASE_URL: str = "sqlite:///./contentflow.db"

    # LLM Provider: "gemini" | "openai" | "claude" | "demo"
    LLM_PROVIDER: str = "demo"

    # API Keys
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    # Models
    GEMINI_MODEL: str = "gemini-2.5-flash"
    OPENAI_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    # Frontend Origin for CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


def get_settings() -> Settings:
    """Always returns current settings, reloading .env if modified."""
    return Settings()


settings = get_settings()
