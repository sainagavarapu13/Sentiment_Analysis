from __future__ import annotations

from typing import Any

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .file_parser import inspectUploadedFile, processInspectedRows
from .ml_classifier import classify_text
from .nlp_engine import runNLPPipeline

app = FastAPI(title='Sentiment Analysis System', version='1.0.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/analyze-text')
def analyze_text(payload: dict[str, Any]) -> dict:
    text = payload.get('text', '')
    result = runNLPPipeline(text)
    model_result = classify_text(str(text), str(payload.get('model', 'logistic_regression')))
    result.update(model_result)
    result['polarity_score'] = result['polarityScore']
    result['normalized_score'] = result['normalizedScore']
    result['removed_stopwords'] = result['removedStopwords']
    return result


@app.post('/api/inspect-file')
async def inspect_file(file: UploadFile = File(...)) -> dict:
    return inspectUploadedFile(file.file)


@app.post('/api/process-dataset')
def process_dataset(payload: dict[str, Any]) -> dict:
    inspection = payload.get('inspection', {})
    text_column = payload.get('text_column', 'Review_Text')
    target_column = payload.get('target_column')
    date_column = payload.get('date_column')
    rating_column = payload.get('rating_column')
    return processInspectedRows(inspection, text_column, target_column, date_column, rating_column)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('sentiment_backend.main:app', host='0.0.0.0', port=8000, reload=True)
