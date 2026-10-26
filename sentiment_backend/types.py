from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal, TypedDict

SentimentType = Literal["positive", "neutral", "negative"]


@dataclass
class SentimentMetric:
    total_reviews: int
    positive_reviews: int
    positive_percentage: int
    neutral_reviews: int
    neutral_percentage: int
    negative_reviews: int
    negative_percentage: int
    overall_sentiment: SentimentType
    average_sentiment_score: float
    top_reviewed_product: str
    top_product_review_count: int
    top_product_sentiment_score: float


@dataclass
class MonthlyTrend:
    month: str
    positive: int
    neutral: int
    negative: int
    total: int
    average_score: float


@dataclass
class CategoryMetric:
    category: str
    total: int
    positive: int
    neutral: int
    negative: int
    average_score: float


@dataclass
class KeywordMetric:
    word: str
    count: int
    type: str
    score: float


@dataclass
class ReviewItem:
    id: str
    source: str
    target: str
    author: str
    date: str
    rating: int
    text: str
    sentiment: SentimentType
    score: float
    confidence: float
    matched_keywords: list[str] = field(default_factory=list)


@dataclass
class EmotionBreakdown:
    joy: int
    trust: int
    anticipation: int
    frustration: int
    disappointment: int


@dataclass
class NLPPipelineResult:
    raw_text: str
    cleaned_text: str
    tokens: list[str]
    removed_stopwords: list[str]
    positive_keywords_found: list[str]
    negative_keywords_found: list[str]
    polarity_score: float
    normalized_score: float
    sentiment: SentimentType
    confidence: float
    emotion_breakdown: EmotionBreakdown
    processing_time_ms: float


class RawFileInspection(TypedDict):
    file_name: str
    total_rows: int
    columns: list[str]
    suggested_text_column: str
    suggested_target_column: str
    suggested_date_column: str
    suggested_rating_column: str
    preview_rows: list[dict]
    raw_rows: list[dict]


class ParsedDatasetResult(TypedDict):
    dataset_name: str
    reviews: list[dict]
    metrics: dict
    monthly_trends: list[dict]
    category_metrics: list[dict]
    keyword_metrics: list[dict]
