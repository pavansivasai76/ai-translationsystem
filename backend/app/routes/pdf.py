"""
TranslateAI Pro — PDF Processing Routes
Upload, extract, and translate PDF documents page-by-page.
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Translation
from ..schemas import PDFProcessResponse, PDFPageResult
from ..auth.dependencies import get_current_user
from ..services.pdf_processor import extract_text_from_pdf
from ..services.translation import translate_text

router = APIRouter(prefix="/api/pdf", tags=["PDF Processing"])


@router.post("/process", response_model=PDFProcessResponse)
async def process_pdf(
    file: UploadFile = File(...),
    target_language: str = Form(default="en"),
    source_language: str = Form(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Process a PDF: extract text from each page and translate.
    Handles scanned PDFs with OCR fallback.
    """
    # Validate file type
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum 20MB allowed.")

    # Extract text from all pages
    pages = extract_text_from_pdf(pdf_bytes)

    # Translate each page
    translated_pages = []
    all_source_text = []
    all_translated_text = []

    for page in pages:
        if page["text"].strip():
            result = translate_text(
                text=page["text"],
                source_language=source_language,
                target_language=target_language,
            )
            translated_pages.append(PDFPageResult(
                page_number=page["page_number"],
                original_text=page["text"],
                translated_text=result["translated_text"],
                method=page["method"],
            ))
            all_source_text.append(page["text"])
            all_translated_text.append(result["translated_text"])
            detected_source = result["source_language"]
        else:
            translated_pages.append(PDFPageResult(
                page_number=page["page_number"],
                original_text="[Empty page]",
                translated_text="[Empty page]",
                method=page["method"],
            ))
            detected_source = source_language or "unknown"

    # Save summary record to history
    record = Translation(
        user_id=current_user.id,
        translation_type="pdf",
        source_language=detected_source if 'detected_source' in dir() else "auto",
        target_language=target_language,
        source_text="\n---PAGE---\n".join(all_source_text)[:5000],  # Truncate for DB
        translated_text="\n---PAGE---\n".join(all_translated_text)[:5000],
        confidence_score=0.85,
        character_count=sum(len(t) for t in all_source_text),
    )
    db.add(record)
    db.commit()

    return PDFProcessResponse(
        total_pages=len(translated_pages),
        pages=translated_pages,
        source_language=detected_source if 'detected_source' in dir() else "auto",
        target_language=target_language,
    )
