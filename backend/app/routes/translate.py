"""
TranslateAI Pro — Translation Routes
Text translation, batch translation, and language detection endpoints.
"""

import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Translation
from ..schemas import (
    TranslateRequest, TranslateResponse,
    BatchTranslateRequest, BatchTranslateResponse,
    LanguageDetectResponse, NLPAnalysisResponse,
)
from ..auth.dependencies import get_current_user
from ..services.translation import translate_text, batch_translate, detect_language, get_language_name
from ..services.nlp import full_analysis

router = APIRouter(prefix="/api/translate", tags=["Translation"])


@router.post("/", response_model=TranslateResponse)
async def translate(
    request: TranslateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Translate text from source to target language with auto-detection."""
    result = translate_text(
        text=request.text,
        source_language=request.source_language,
        target_language=request.target_language,
    )

    # Save to history
    record = Translation(
        user_id=current_user.id,
        translation_type="text",
        source_language=result["source_language"],
        target_language=result["target_language"],
        source_text=result["source_text"],
        translated_text=result["translated_text"],
        confidence_score=result["confidence_score"],
        character_count=result["character_count"],
    )
    db.add(record)
    db.commit()

    return TranslateResponse(**result)


@router.post("/batch", response_model=BatchTranslateResponse)
async def translate_batch(
    request: BatchTranslateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Translate multiple texts in one request."""
    results = batch_translate(
        texts=request.texts,
        source_language=request.source_language,
        target_language=request.target_language,
    )

    # Save each to history
    total_chars = 0
    translations = []
    for r in results:
        total_chars += r["character_count"]
        record = Translation(
            user_id=current_user.id,
            translation_type="batch",
            source_language=r["source_language"],
            target_language=r["target_language"],
            source_text=r["source_text"],
            translated_text=r["translated_text"],
            confidence_score=r["confidence_score"],
            character_count=r["character_count"],
        )
        db.add(record)
        translations.append(TranslateResponse(**r))

    db.commit()
    return BatchTranslateResponse(translations=translations, total_characters=total_chars)


@router.post("/detect", response_model=LanguageDetectResponse)
async def detect(request: TranslateRequest):
    """Detect the language of the input text."""
    lang, confidence = detect_language(request.text)
    return LanguageDetectResponse(
        detected_language=lang,
        confidence=confidence,
        language_name=get_language_name(lang),
    )


@router.post("/analyze", response_model=NLPAnalysisResponse)
async def analyze(
    request: TranslateRequest,
    current_user: User = Depends(get_current_user),
):
    """Run NLP analysis (summarization, sentiment, keywords) on text."""
    analysis = full_analysis(request.text)
    return NLPAnalysisResponse(
        summary=analysis["summary"],
        sentiment=analysis["sentiment"],
        sentiment_score=analysis["sentiment_score"],
        keywords=analysis["keywords"],
    )
