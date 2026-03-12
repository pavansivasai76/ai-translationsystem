"""
TranslateAI Pro — PDF Processing Service
Extracts text from PDF documents with OCR fallback for scanned pages.
"""

import logging
from typing import List
from PyPDF2 import PdfReader
import io

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_bytes: bytes) -> List[dict]:
    """
    Extract text from each page of a PDF.
    Falls back to OCR for pages with no extractable text.

    Returns list of dicts: [{page_number, text, method}]
    """
    results = []

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))

        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            method = "text"

            # If no text extracted, try OCR fallback
            if len(page_text.strip()) < 10:
                method = "ocr"
                page_text = _ocr_fallback_for_page(pdf_bytes, i)
                if not page_text or page_text.startswith("["):
                    # OCR failed or unavailable, mark clearly
                    method = "text"
                    page_text = page_text or "[No extractable text on this page]"

            results.append({
                "page_number": i + 1,
                "text": page_text.strip(),
                "method": method,
            })

        return results

    except Exception as e:
        logger.error(f"PDF processing failed: {e}")
        return [{"page_number": 1, "text": f"Error processing PDF: {str(e)}", "method": "error"}]


def _ocr_fallback_for_page(pdf_bytes: bytes, page_index: int) -> str:
    """
    Attempt OCR on a PDF page by converting it to an image.
    Tries pdf2image + poppler first, then falls back to a simpler approach.
    """
    # Try pdf2image approach (requires poppler system library)
    try:
        from pdf2image import convert_from_bytes
        from .ocr import extract_text_from_image, is_ocr_available

        if not is_ocr_available():
            return "[No text detected — OCR not available for scanned pages]"

        images = convert_from_bytes(
            pdf_bytes,
            first_page=page_index + 1,
            last_page=page_index + 1,
            dpi=300,
        )

        if images:
            img_buffer = io.BytesIO()
            images[0].save(img_buffer, format='PNG')
            img_bytes = img_buffer.getvalue()

            result = extract_text_from_image(img_bytes)
            return result.get("cleaned_text", "")

    except ImportError:
        logger.warning("pdf2image not available for OCR fallback")
    except Exception as e:
        logger.warning(f"OCR fallback failed for page {page_index + 1}: {e}")

    # Try PyMuPDF (fitz) approach as another fallback
    try:
        import fitz  # PyMuPDF
        from .ocr import extract_text_from_image, is_ocr_available

        if not is_ocr_available():
            return "[No text detected — OCR not available for scanned pages]"

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page = doc.load_page(page_index)
        pix = page.get_pixmap(dpi=300)
        img_bytes = pix.tobytes("png")
        doc.close()

        result = extract_text_from_image(img_bytes)
        return result.get("cleaned_text", "")

    except ImportError:
        logger.warning("PyMuPDF not available for OCR fallback")
    except Exception as e:
        logger.warning(f"PyMuPDF OCR fallback failed for page {page_index + 1}: {e}")

    return "[No text detected on this page — install pdf2image+poppler for scanned PDF support]"


def get_pdf_metadata(pdf_bytes: bytes) -> dict:
    """Extract PDF metadata (title, author, pages)."""
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        info = reader.metadata
        return {
            "total_pages": len(reader.pages),
            "title": info.title if info else None,
            "author": info.author if info else None,
        }
    except Exception as e:
        return {"total_pages": 0, "error": str(e)}
