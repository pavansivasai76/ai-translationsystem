"""
TranslateAI Pro — Translation Service
Handles language detection and machine translation.
Uses AI4Bharat IndicTrans2 as primary model (best for Indian languages),
with deep-translator (Google) as a lightweight fallback.
"""

import logging
from typing import Optional, Tuple, List
from langdetect import detect, detect_langs
from langdetect.lang_detect_exception import LangDetectException

logger = logging.getLogger(__name__)

# ── Language mappings ────────────────────────────────────
LANGUAGE_NAMES = {
    "hi": "Hindi",
    "ne": "Nepali",
    "en": "English",
    "te": "Telugu",
    "mr": "Marathi",
    "bn": "Bengali",
    "ta": "Tamil",
    "gu": "Gujarati",
    "kn": "Kannada",
    "ml": "Malayalam",
    "pa": "Punjabi",
    "or": "Odia",
    "as": "Assamese",
    "ur": "Urdu",
    "sa": "Sanskrit",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "ja": "Japanese",
    "ko": "Korean",
    "zh-cn": "Chinese (Simplified)",
    "ar": "Arabic",
    "ru": "Russian",
    "pt": "Portuguese",
}

# ── IndicTrans2 language code mappings ───────────────────
# Maps ISO 639-1 codes to IndicTrans2 Flores-200 codes
INDIC_LANG_MAP = {
    "hi": "hin_Deva",
    "en": "eng_Latn",
    "te": "tel_Telu",
    "ta": "tam_Taml",
    "bn": "ben_Beng",
    "mr": "mar_Deva",
    "gu": "guj_Gujr",
    "kn": "kan_Knda",
    "ml": "mal_Mlym",
    "pa": "pan_Guru",
    "or": "ory_Orya",
    "as": "asm_Beng",
    "ne": "npi_Deva",
    "ur": "urd_Arab",
    "sa": "san_Deva",
    "sd": "snd_Deva",
    "ks": "kas_Deva",
    "doi": "doi_Deva",
    "gom": "gom_Deva",
    "mai": "mai_Deva",
    "mni": "mni_Mtei",
    "brx": "brx_Deva",
    "sat": "sat_Olck",
}

# Languages supported by IndicTrans2
INDIC_LANGUAGES = set(INDIC_LANG_MAP.keys())

# ── Model cache ──────────────────────────────────────────
_indictrans_models = {}     # key: "indic-en" or "en-indic"
_indictrans_tokenizers = {}

# ── Check if IndicTrans2 dependencies are available ──────
_indictrans_available = False
try:
    import torch
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    _indictrans_available = True
    logger.info("IndicTrans2 (AI4Bharat) + PyTorch available for neural MT")
except ImportError as e:
    logger.warning(f"IndicTrans2 dependencies not available: {e}. Will use deep-translator fallback.")

# ── Check if deep-translator is available ────────────────
_deep_translator_available = False
try:
    from deep_translator import GoogleTranslator
    _deep_translator_available = True
    logger.info("deep-translator (Google) available as fallback")
except ImportError:
    logger.warning("deep-translator not available. Install with: pip install deep-translator")


def _load_indictrans_model(direction: str):
    """
    Lazily load and cache an IndicTrans2 model.
    direction: "indic-en" or "en-indic"
    Uses distilled 200M models for faster inference.
    """
    if direction in _indictrans_models:
        return _indictrans_models[direction], _indictrans_tokenizers[direction]

    import torch
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

    model_map = {
        "indic-en": "ai4bharat/indictrans2-indic-en-dist-200M",
        "en-indic": "ai4bharat/indictrans2-en-indic-dist-200M",
    }

    model_name = model_map.get(direction)
    if not model_name:
        raise RuntimeError(f"Unknown IndicTrans2 direction: {direction}")

    logger.info(f"Loading IndicTrans2 model: {model_name}")

    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32

    model_kwargs = {
        "trust_remote_code": True,
        "torch_dtype": dtype,
    }

    model = AutoModelForSeq2SeqLM.from_pretrained(model_name, **model_kwargs).to(device)

    _indictrans_models[direction] = model
    _indictrans_tokenizers[direction] = tokenizer
    logger.info(f"IndicTrans2 model loaded: {direction} on {device}")
    return model, tokenizer


def _is_indic_language(lang_code: str) -> bool:
    """Check if a language code is an Indian language supported by IndicTrans2."""
    return lang_code in INDIC_LANGUAGES


def _get_indictrans_direction(source: str, target: str) -> Optional[str]:
    """Determine which IndicTrans2 model to use based on source-target pair."""
    src_is_indic = _is_indic_language(source)
    tgt_is_indic = _is_indic_language(target)
    src_is_en = source == "en"
    tgt_is_en = target == "en"

    if src_is_indic and tgt_is_en:
        return "indic-en"
    elif src_is_en and tgt_is_indic:
        return "en-indic"
    elif src_is_indic and tgt_is_indic:
        return "indic-indic"  # Chain: indic→en→indic
    else:
        return None


