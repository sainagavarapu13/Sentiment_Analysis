from __future__ import annotations

import csv
import io
import json
import re
from pathlib import Path
from typing import Any

import pandas as pd

from .nlp_engine import runNLPPipeline


def inspectUploadedFile(file_like: Any) -> dict:
    if hasattr(file_like, 'name'):
        file_name = str(file_like.name)
    elif hasattr(file_like, 'filename'):
        file_name = str(file_like.filename)
    else:
        file_name = 'uploaded_file'

    extension = Path(file_name).suffix.lower().lstrip('.')
    raw_rows: list[Any] = []

    if extension == 'json':
        if hasattr(file_like, 'read'):
            payload = file_like.read()
            if isinstance(payload, (bytes, bytearray)):
                payload = payload.decode('utf-8')
            data = json.loads(payload)
        else:
            data = json.loads(str(file_like))
        raw_rows = data if isinstance(data, list) else (data.get('reviews') or data.get('data') or data.get('comments') or [data])

    elif extension == 'csv':
        if hasattr(file_like, 'read'):
            payload = file_like.read()
            if isinstance(payload, (bytes, bytearray)):
                payload = payload.decode('utf-8')
            df = pd.read_csv(io.StringIO(payload))
        else:
            df = pd.read_csv(file_like)
        raw_rows = df.to_dict(orient='records')

    elif extension in {'xlsx', 'xls'}:
        if hasattr(file_like, 'read'):
            payload = file_like.read()
            df = pd.read_excel(io.BytesIO(payload), engine='openpyxl')
        else:
            df = pd.read_excel(file_like)
        raw_rows = df.to_dict(orient='records')

    elif extension == 'pdf':
        try:
            from pypdf import PdfReader
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError('pypdf is required to parse PDF files') from exc

        if hasattr(file_like, 'read'):
            payload = file_like.read()
            reader = PdfReader(io.BytesIO(payload))
        else:
            reader = PdfReader(str(file_like))

        full_text = ''
        for page in reader.pages:
            full_text += '\n' + page.extract_text() or ''

        sentences = [line.strip() for line in re.split(r'(?<=[.?!])\s+(?=[A-Z0-9])|\n+', full_text) if len(line.strip()) > 15]
        raw_rows = [{'Review_Text': text, 'Entity': 'Document Text', 'Index': idx + 1} for idx, text in enumerate(sentences)]

    else:
        if hasattr(file_like, 'read'):
            payload = file_like.read()
            if isinstance(payload, (bytes, bytearray)):
                payload = payload.decode('utf-8')
            text = payload
        else:
            text = str(file_like)
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        raw_rows = [{'Review_Text': line, 'Index': idx + 1} for idx, line in enumerate(lines)]

    if not raw_rows:
        raise ValueError('The uploaded file is empty or could not be read.')

    columns_set = set()
    for row in raw_rows[:50]:
        if isinstance(row, dict):
            columns_set.update(row.keys())

    columns = list(columns_set) if columns_set else ['Review_Text']
    if not columns:
        columns = ['Review_Text']
        raw_rows = [{"Review_Text": str(item)} for item in raw_rows]

    suggested_text_column = next(
        (
            key for key in columns
            if re.match(r'^(review|comment|text|feedback|body|content|opinion|message|description)$', key, flags=re.IGNORECASE)
        ),
        next((key for key in columns if re.search(r'review|comment|text|feedback|opinion|body|content', key, flags=re.IGNORECASE)), columns[0]),
    )

    suggested_target_column = next(
        (
            key for key in columns
            if re.match(r'^(product|entity|item|brand|movie|category|service|title|target|name)$', key, flags=re.IGNORECASE)
        ),
        next((key for key in columns if re.search(r'product|entity|item|brand|movie|category|service|title|target', key, flags=re.IGNORECASE)), ''),
    )

    suggested_date_column = next(
        (
            key for key in columns
            if re.match(r'^(date|timestamp|time|created_at|created|month)$', key, flags=re.IGNORECASE)
        ),
        next((key for key in columns if re.search(r'date|time|created|timestamp|month', key, flags=re.IGNORECASE)), ''),
    )

    suggested_rating_column = next(
        (
            key for key in columns
            if re.match(r'^(rating|stars|score|rate)$', key, flags=re.IGNORECASE)
        ),
        next((key for key in columns if re.search(r'rating|stars|score|rate', key, flags=re.IGNORECASE)), ''),
    )

    return {
        'file_name': file_name,
        'total_rows': len(raw_rows),
        'columns': columns,
        'suggested_text_column': suggested_text_column,
        'suggested_target_column': suggested_target_column,
        'suggested_date_column': suggested_date_column,
        'suggested_rating_column': suggested_rating_column,
        'preview_rows': raw_rows[:5],
        'raw_rows': raw_rows,
    }


