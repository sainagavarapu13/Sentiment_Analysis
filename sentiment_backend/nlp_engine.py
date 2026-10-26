from __future__ import annotations

import math
import re
import time

import nltk
from nltk.corpus import stopwords

from .types import NLPPipelineResult, SentimentType

_FALLBACK_STOPWORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'could',
    'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
    'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in',
    'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not',
    'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same',
    'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
    'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
    'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'you',
    'your', 'yours', 'yourself', 'yourselves'
}

try:
    STOPWORDS = set(stopwords.words('english'))
except LookupError:
    nltk.download('stopwords', quiet=True, raise_on_error=False)
    try:
        STOPWORDS = set(stopwords.words('english'))
    except LookupError:
        STOPWORDS = set(_FALLBACK_STOPWORDS)

POSITIVE_LEXICON = {
    'excellent': 3.5,
    'good': 2.2,
    'fast': 2.5,
    'quality': 2.8,
    'easy': 2.4,
    'great': 3.0,
    'amazing': 3.4,
    'love': 3.2,
    'loved': 3.2,
    'best': 3.2,
    'perfect': 3.6,
    'smooth': 2.3,
    'reliable': 2.7,
    'awesome': 3.1,
    'superb': 3.3,
    'recommend': 2.6,
    'happy': 2.5,
    'durable': 2.6,
    'helpful': 2.3,
    'efficient': 2.8,
    'friendly': 2.2,
    'outstanding': 3.5,
    'satisfying': 2.5,
    'impressed': 2.7,
    'fantastic': 3.3,
    'flawless': 3.4,
    'worth': 2.2,
    'clean': 2.0,
    'stunning': 3.2,
    'brilliant': 3.3,
    'solid': 2.0,
    'responsive': 2.4,
    'beautiful': 2.8,
    'superior': 3.0,
}

NEGATIVE_LEXICON = {
    'delay': -2.8,
    'delayed': -2.8,
    'poor': -3.2,
    'expensive': -2.5,
    'bad': -3.0,
    'slow': -2.6,
    'terrible': -3.5,
    'broken': -3.3,
    'worst': -3.8,
    'useless': -3.4,
    'defect': -3.2,
    'defective': -3.2,
    'waste': -3.1,
    'issue': -2.2,
    'issues': -2.2,
    'problem': -2.2,
    'problems': -2.2,
    'refund': -2.5,
    'crash': -3.0,
    'disappointed': -3.2,
    'disappointing': -3.2,
    'hate': -3.4,
    'frustrating': -3.0,
    'horrible': -3.6,
    'rough': -2.0,
    'unresponsive': -2.8,
    'complaint': -2.4,
    'annoying': -2.5,
    'glitch': -2.3,
    'lag': -2.4,
    'overpriced': -2.7,
    'failed': -3.1,
    'unusable': -3.5,
}

NEGATION_WORDS = {'not', 'no', 'never', 'hardly', 'barely', 'scarcely', 'neither', 'nor', 'cannot', 'wasn\'t', 'isn\'t', 'aren\'t', 'don\'t', 'doesn\'t', 'didn\'t'}
INTENSIFIERS = {'very': 1.5, 'extremely': 2.0, 'incredibly': 1.8, 'super': 1.5, 'really': 1.4, 'quite': 1.2, 'completely': 1.6, 'absolutely': 1.8}


