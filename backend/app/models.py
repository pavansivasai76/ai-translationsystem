"""
TranslateAI Pro — Database Models
SQLAlchemy ORM models for users, translations, and processing history.
"""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum


class TranslationType(str, enum.Enum):
    TEXT = "text"
    OCR = "ocr"
    PDF = "pdf"
    BATCH = "batch"


class User(Base):
    """Registered user account."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    translations = relationship("Translation", back_populates="user", cascade="all, delete-orphan")


class Translation(Base):
    """Stores every translation request and result."""
    __tablename__ = "translations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    translation_type = Column(String(20), default="text")
    source_language = Column(String(10), nullable=False)
    target_language = Column(String(10), nullable=False)
    source_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    character_count = Column(Integer, nullable=True)

    # NLP extras
    summary = Column(Text, nullable=True)
    sentiment = Column(String(20), nullable=True)
    sentiment_score = Column(Float, nullable=True)
    keywords = Column(Text, nullable=True)  # JSON-encoded list

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="translations")
