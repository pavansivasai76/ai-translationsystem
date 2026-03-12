"""
TranslateAI Pro — Pydantic Schemas
Request/response models for API validation and serialization.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ═══════════════════════════════════════════════════════════
# AUTH SCHEMAS
# ═══════════════════════════════════════════════════════════

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ═══════════════════════════════════════════════════════════
# TRANSLATION SCHEMAS
# ═══════════════════════════════════════════════════════════

class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    source_language: Optional[str] = None  # auto-detect if None
    target_language: str = "en"


class TranslateResponse(BaseModel):
    source_text: str
    translated_text: str
    source_language: str
    target_language: str
    confidence_score: float
    character_count: int


class BatchTranslateRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=50)
    source_language: Optional[str] = None
    target_language: str = "en"


class BatchTranslateResponse(BaseModel):
    translations: List[TranslateResponse]
    total_characters: int


class LanguageDetectResponse(BaseModel):
    detected_language: str
    confidence: float
    language_name: str


# ═══════════════════════════════════════════════════════════
# OCR SCHEMAS
# ═══════════════════════════════════════════════════════════

class OCRResponse(BaseModel):
    extracted_text: str
    cleaned_text: str
    confidence: Optional[float] = None


class OCRTranslateResponse(BaseModel):
    extracted_text: str
    cleaned_text: str
    translated_text: str
    source_language: str
    target_language: str
    confidence_score: float


# ═══════════════════════════════════════════════════════════
# PDF SCHEMAS
# ═══════════════════════════════════════════════════════════

class PDFPageResult(BaseModel):
    page_number: int
    original_text: str
    translated_text: str
    method: str  # "text" or "ocr"


class PDFProcessResponse(BaseModel):
    total_pages: int
    pages: List[PDFPageResult]
    source_language: str
    target_language: str


# ═══════════════════════════════════════════════════════════
# NLP / AI SCHEMAS
# ═══════════════════════════════════════════════════════════

class NLPAnalysisResponse(BaseModel):
    summary: Optional[str] = None
    sentiment: str
    sentiment_score: float
    keywords: List[str]


class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str
    action_performed: Optional[str] = None
    translation_result: Optional[TranslateResponse] = None


# ═══════════════════════════════════════════════════════════
# HISTORY / DASHBOARD
# ═══════════════════════════════════════════════════════════

class TranslationHistory(BaseModel):
    id: int
    translation_type: str
    source_language: str
    target_language: str
    source_text: str
    translated_text: Optional[str]
    confidence_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_translations: int
    text_translations: int
    ocr_translations: int
    pdf_translations: int
    total_characters: int
    recent_translations: List[TranslationHistory]


class AnalyticsData(BaseModel):
    daily_usage: List[dict]
    language_distribution: List[dict]
    type_distribution: List[dict]
    monthly_trend: List[dict]


# ═══════════════════════════════════════════════════════════
# DOWNLOAD
# ═══════════════════════════════════════════════════════════

class DownloadRequest(BaseModel):
    content: str
    filename: Optional[str] = "translation"
    title: Optional[str] = "TranslateAI Pro - Translation Result"


# ═══════════════════════════════════════════════════════════
# HEALTH
# ═══════════════════════════════════════════════════════════

class HealthResponse(BaseModel):
    status: str
    version: str
    models_loaded: bool
    database_connected: bool
    ocr_available: bool
    uptime_seconds: float
