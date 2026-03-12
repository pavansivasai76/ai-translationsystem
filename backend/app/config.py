"""
TranslateAI Pro — Application Configuration
Centralizes all settings via environment variables with sensible defaults.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────
    APP_NAME: str = "TranslateAI Pro"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ── Security ─────────────────────────────────────────
    SECRET_KEY: str = "translateai-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ── Database ─────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./translateai.db"

    # ── File Uploads ─────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 20

    # ── Rate Limiting ────────────────────────────────────
    RATE_LIMIT: str = "30/minute"

    # ── AI Models (IndicTrans2 by AI4Bharat) ────────────
    TRANSLATION_MODELS: dict = {
        "indic-en": "ai4bharat/indictrans2-indic-en-dist-200M",
        "en-indic": "ai4bharat/indictrans2-en-indic-dist-200M",
    }

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
