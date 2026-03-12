"""
TranslateAI Pro — History Routes
Retrieve and manage translation history for the current user.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models import User, Translation
from ..schemas import TranslationHistory
from ..auth.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("/", response_model=List[TranslationHistory])
async def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    translation_type: str = Query(None, description="Filter: text, ocr, pdf, batch"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get paginated translation history for the current user."""
    query = db.query(Translation).filter(Translation.user_id == current_user.id)

    if translation_type:
        query = query.filter(Translation.translation_type == translation_type)

    records = query.order_by(desc(Translation.created_at)).offset(skip).limit(limit).all()
    return [TranslationHistory.model_validate(r) for r in records]


@router.delete("/{translation_id}")
async def delete_history_item(
    translation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a translation record."""
    record = db.query(Translation).filter(
        Translation.id == translation_id,
        Translation.user_id == current_user.id,
    ).first()

    if not record:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Translation not found")

    db.delete(record)
    db.commit()
    return {"message": "Translation deleted successfully"}
