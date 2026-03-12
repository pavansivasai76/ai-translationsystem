"""
TranslateAI Pro — OCR Routes
Image upload, text extraction, and OCR-based translation endpoints.
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Translation
from ..schemas import OCRResponse, OCRTranslateResponse
from ..auth.dependencies import get_current_user
from ..services.ocr import extract_text_from_image, is_ocr_available
from ..services.translation import translate_text

router = APIRouter(prefix="/api/ocr", tags=["OCR"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"}


def _validate_image(file: UploadFile):
    """Validate uploaded file is an image."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )


@router.post("/extract", response_model=OCRResponse)
async def extract_text(
    file: UploadFile = File(...),
    language: str = Form(default="hin+eng"),
    current_user: User = Depends(get_current_user),
):
    """Extract text from an uploaded image using OCR."""
    if not is_ocr_available():
        raise HTTPException(status_code=503, detail="OCR service is not available. Install Tesseract or run: pip install easyocr")

    _validate_image(file)
    image_bytes = await file.read()
    result = extract_text_from_image(image_bytes, language=language)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return OCRResponse(**result)


@router.post("/translate", response_model=OCRTranslateResponse)
async def ocr_and_translate(
    file: UploadFile = File(...),
    target_language: str = Form(default="en"),
    ocr_language: str = Form(default="hin+eng"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Extract text from image and translate it."""
    if not is_ocr_available():
        raise HTTPException(status_code=503, detail="OCR service is not available. Install Tesseract or run: pip install easyocr")

    _validate_image(file)
    image_bytes = await file.read()

    # Step 1: OCR extraction
    ocr_result = extract_text_from_image(image_bytes, language=ocr_language)
    if "error" in ocr_result:
        raise HTTPException(status_code=500, detail=ocr_result["error"])

    extracted = ocr_result["cleaned_text"]
    if not extracted.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from the image")

    # Step 2: Translate
    translation = translate_text(text=extracted, target_language=target_language)

    # Save to history
    record = Translation(
        user_id=current_user.id,
        translation_type="ocr",
        source_language=translation["source_language"],
        target_language=translation["target_language"],
        source_text=extracted,
        translated_text=translation["translated_text"],
        confidence_score=translation["confidence_score"],
        character_count=translation["character_count"],
    )
    db.add(record)
    db.commit()

    return OCRTranslateResponse(
        extracted_text=ocr_result["extracted_text"],
        cleaned_text=extracted,
        translated_text=translation["translated_text"],
        source_language=translation["source_language"],
        target_language=translation["target_language"],
        confidence_score=translation["confidence_score"],
    )
