"""
TranslateAI Pro — NLP Analysis Service
Provides text summarization, sentiment analysis, and keyword extraction.
"""

import logging
from typing import List, Optional

logger = logging.getLogger(__name__)


def summarize_text(text: str, num_sentences: int = 3) -> str:
    """
    Extractive text summarization using sentence scoring.
    Selects the most important sentences based on word frequency.
    """
    if not text or len(text) < 100:
        return text

    try:
        from textblob import TextBlob

        blob = TextBlob(text)
        sentences = blob.sentences

        if len(sentences) <= num_sentences:
            return text

        # Score sentences by word frequency
        word_freq = {}
        for word in blob.words.lower():
            word_freq[word] = word_freq.get(word, 0) + 1

        scored = []
        for i, sentence in enumerate(sentences):
            score = sum(word_freq.get(w.lower(), 0) for w in sentence.words)
            # Boost first sentences (positional scoring)
            if i < 2:
                score *= 1.5
            scored.append((score, i, str(sentence)))

        # Select top sentences in original order
        scored.sort(reverse=True)
        top = sorted(scored[:num_sentences], key=lambda x: x[1])
        summary = ' '.join(s[2] for s in top)

        return summary

    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        # Fallback: return first N sentences
        sentences = text.split('.')[:num_sentences]
        return '. '.join(sentences).strip() + '.'


def analyze_sentiment(text: str) -> dict:
    """
    Analyze the sentiment of text using TextBlob.
    Returns sentiment label and polarity score (-1.0 to 1.0).
    """
    try:
        from textblob import TextBlob

        blob = TextBlob(text)
        polarity = blob.sentiment.polarity

        if polarity > 0.1:
            label = "positive"
        elif polarity < -0.1:
            label = "negative"
        else:
            label = "neutral"

        return {
            "sentiment": label,
            "score": round(polarity, 3),
            "subjectivity": round(blob.sentiment.subjectivity, 3),
        }

    except Exception as e:
        logger.error(f"Sentiment analysis failed: {e}")
        return {"sentiment": "neutral", "score": 0.0, "subjectivity": 0.0}


def extract_keywords(text: str, max_keywords: int = 10) -> List[str]:
    """
    Extract keywords from text using YAKE (Yet Another Keyword Extractor).
    Falls back to simple frequency-based extraction.
    """
    try:
        import yake

        kw_extractor = yake.KeywordExtractor(
            lan="en",
            n=2,  # max n-gram size
            top=max_keywords,
            dedupLim=0.5,
        )

        keywords = kw_extractor.extract_keywords(text)
        return [kw[0] for kw in keywords]

    except ImportError:
        logger.warning("YAKE not available, using fallback keyword extraction")
    except Exception as e:
        logger.error(f"Keyword extraction failed: {e}")

    # Fallback: simple frequency-based
    return _simple_keyword_extraction(text, max_keywords)


def _simple_keyword_extraction(text: str, max_keywords: int) -> List[str]:
    """Fallback keyword extraction using word frequency."""
    stop_words = {
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
        'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
        'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or',
        'not', 'this', 'that', 'these', 'those', 'it', 'its', 'i', 'we',
        'they', 'he', 'she', 'my', 'your', 'his', 'her', 'their', 'our',
    }

    words = text.lower().split()
    words = [w.strip('.,!?;:()[]{}"\'-') for w in words if len(w) > 3]
    words = [w for w in words if w not in stop_words and w.isalpha()]

    freq = {}
    for w in words:
        freq[w] = freq.get(w, 0) + 1

    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [w[0] for w in sorted_words[:max_keywords]]


def full_analysis(text: str) -> dict:
    """Run all NLP analyses on the given text."""
    return {
        "summary": summarize_text(text),
        "sentiment": analyze_sentiment(text)["sentiment"],
        "sentiment_score": analyze_sentiment(text)["score"],
        "keywords": extract_keywords(text),
    }
