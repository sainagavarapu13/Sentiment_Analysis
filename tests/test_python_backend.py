import asyncio
from pathlib import Path

from sentiment_backend.file_parser import process_inspected_rows
from sentiment_backend.main import analyze_text, app
from sentiment_backend.ml_classifier import _lemmatize, classify_text
from sentiment_backend.nlp_engine import runNLPPipeline


def test_run_nlp_pipeline_positive_review():
    result = runNLPPipeline("Excellent and reliable service, very fast and helpful.")
    assert result["sentiment"] == "positive"
    assert result["polarity_score"] > 0
    assert result["normalized_score"] >= 0.5


def test_ml_classifiers_return_sentiment_and_features():
    text = "Excellent quality and quick, reliable service."

    for model in ("logistic_regression", "svm", "word2vec"):
        result = classify_text(text, model)

        assert result["sentiment"] == "positive"
        assert 0 <= result["confidence"] <= 1
        assert result["tokens"]
        assert result["modelDetails"]["model"] == model
        assert result["modelDetails"]["topNgrams"]


def test_ml_classifier_rejects_unknown_model():
    try:
        classify_text("sample review", "unknown")
    except ValueError as error:
        assert "model must be" in str(error)
    else:
        raise AssertionError("Unknown classifier should be rejected")


def test_wordnet_lemmatization_normalizes_inflected_words():
    assert [_lemmatize(word) for word in ("reviews", "running", "delayed")] == [
        "review",
        "run",
        "delay",
    ]


def test_analyze_api_accepts_vite_origin_and_selected_model():
    result = analyze_text({"text": "Excellent quality and fast delivery", "model": "svm"})
    messages = []

    async def receive():
        raise AssertionError("CORS preflight should not read a request body")

    async def send(message):
        messages.append(message)

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "OPTIONS",
        "scheme": "http",
        "path": "/api/analyze-text",
        "raw_path": b"/api/analyze-text",
        "query_string": b"",
        "headers": [
            (b"origin", b"http://localhost:3000"),
            (b"access-control-request-method", b"POST"),
            (b"access-control-request-headers", b"content-type"),
        ],
        "client": ("testclient", 123),
        "server": ("testserver", 80),
    }
    asyncio.run(app(scope, receive, send))
    response_headers = dict(messages[0]["headers"])

    assert messages[0]["status"] == 200
    assert response_headers[b"access-control-allow-origin"] == b"http://localhost:3000"
    assert result["modelDetails"]["model"] == "svm"


def test_process_inspected_rows_keeps_dataset_metrics():
    inspection = {
        "file_name": "demo.csv",
        "total_rows": 2,
        "columns": ["Review_Text", "Category"],
        "suggested_text_column": "Review_Text",
        "suggested_target_column": "Category",
        "suggested_date_column": "",
        "suggested_rating_column": "",
        "preview_rows": [
            {"Review_Text": "Excellent quality and fast delivery", "Category": "Electronics"},
            {"Review_Text": "Terrible service and slow support", "Category": "Electronics"},
        ],
        "raw_rows": [
            {"Review_Text": "Excellent quality and fast delivery", "Category": "Electronics"},
            {"Review_Text": "Terrible service and slow support", "Category": "Electronics"},
        ],
    }

    result = process_inspected_rows(inspection, "Review_Text", "Category")

    assert result["dataset_name"] == "demo"
    assert result["metrics"]["total_reviews"] == 2
    assert result["metrics"]["positive_reviews"] + result["metrics"]["negative_reviews"] == 2
    assert result["category_metrics"]
