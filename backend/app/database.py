"""
TranslateAI Pro — Database Setup
SQLAlchemy engine, session factory, and base model.
Works with SQLite (dev) and PostgreSQL (production).
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# ── Engine ───────────────────────────────────────────────
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

# ── Session ──────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Base ─────────────────────────────────────────────────
Base = declarative_base()


def get_db():
    """Dependency: yields a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables on startup."""
    Base.metadata.create_all(bind=engine)