def inspect_uploaded_file(file_like: Any) -> dict:
    return inspectUploadedFile(file_like)


def processInspectedRows(inspection: dict, text_column: str, target_column: str | None = None, date_column: str | None = None, rating_column: str | None = None) -> dict:
    reviews: list[dict] = []

    for index, row in enumerate(inspection.get('raw_rows', [])):
        raw_text = ''
        if isinstance(row, str):
            raw_text = row.strip()
        elif isinstance(row, dict):
            raw_text = str(row.get(text_column, '')).strip()
            if not raw_text:
                fallback = next((str(value).strip() for value in row.values() if isinstance(value, str) and len(value.strip()) > 10), '')
                raw_text = fallback

        if not raw_text or len(raw_text) < 2:
            continue

        nlp = runNLPPipeline(raw_text)

        target = 'General'
        if target_column and isinstance(row, dict) and row.get(target_column):
            target = str(row.get(target_column)).strip() or 'General'

        date = ''
        if date_column and isinstance(row, dict) and row.get(date_column):
            date = str(row.get(date_column)).strip()

        rating = 5 if nlp['sentiment'] == 'positive' else 1 if nlp['sentiment'] == 'negative' else 3
        if rating_column and isinstance(row, dict) and row.get(rating_column) is not None:
            value = row.get(rating_column)
            try:
                rating = max(1, min(5, round(float(value))))
            except (TypeError, ValueError):
                pass

        author = row.get('author') if isinstance(row, dict) else None
        author = author or row.get('Author') if isinstance(row, dict) else None
        author = author or row.get('user') if isinstance(row, dict) else None
        author = author or row.get('Username') if isinstance(row, dict) else None
        author = str(author or f'Reviewer_{index + 1}')

        reviews.append({
            'id': f"REV-{1000 + len(reviews) + 1}",
            'source': 'Customer Feedback',
            'target': target or 'General',
            'author': author,
            'date': date or __import__('datetime').date.today().isoformat(),
            'rating': rating,
            'text': raw_text,
            'sentiment': nlp['sentiment'],
            'score': nlp['polarityScore'],
            'confidence': nlp['confidence'],
            'matchedKeywords': list(dict.fromkeys([*nlp['positiveKeywordsFound'], *nlp['negativeKeywordsFound']])),
            'matched_keywords': list(dict.fromkeys([*nlp['positiveKeywordsFound'], *nlp['negativeKeywordsFound']])),
        })

    if not reviews:
        raise ValueError(f'No valid reviews could be extracted using column "{text_column}". Please select another text column.')

    dataset_name = Path(str(inspection.get('file_name', 'dataset'))).stem or 'dataset'
    return calculateDatasetAnalytics(reviews, dataset_name)


def process_inspected_rows(inspection: dict, text_column: str, target_column: str | None = None, date_column: str | None = None, rating_column: str | None = None) -> dict:
    return processInspectedRows(inspection, text_column, target_column, date_column, rating_column)


