"""
TranslateAI Pro — OCR Service
Extracts text from images using Tesseract OCR (primary) or EasyOCR (fallback).
"""

import logging
import re
from typing import Optional
from PIL import Image, ImageFilter, ImageEnhance
import io

logger = logging.getLogger(__name__)

# ── OCR availability flags ───────────────────────────────
_tesseract_available = False
_easyocr_available = False
_easyocr_reader = None

# Check Tesseract
try:
    import pytesseract
    pytesseract.get_tesseract_version()
    _tesseract_available = True
    logger.info("Tesseract OCR is available")
except Exception as e:
    logger.warning(f"Tesseract OCR not available: {e}")

# Check EasyOCR
try:
    import easyocr
    _easyocr_available = True
    logger.info("EasyOCR is available as fallback")
except ImportError:
    logger.warning("EasyOCR not available. Install with: pip install easyocr")


def is_ocr_available() -> bool:
    """Check if any OCR engine is available."""
    return _tesseract_available or _easyocr_available


def _get_easyocr_reader(languages=None):
    """Lazily initialize and cache the EasyOCR reader."""
    global _easyocr_reader
    if _easyocr_reader is None:
        import easyocr
        # Map common language codes to EasyOCR-supported codes
        lang_list = ['en']
        if languages:
            lang_map = {
                'hin': 'hi', 'eng': 'en', 'nep': 'ne',
                'tel': 'te', 'mar': 'mr', 'ben': 'bn',
                'hi': 'hi', 'en': 'en', 'ne': 'ne',
            }
            for lang in languages.split('+'):
                mapped = lang_map.get(lang.strip(), lang.strip())
                if mapped not in lang_list:
                    lang_list.append(mapped)
        # EasyOCR supports these languages
        supported = ['en', 'hi', 'ne', 'te', 'mr', 'bn', 'ta']
        lang_list = [l for l in lang_list if l in supported]
        if not lang_list:
            lang_list = ['en']
        logger.info(f"Initializing EasyOCR reader with languages: {lang_list}")
        _easyocr_reader = easyocr.Reader(lang_list, gpu=False)
    return _easyocr_reader


def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Apply preprocessing to improve OCR accuracy:
    1. Convert to grayscale
    2. Enhance contrast
    3. Apply sharpening
    4. Resize if too small
    5. Apply threshold for clean text
    """
    # Convert to grayscale
    img = image.convert("L")

    # Resize if image is too small
    width, height = img.size
    if width < 800:
        scale = 800 / width
        img = img.resize((int(width * scale), int(height * scale)), Image.LANCZOS)

    # Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)

    # Enhance sharpness
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(2.0)

    # Apply slight blur to reduce noise then sharpen
    img = img.filter(ImageFilter.MedianFilter(size=3))
    img = img.filter(ImageFilter.SHARPEN)

    # Apply binary threshold
    threshold = 128
    img = img.point(lambda p: 255 if p > threshold else 0)

    return img


def clean_extracted_text(text: str) -> str:
    """
    Clean and normalize OCR-extracted text:
    - Remove excessive whitespace
    - Fix common OCR artifacts
    - Normalize punctuation
    """
    if not text:
        return ""

    # Remove excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Remove leading/trailing whitespace per line
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)

    # Remove isolated single characters (common OCR artifacts)
    text = re.sub(r'\b[a-zA-Z]\b(?!\w)', '', text)

    # Normalize multiple spaces
    text = re.sub(r' {2,}', ' ', text)

    # Remove leading/trailing whitespace
    text = text.strip()

    return text


def _extract_with_tesseract(image_bytes: bytes, language: str = "hin+eng") -> dict:
    """Extract text using Tesseract OCR."""
    import pytesseract

    image = Image.open(io.BytesIO(image_bytes))
    processed = preprocess_image(image)

    # Extract text with confidence data
    data = pytesseract.image_to_data(processed, lang=language, output_type=pytesseract.Output.DICT)

    # Calculate average confidence
    confidences = [int(c) for c in data['conf'] if int(c) > 0]
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

    # Extract full text
    raw_text = pytesseract.image_to_string(processed, lang=language)
    cleaned = clean_extracted_text(raw_text)

    return {
        "extracted_text": raw_text,
        "cleaned_text": cleaned,
        "confidence": round(avg_confidence / 100.0, 3),
    }


def _extract_with_easyocr(image_bytes: bytes, language: str = "en+hi") -> dict:
    """Extract text using EasyOCR (pure Python, no system deps)."""
    import easyocr
    import numpy as np

    reader = _get_easyocr_reader(language)

    # EasyOCR can read from bytes directly
    image = Image.open(io.BytesIO(image_bytes))
    # Convert to RGB if needed (EasyOCR expects RGB or grayscale numpy array)
    if image.mode not in ('RGB', 'L'):
        image = image.convert('RGB')
    img_array = np.array(image)

    # Run OCR
    results = reader.readtext(img_array)

    if not results:
        return {
            "extracted_text": "",
            "cleaned_text": "",
            "confidence": 0.0,
        }

    # Combine results
    texts = []
    confidences = []
    for (bbox, text, conf) in results:
        texts.append(text)
        confidences.append(conf)

    raw_text = ' '.join(texts)
    cleaned = clean_extracted_text(raw_text)
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

    return {
        "extracted_text": raw_text,
        "cleaned_text": cleaned,
        "confidence": round(avg_confidence, 3),
    }


def extract_text_from_image(image_bytes: bytes, language: str = "hin+eng") -> dict:
    """
    Extract text from an image using the best available OCR engine.
    Tries Tesseract first, falls back to EasyOCR.

    Args:
        image_bytes: Raw image bytes
        language: Tesseract language code(s) e.g. "hin+eng"

    Returns:
        dict with extracted_text, cleaned_text, confidence
    """
    # Strategy 1: Tesseract (faster if installed)
    if _tesseract_available:
        try:
            result = _extract_with_tesseract(image_bytes, language)
            if result["cleaned_text"].strip():
                return result
            logger.warning("Tesseract returned empty text, trying EasyOCR fallback")
        except Exception as e:
            logger.warning(f"Tesseract extraction failed: {e}")

    # Strategy 2: EasyOCR (pure Python fallback)
    if _easyocr_available:
        try:
            result = _extract_with_easyocr(image_bytes, language)
            return result
        except Exception as e:
            logger.error(f"EasyOCR extraction also failed: {e}")
            return {
                "extracted_text": "",
                "cleaned_text": "",
                "confidence": 0.0,
                "error": f"OCR extraction failed: {str(e)}",
            }

    # No OCR engine available
    return {
        "extracted_text": "",
        "cleaned_text": "",
        "confidence": 0.0,
        "error": "No OCR engine available. Install Tesseract or run: pip install easyocr",
    }
