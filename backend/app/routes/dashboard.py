"""
TranslateAI Pro — Dashboard & Analytics Routes
Usage statistics, analytics graphs, and user activity data.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, String
from datetime import datetime, timedelta, timezone
from ..database import get_db
from ..models import User, Translation
from ..schemas import DashboardStats, AnalyticsData, TranslationHistory
from ..auth.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard statistics for the current user."""
    user_id = current_user.id

    total = db.query(func.count(Translation.id)).filter(Translation.user_id == user_id).scalar() or 0
    text_count = db.query(func.count(Translation.id)).filter(
        Translation.user_id == user_id, Translation.translation_type == "text"
    ).scalar() or 0
    ocr_count = db.query(func.count(Translation.id)).filter(
        Translation.user_id == user_id, Translation.translation_type == "ocr"
    ).scalar() or 0
    pdf_count = db.query(func.count(Translation.id)).filter(
        Translation.user_id == user_id, Translation.translation_type == "pdf"
    ).scalar() or 0
    total_chars = db.query(func.sum(Translation.character_count)).filter(
        Translation.user_id == user_id
    ).scalar() or 0

    recent = db.query(Translation).filter(
        Translation.user_id == user_id
    ).order_by(Translation.created_at.desc()).limit(5).all()

    return DashboardStats(
        total_translations=total,
        text_translations=text_count,
        ocr_translations=ocr_count,
        pdf_translations=pdf_count,
        total_characters=total_chars,
        recent_translations=[TranslationHistory.model_validate(r) for r in recent],
    )


@router.get("/analytics", response_model=AnalyticsData)
async def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analytics data for charts and graphs."""
    user_id = current_user.id
    now = datetime.now(timezone.utc)

    # Daily usage for last 7 days
    daily_usage = []
    for i in range(6, -1, -1):
        date = now - timedelta(days=i)
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = db.query(func.count(Translation.id)).filter(
            Translation.user_id == user_id,
            Translation.created_at >= day_start,
            Translation.created_at < day_end,
        ).scalar() or 0
        daily_usage.append({
            "date": day_start.strftime("%b %d"),
            "translations": count,
        })

    # Language distribution
    lang_dist = db.query(
        Translation.source_language,
        func.count(Translation.id).label("count"),
    ).filter(Translation.user_id == user_id).group_by(
        Translation.source_language
    ).all()
    language_distribution = [{"language": l[0], "count": l[1]} for l in lang_dist]

    # Type distribution
    type_dist = db.query(
        Translation.translation_type,
        func.count(Translation.id).label("count"),
    ).filter(Translation.user_id == user_id).group_by(
        Translation.translation_type
    ).all()
    type_distribution = [{"type": t[0], "count": t[1]} for t in type_dist]

    # Monthly trend (last 6 months)
    monthly_trend = []
    for i in range(5, -1, -1):
        month_start = (now - timedelta(days=30 * i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        count = db.query(func.count(Translation.id)).filter(
            Translation.user_id == user_id,
            Translation.created_at >= month_start,
            Translation.created_at < month_end,
        ).scalar() or 0
        monthly_trend.append({
            "month": month_start.strftime("%b %Y"),
            "translations": count,
        })

    return AnalyticsData(
        daily_usage=daily_usage,
        language_distribution=language_distribution,
        type_distribution=type_distribution,
        monthly_trend=monthly_trend,
    )