def _translate_with_indictrans(text: str, source: str, target: str) -> Tuple[str, float]:
    """
    Translate text using AI4Bharat IndicTrans2 model.
    Uses our lightweight pure-Python processor instead of IndicTransToolkit.
    Returns (translated_text, confidence).
    """
    import torch
    from .indic_processor import preprocess_batch, postprocess_batch

    direction = _get_indictrans_direction(source, target)

    if direction == "indic-indic":
        # Chain: Indic → English → Indic
        intermediate, conf1 = _translate_with_indictrans(text, source, "en")
        result, conf2 = _translate_with_indictrans(intermediate, "en", target)
        return result, min(conf1, conf2)

    if direction is None:
        raise RuntimeError(f"IndicTrans2 does not support {source}→{target}")

    src_lang = INDIC_LANG_MAP.get(source)
    tgt_lang = INDIC_LANG_MAP.get(target)

    if not src_lang or not tgt_lang:
        raise RuntimeError(f"Language code mapping not found: {source}={src_lang}, {target}={tgt_lang}")

    model, tokenizer = _load_indictrans_model(direction)

    device = "cuda" if torch.cuda.is_available() else "cpu"

    # Preprocess with our lightweight processor
    input_sentences = [text]
    batch = preprocess_batch(input_sentences, src_lang=src_lang, tgt_lang=tgt_lang)

    # Tokenize
    inputs = tokenizer(
        batch,
        truncation=True,
        padding="longest",
        return_tensors="pt",
        return_attention_mask=True,
    ).to(device)

    # Generate
    with torch.no_grad():
        generated_tokens = model.generate(
            **inputs,
            use_cache=True,
            min_length=0,
            max_length=256,
            num_beams=5,
            num_return_sequences=1,
        )

    # Decode
    decoded = tokenizer.batch_decode(
        generated_tokens,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=True,
    )

    # Postprocess
    translations = postprocess_batch(decoded, lang=tgt_lang)

    translated = translations[0] if translations else text
    confidence = 0.92  # IndicTrans2 is high quality for Indian languages

    return translated, confidence


def detect_language(text: str) -> Tuple[str, float]:
    """
    Detect the language of the input text.
    Returns (language_code, confidence).
    """
    try:
        results = detect_langs(text)
        if results:
            best = results[0]
            return str(best.lang), float(best.prob)
        return "unknown", 0.0
    except LangDetectException:
        return "unknown", 0.0


def get_language_name(code: str) -> str:
    """Get human-readable language name from code."""
    return LANGUAGE_NAMES.get(code, code.upper())


def _translate_with_deep_translator(text: str, source: str, target: str) -> str:
    """Translate text using deep-translator (Google Translate API)."""
    if not _deep_translator_available:
        raise RuntimeError("No translation backend available. Install: pip install deep-translator")

    try:
        src = 'auto' if source in (None, '', 'unknown', 'auto') else source
        translator = GoogleTranslator(source=src, target=target)

        if len(text) > 4500:
            chunks = [text[i:i+4500] for i in range(0, len(text), 4500)]
            translated_chunks = [translator.translate(chunk) for chunk in chunks]
            return ' '.join(translated_chunks)

        result = translator.translate(text)
        return result if result else text
    except Exception as e:
        logger.error(f"deep-translator failed: {e}")
        raise RuntimeError(f"Translation failed: {e}")


def translate_text(
    text: str,
    source_language: Optional[str] = None,
    target_language: str = "en"
) -> dict:
    """
    Translate text from source to target language.
    Auto-detects source language if not provided.

    Strategy:
    1. IndicTrans2 (AI4Bharat) — best for Indian languages (22 languages)
    2. deep-translator (Google) — universal fallback

    Returns dict with: translated_text, source_language, target_language,
                       confidence_score, character_count, source_text
    """
    # Auto-detect if needed
    if not source_language:
        source_language, detect_conf = detect_language(text)
        if source_language == "unknown":
            source_language = "hi"

    # Skip if same language
    if source_language == target_language:
        return {
            "source_text": text,
            "translated_text": text,
            "source_language": source_language,
            "target_language": target_language,
            "confidence_score": 1.0,
            "character_count": len(text),
        }

    # Strategy 1: IndicTrans2 (for Indian language pairs)
    if _indictrans_available and _get_indictrans_direction(source_language, target_language) is not None:
        try:
            translated, confidence = _translate_with_indictrans(text, source_language, target_language)
            return {
                "source_text": text,
                "translated_text": translated,
                "source_language": source_language,
                "target_language": target_language,
                "confidence_score": round(confidence, 3),
                "character_count": len(text),
            }
        except Exception as e:
            logger.warning(f"IndicTrans2 translation failed, trying fallback: {e}")

    # Strategy 2: deep-translator (Google Translate)
    if _deep_translator_available:
        try:
            translated = _translate_with_deep_translator(text, source_language, target_language)
            return {
                "source_text": text,
                "translated_text": translated,
                "source_language": source_language,
                "target_language": target_language,
                "confidence_score": 0.90,
                "character_count": len(text),
            }
        except Exception as e:
            logger.error(f"deep-translator also failed: {e}")

    # Both strategies failed
    return {
        "source_text": text,
        "translated_text": "[Translation unavailable — please install deep-translator: pip install deep-translator]",
        "source_language": source_language,
        "target_language": target_language,
        "confidence_score": 0.0,
        "character_count": len(text),
    }


def batch_translate(
    texts: list,
    source_language: Optional[str] = None,
    target_language: str = "en"
) -> list:
    """Translate multiple texts. Returns list of translation results."""
    results = []
    for text in texts:
        result = translate_text(text, source_language, target_language)
        results.append(result)
    return results


def is_models_loaded() -> bool:
    """Check if any translation models are loaded or available."""
    return len(_indictrans_models) > 0 or _deep_translator_available