def runNLPPipeline(raw_text: str) -> dict:
    start_time = time.perf_counter()

    if raw_text is None or len(str(raw_text).strip()) == 0:
        return {
            'rawText': '',
            'cleanedText': '',
            'tokens': [],
            'removedStopwords': [],
            'positiveKeywordsFound': [],
            'negativeKeywordsFound': [],
            'polarityScore': 0,
            'normalizedScore': 0.5,
            'sentiment': 'neutral',
            'confidence': 0,
            'emotionBreakdown': {'joy': 0, 'trust': 0, 'anticipation': 0, 'frustration': 0, 'disappointment': 0},
            'processingTimeMs': 0,
        }

    text = str(raw_text)
    url_cleaned = re.sub(r'https?:\/\/\S+|www\.\S+', '', text, flags=re.IGNORECASE)
    punctuation_cleaned = re.sub(r"[^\w\s']", ' ', url_cleaned.lower())
    cleaned_text = re.sub(r'\s+', ' ', punctuation_cleaned).strip()

    raw_tokens = [token for token in cleaned_text.split(' ') if len(token) > 0]
    tokens: list[str] = []
    removed_stopwords: list[str] = []

    for token in raw_tokens:
        if token in STOPWORDS and token not in NEGATION_WORDS:
            removed_stopwords.append(token)
        else:
            tokens.append(token)

    positive_found: list[str] = []
    negative_found: list[str] = []
    total_score = 0.0
    word_score_count = 0

    for idx, word in enumerate(tokens):
        prev_word = tokens[idx - 1] if idx > 0 else ''
        is_negated = prev_word in NEGATION_WORDS
        multiplier = INTENSIFIERS.get(prev_word, 1)

        if word in POSITIVE_LEXICON:
            weight = POSITIVE_LEXICON[word] * multiplier
            if is_negated:
                weight = -weight * 0.9
                negative_found.append(f'not {word}')
            else:
                positive_found.append(word)
            total_score += weight
            word_score_count += 1
        elif word in NEGATIVE_LEXICON:
            weight = NEGATIVE_LEXICON[word] * multiplier
            if is_negated:
                weight = abs(weight) * 0.7
                positive_found.append(f'not {word}')
            else:
                negative_found.append(word)
            total_score += weight
            word_score_count += 1

    polarity = 0.0
    if word_score_count > 0:
        polarity = total_score / (word_score_count * 3.5)
        polarity = max(-1.0, min(1.0, polarity))

    sentiment: SentimentType = 'neutral'
    if polarity > 0.15:
        sentiment = 'positive'
    elif polarity < -0.15:
        sentiment = 'negative'

    normalized_score = round((polarity + 1) / 2, 2)
    keyword_density = (len(positive_found) + len(negative_found)) / max(len(tokens), 1)
    confidence = min(0.98, max(0.65, round(0.65 + abs(polarity) * 0.25 + min(keyword_density * 0.3, 0.1), 2)))

    joy = 50 + int(polarity * 45) if sentiment == 'positive' else max(5, 20 + int(polarity * 15))
    trust = 55 + int(polarity * 35) if sentiment == 'positive' else max(10, 30 + int(polarity * 15))
    anticipation = 30 + int((abs(hash(text)) % 21))
    frustration = 60 + int(abs(polarity) * 35) if sentiment == 'negative' else max(4, 15 - int(polarity * 10))
    disappointment = 55 + int(abs(polarity) * 40) if sentiment == 'negative' else max(2, 10 - int(polarity * 8))

    processing_time_ms = round((time.perf_counter() - start_time) * 1000, 1)

    result = {
        'rawText': raw_text,
        'raw_text': raw_text,
        'cleanedText': cleaned_text,
        'cleaned_text': cleaned_text,
        'tokens': tokens,
        'removedStopwords': removed_stopwords,
        'removed_stopwords': removed_stopwords,
        'positiveKeywordsFound': list(dict.fromkeys(positive_found)),
        'positive_keywords_found': list(dict.fromkeys(positive_found)),
        'negativeKeywordsFound': list(dict.fromkeys(negative_found)),
        'negative_keywords_found': list(dict.fromkeys(negative_found)),
        'polarityScore': round(polarity, 2),
        'polarity_score': round(polarity, 2),
        'normalizedScore': normalized_score,
        'normalized_score': normalized_score,
        'sentiment': sentiment,
        'confidence': confidence,
        'emotionBreakdown': {
            'joy': joy,
            'trust': trust,
            'anticipation': anticipation,
            'frustration': frustration,
            'disappointment': disappointment,
        },
        'emotion_breakdown': {
            'joy': joy,
            'trust': trust,
            'anticipation': anticipation,
            'frustration': frustration,
            'disappointment': disappointment,
        },
        'processingTimeMs': processing_time_ms,
        'processing_time_ms': processing_time_ms,
    }
    return result


run_nlp_pipeline = runNLPPipeline
