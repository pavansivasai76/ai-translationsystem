"""
TranslateAI Pro — AI Chatbot Service
Rule-based assistant that helps users translate, summarize, and analyze text.
Parses natural language commands and routes to appropriate services.
"""

import logging
import re
from .translation import translate_text, detect_language, get_language_name
from .nlp import summarize_text, analyze_sentiment, extract_keywords

logger = logging.getLogger(__name__)

# ── Command patterns ─────────────────────────────────────
HELP_KEYWORDS = ["help", "what can you do", "commands", "how to", "guide"]
TRANSLATE_KEYWORDS = ["translate", "convert", "change to", "in english", "to english"]
SUMMARIZE_KEYWORDS = ["summarize", "summary", "shorten", "brief"]
SENTIMENT_KEYWORDS = ["sentiment", "feeling", "mood", "tone", "emotion"]
KEYWORD_KEYWORDS = ["keywords", "key words", "important words", "extract"]
GREETING_KEYWORDS = ["hi", "hello", "hey", "greetings", "namaste"]


def process_message(message: str) -> dict:
    """
    Process a user message and return an appropriate response.
    Recognizes commands for translation, summarization, sentiment analysis, etc.
    """
    lower = message.lower().strip()

    # ── Greetings ────────────────────────
    if any(kw in lower for kw in GREETING_KEYWORDS):
        return {
            "reply": (
                "👋 Hello! I'm the TranslateAI Assistant. I can help you with:\n\n"
                "🔄 **Translation** — Just say 'translate: [your text]'\n"
                "📝 **Summarization** — Say 'summarize: [your text]'\n"
                "💭 **Sentiment Analysis** — Say 'sentiment: [your text]'\n"
                "🔑 **Keyword Extraction** — Say 'keywords: [your text]'\n\n"
                "Try it out! Type 'translate: नमस्ते दुनिया' to get started."
            ),
            "action_performed": "greeting",
        }

    # ── Help ─────────────────────────────
    if any(kw in lower for kw in HELP_KEYWORDS):
        return {
            "reply": (
                "📚 **TranslateAI Assistant Commands:**\n\n"
                "1. **translate: [text]** — Translate text (auto-detects language)\n"
                "2. **translate to hindi: [text]** — Translate to specific language\n"
                "3. **summarize: [text]** — Get a brief summary\n"
                "4. **sentiment: [text]** — Analyze the sentiment/mood\n"
                "5. **keywords: [text]** — Extract key phrases\n"
                "6. **detect: [text]** — Detect the language\n\n"
                "💡 **Supported languages:** Hindi, Nepali, Telugu, English\n"
                "💡 You can also just paste text and I'll try to translate it!"
            ),
            "action_performed": "help",
        }

    # ── Translate command ────────────────
    if any(kw in lower for kw in TRANSLATE_KEYWORDS):
        text = _extract_text_after_keyword(message, TRANSLATE_KEYWORDS)
        if text:
            # Detect target language
            target = "en"
            if "to hindi" in lower or "to hi" in lower:
                target = "hi"
            elif "to nepali" in lower or "to ne" in lower:
                target = "ne"
            elif "to telugu" in lower or "to te" in lower:
                target = "te"

            result = translate_text(text, target_language=target)
            return {
                "reply": (
                    f"🔄 **Translation Result:**\n\n"
                    f"**Source ({get_language_name(result['source_language'])}):** {result['source_text']}\n\n"
                    f"**Translation ({get_language_name(result['target_language'])}):** {result['translated_text']}\n\n"
                    f"📊 Confidence: {result['confidence_score'] * 100:.1f}%"
                ),
                "action_performed": "translation",
                "translation_result": result,
            }
        return {"reply": "Please provide text to translate. Example: 'translate: नमस्ते'", "action_performed": None}

    # ── Summarize command ────────────────
    if any(kw in lower for kw in SUMMARIZE_KEYWORDS):
        text = _extract_text_after_keyword(message, SUMMARIZE_KEYWORDS)
        if text:
            summary = summarize_text(text)
            return {
                "reply": f"📝 **Summary:**\n\n{summary}",
                "action_performed": "summarization",
            }
        return {"reply": "Please provide text to summarize. Example: 'summarize: [long text]'", "action_performed": None}

    # ── Sentiment command ────────────────
    if any(kw in lower for kw in SENTIMENT_KEYWORDS):
        text = _extract_text_after_keyword(message, SENTIMENT_KEYWORDS)
        if text:
            result = analyze_sentiment(text)
            emoji = {"positive": "😊", "negative": "😞", "neutral": "😐"}.get(result["sentiment"], "🤔")
            return {
                "reply": (
                    f"💭 **Sentiment Analysis:**\n\n"
                    f"{emoji} **Sentiment:** {result['sentiment'].title()}\n"
                    f"📊 **Polarity Score:** {result['score']}\n"
                    f"🎯 **Subjectivity:** {result['subjectivity']}"
                ),
                "action_performed": "sentiment_analysis",
            }
        return {"reply": "Please provide text for analysis. Example: 'sentiment: I love this!'", "action_performed": None}

    # ── Keywords command ─────────────────
    if any(kw in lower for kw in KEYWORD_KEYWORDS):
        text = _extract_text_after_keyword(message, KEYWORD_KEYWORDS)
        if text:
            keywords = extract_keywords(text)
            kw_str = ", ".join(f"**{kw}**" for kw in keywords)
            return {
                "reply": f"🔑 **Extracted Keywords:**\n\n{kw_str}",
                "action_performed": "keyword_extraction",
            }
        return {"reply": "Please provide text for keyword extraction.", "action_performed": None}

    # ── Detect language ──────────────────
    if "detect" in lower:
        text = _extract_text_after_keyword(message, ["detect"])
        if text:
            lang, conf = detect_language(text)
            return {
                "reply": (
                    f"🌍 **Language Detection:**\n\n"
                    f"**Language:** {get_language_name(lang)} ({lang})\n"
                    f"**Confidence:** {conf * 100:.1f}%"
                ),
                "action_performed": "language_detection",
            }

    # ── Default: try to translate if it looks non-English ────
    try:
        lang, conf = detect_language(message)
        if lang != "en" and conf > 0.5:
            result = translate_text(message, source_language=lang, target_language="en")
            return {
                "reply": (
                    f"🤖 I detected **{get_language_name(lang)}** text. Here's the translation:\n\n"
                    f"**Translation:** {result['translated_text']}\n\n"
                    f"📊 Confidence: {result['confidence_score'] * 100:.1f}%\n\n"
                    f"💡 *Type 'help' to see all available commands.*"
                ),
                "action_performed": "auto_translation",
                "translation_result": result,
            }
    except Exception:
        pass

    # ── Fallback ─────────────────────────
    return {
        "reply": (
            "🤔 I'm not sure what you'd like me to do. Here are some things I can help with:\n\n"
            "• **translate: [text]** — Translate text between languages\n"
            "• **summarize: [text]** — Summarize long text\n"
            "• **sentiment: [text]** — Analyze text sentiment\n"
            "• **keywords: [text]** — Extract key phrases\n\n"
            "Or just paste text in Hindi/Nepali/Telugu and I'll translate it!"
        ),
        "action_performed": None,
    }


def _extract_text_after_keyword(message: str, keywords: list) -> str:
    """Extract the text portion after a command keyword, supporting ':' separator."""
    for kw in keywords:
        pattern = rf'{re.escape(kw)}\s*[:：]?\s*(.*)'
        match = re.search(pattern, message, re.IGNORECASE | re.DOTALL)
        if match:
            text = match.group(1).strip()
            # Clean up target language specifications
            text = re.sub(r'^to\s+(hindi|english|nepali|telugu|hi|en|ne|te)\s*[:：]?\s*', '', text, flags=re.IGNORECASE)
            if text:
                return text
    return ""
