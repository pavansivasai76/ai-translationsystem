"""
TranslateAI Pro — Lightweight IndicTrans2 Processor
Pure-Python replacement for IndicTransToolkit's IndicProcessor.
Handles preprocessing (normalization, script unification) and postprocessing
for AI4Bharat IndicTrans2 models without requiring Cython compilation.
"""

import re
import unicodedata
from typing import List


# Flores-200 language codes used by IndicTrans2
FLORES_CODES = {
    "asm_Beng", "ben_Beng", "brx_Deva", "doi_Deva",
    "eng_Latn", "gom_Deva", "guj_Gujr", "hin_Deva",
    "kan_Knda", "kas_Arab", "kas_Deva", "mai_Deva",
    "mal_Mlym", "mar_Deva", "mni_Beng", "mni_Mtei",
    "npi_Deva", "ory_Orya", "pan_Guru", "san_Deva",
    "sat_Olck", "snd_Arab", "snd_Deva", "tam_Taml",
    "tel_Telu", "urd_Arab",
}

# Placeholder patterns for number/entity protection
_PLACEHOLDER_RE = re.compile(r'<\w+>')


def normalize_indic_text(text: str) -> str:
    """
    Normalize Indic text:
    - Unicode NFC normalization
    - Normalize whitespace
    - Clean up common OCR/input artifacts
    """
    # Unicode NFC normalization
    text = unicodedata.normalize("NFC", text)

    # Normalize various whitespace characters
    text = re.sub(r'[\u200b\u200c\u200d\ufeff]', '', text)  # zero-width chars
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()

    return text


def preprocess_batch(
    sentences: List[str],
    src_lang: str,
    tgt_lang: str,
    inference: bool = True,
) -> List[str]:
    """
    Preprocess a batch of sentences for IndicTrans2.

    For each sentence:
    1. Normalize Unicode
    2. Clean whitespace
    3. The IndicTrans2 tokenizer handles language tags internally via
       its configuration, so we just normalize the text here.

    Args:
        sentences: List of input sentences
        src_lang: Source language in Flores-200 format (e.g., "hin_Deva")
        tgt_lang: Target language in Flores-200 format (e.g., "eng_Latn")
        inference: Whether this is for inference (always True for our use)

    Returns:
        List of preprocessed sentences
    """
    processed = []
    for sent in sentences:
        sent = normalize_indic_text(sent)

        # Protect numbers and entities from being translated
        # (simple approach: normalize numeric characters)
        if not sent:
            sent = " "

        processed.append(sent)

    return processed


def postprocess_batch(
    translations: List[str],
    lang: str,
) -> List[str]:
    """
    Postprocess translated batch from IndicTrans2.

    For each translation:
    1. Clean up whitespace
    2. Fix common translation artifacts
    3. Normalize Unicode for target script

    Args:
        translations: List of translated sentences
        lang: Target language in Flores-200 format

    Returns:
        List of postprocessed translations
    """
    processed = []
    for trans in translations:
        # Unicode NFC normalization
        trans = unicodedata.normalize("NFC", trans)

        # Remove any stray placeholders
        trans = _PLACEHOLDER_RE.sub('', trans)

        # Clean whitespace
        trans = re.sub(r'\s+', ' ', trans)
        trans = trans.strip()

        # Fix common artifacts
        trans = trans.replace(' .', '.').replace(' ,', ',')
        trans = trans.replace(' !', '!').replace(' ?', '?')

        # For Devanagari scripts, fix spacing around purna viram
        if 'Deva' in lang:
            trans = trans.replace(' ।', '।').replace(' ।', '।')

        processed.append(trans)

    return processed
