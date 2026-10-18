import os
from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ContentFlow AI"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Database: SQLite local, SQLite persistent disk (/var/data/contentflow.db), or PostgreSQL
    DATABASE_URL: str = "sqlite:///./contentflow.db"

    # LLM Provider: "gemini" | "openai" | "claude" | "demo"
    # Both LLM_PROVIDER and AI_PROVIDER are supported
    LLM_PROVIDER: str = "demo"
    AI_PROVIDER: Optional[str] = None

    # Google Gemini Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Alternative LLM Providers
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    # CORS Frontend URLs / Origins
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    FRONTEND_URL: Optional[str] = None
    ALLOWED_ORIGINS: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def active_llm_provider(self) -> str:
        """Returns effective LLM provider, checking AI_PROVIDER first then LLM_PROVIDER."""
        if self.AI_PROVIDER and self.AI_PROVIDER.strip():
            return self.AI_PROVIDER.strip().lower()
        return self.LLM_PROVIDER.strip().lower()

    def get_allowed_origins(self) -> List[str]:
        """
        Builds deduplicated list of allowed CORS origins for both local dev and production.
        Supports single URLs, comma-separated lists in FRONTEND_URL or ALLOWED_ORIGINS.
        """
        defaults = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        origins = set(defaults)

        candidates = [self.FRONTEND_ORIGIN, self.FRONTEND_URL, self.ALLOWED_ORIGINS]
        for candidate in candidates:
            if candidate and candidate.strip():
                # Support comma-separated origins
                for item in candidate.split(","):
                    cleaned = item.strip().rstrip("/")
                    if cleaned:
                        origins.add(cleaned)

        return sorted(list(origins))


def get_settings() -> Settings:
    """Always returns current settings, reloading .env if modified."""
    return Settings()


settings = get_settings()