def calculateDatasetAnalytics(reviews: list[dict], dataset_name: str) -> dict:
    total_reviews = len(reviews)
    if total_reviews == 0:
        return {
            'datasetName': dataset_name,
            'reviews': [],
            'metrics': {
                'totalReviews': 0,
                'positiveReviews': 0,
                'positivePercentage': 0,
                'neutralReviews': 0,
                'neutralPercentage': 0,
                'negativeReviews': 0,
                'negativePercentage': 0,
                'overallSentiment': 'neutral',
                'averageSentimentScore': 0,
                'topReviewedProduct': 'None',
                'topProductReviewCount': 0,
                'topProductSentimentScore': 0,
            },
            'monthlyTrends': [],
            'categoryMetrics': [],
            'keywordMetrics': [],
        }

    positive_count = 0
    neutral_count = 0
    negative_count = 0
    total_score_sum = 0.0

    entity_map: dict[str, dict[str, float]] = {}
    month_map: dict[str, dict[str, float]] = {}
    word_count_map: dict[str, dict[str, Any]] = {}

    for review in reviews:
        sentiment = review.get('sentiment', 'neutral')
        if sentiment == 'positive':
            positive_count += 1
        elif sentiment == 'negative':
            negative_count += 1
        else:
            neutral_count += 1

        normalized = (float(review.get('score', 0)) + 1) / 2
        total_score_sum += normalized

        entity = str(review.get('target') or 'General').strip()
        entity_map.setdefault(entity, {'total': 0, 'pos': 0, 'neu': 0, 'neg': 0, 'scoreSum': 0.0})
        entity_map[entity]['total'] += 1
        if sentiment == 'positive':
            entity_map[entity]['pos'] += 1
        elif sentiment == 'negative':
            entity_map[entity]['neg'] += 1
        else:
            entity_map[entity]['neu'] += 1
        entity_map[entity]['scoreSum'] += normalized

        date_value = str(review.get('date') or '')
        if date_value:
            try:
                import datetime
                parsed = datetime.date.fromisoformat(date_value)
                month_label = parsed.strftime('%b %y')
            except ValueError:
                parts = date_value.split('-')
                month_label = '-'.join(parts[:2]) if len(parts) > 1 else date_value
            if month_label:
                month_map.setdefault(month_label, {'total': 0, 'pos': 0, 'neu': 0, 'neg': 0, 'scoreSum': 0.0})
                month_map[month_label]['total'] += 1
                if sentiment == 'positive':
                    month_map[month_label]['pos'] += 1
                elif sentiment == 'negative':
                    month_map[month_label]['neg'] += 1
                else:
                    month_map[month_label]['neu'] += 1
                month_map[month_label]['scoreSum'] += normalized

        for keyword in review.get('matchedKeywords', []):
            lower = str(keyword).lower()
            word_count_map.setdefault(lower, {'count': 0, 'type': sentiment, 'scoreSum': 0.0})
            word_count_map[lower]['count'] += 1
            word_count_map[lower]['scoreSum'] += float(review.get('score', 0))

    pos_pct = round((positive_count / total_reviews) * 100) if total_reviews else 0
    neu_pct = round((neutral_count / total_reviews) * 100) if total_reviews else 0
    neg_pct = round((negative_count / total_reviews) * 100) if total_reviews else 0

    overall_sentiment = 'neutral'
    if pos_pct >= neu_pct and pos_pct >= neg_pct:
        overall_sentiment = 'positive'
    elif neg_pct >= pos_pct and neg_pct >= neu_pct:
        overall_sentiment = 'negative'

    average_sentiment_score = round((total_score_sum / total_reviews), 2) if total_reviews else 0

    sorted_entities = sorted(entity_map.items(), key=lambda item: item[1]['total'], reverse=True)
    top_entity_entry = sorted_entities[0] if sorted_entities else None
    top_reviewed_product = top_entity_entry[0] if top_entity_entry else 'None'
    top_product_review_count = top_entity_entry[1]['total'] if top_entity_entry else 0
    top_product_sentiment_score = round((top_entity_entry[1]['scoreSum'] / max(1, top_entity_entry[1]['total'])), 2) if top_entity_entry else 0

    metrics = {
        'totalReviews': total_reviews,
        'total_reviews': total_reviews,
        'positiveReviews': positive_count,
        'positive_reviews': positive_count,
        'positivePercentage': pos_pct,
        'positive_percentage': pos_pct,
        'neutralReviews': neutral_count,
        'neutral_reviews': neutral_count,
        'neutralPercentage': neu_pct,
        'neutral_percentage': neu_pct,
        'negativeReviews': negative_count,
        'negative_reviews': negative_count,
        'negativePercentage': neg_pct,
        'negative_percentage': neg_pct,
        'overallSentiment': overall_sentiment,
        'overall_sentiment': overall_sentiment,
        'averageSentimentScore': average_sentiment_score,
        'average_sentiment_score': average_sentiment_score,
        'topReviewedProduct': top_reviewed_product,
        'top_reviewed_product': top_reviewed_product,
        'topProductReviewCount': top_product_review_count,
        'top_product_review_count': top_product_review_count,
        'topProductSentimentScore': top_product_sentiment_score,
        'top_product_sentiment_score': top_product_sentiment_score,
    }

    category_metrics = [
        {
            'category': category,
            'total': value['total'],
            'positive': value['pos'],
            'neutral': value['neu'],
            'negative': value['neg'],
            'averageScore': round(value['scoreSum'] / max(1, value['total']), 2),
        }
        for category, value in sorted_entities[:10]
    ]

    monthly_trends = [
        {
            'month': month,
            'total': value['total'],
            'positive': value['pos'],
            'neutral': value['neu'],
            'negative': value['neg'],
            'averageScore': round(value['scoreSum'] / max(1, value['total']), 2),
        }
        for month, value in sorted(month_map.items())
    ]

    keyword_metrics = [
        {
            'word': word.capitalize(),
            'count': value['count'],
            'type': value['type'],
            'score': round(value['scoreSum'] / max(1, value['count']), 2),
        }
        for word, value in sorted(word_count_map.items(), key=lambda item: item[1]['count'], reverse=True)[:30]
    ]

    result = {
        'datasetName': dataset_name,
        'dataset_name': dataset_name,
        'reviews': reviews,
        'metrics': metrics,
        'monthlyTrends': monthly_trends,
        'monthly_trends': monthly_trends,
        'categoryMetrics': category_metrics,
        'category_metrics': category_metrics,
        'keywordMetrics': keyword_metrics,
        'keyword_metrics': keyword_metrics,
    }
    return result


calculate_dataset_analytics = calculateDatasetAnalytics
