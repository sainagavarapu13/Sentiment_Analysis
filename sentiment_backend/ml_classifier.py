from __future__ import annotations

import re
from collections import Counter
from functools import lru_cache
from pathlib import Path
from typing import Any

import nltk
import numpy as np
import pandas as pd
from gensim.models import Word2Vec
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import TreebankWordTokenizer
from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC

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

REVIEWS_PATH = Path(__file__).resolve().with_name('reviews.csv')
df = pd.read_csv(REVIEWS_PATH)
LABELS = ('negative', 'neutral', 'positive')
WORD2VEC_SIZE = 48
TOKENIZER = TreebankWordTokenizer()
LEMMATIZER = WordNetLemmatizer()
NEGATIONS = {'no', 'not', 'nor', 'never', "n't"}

TRAINING_SAMPLES = tuple(
    (row['sentiment'].lower(), row['review'])
    for _, row in df.iterrows()
    if pd.notna(row['sentiment']) and pd.notna(row['review'])
)


def _load_stopwords() -> tuple[set[str], str]:
    try:
        return set(stopwords.words('english')) - NEGATIONS, 'NLTK English stopwords'
    except LookupError:
        nltk.download('stopwords', quiet=True, raise_on_error=False)
        try:
            return set(stopwords.words('english')) - NEGATIONS, 'NLTK English stopwords'
        except LookupError:
            return STOPWORDS - NEGATIONS, 'bundled English stopwords (NLTK data unavailable)'


@lru_cache(maxsize=1)
def _stopwords() -> tuple[set[str], str]:
    return _load_stopwords()


def _raw_tokens(text: str) -> list[str]:
    cleaned = re.sub(r'https?://\S+|www\.\S+', ' ', text.lower())
    return [
        token.lower()
        for token in TOKENIZER.tokenize(cleaned)
        if re.search(r'[a-z0-9]', token.lower())
    ]


def _lemmatize(token: str) -> str:
    try:
        verb_lemma = LEMMATIZER.lemmatize(token, pos='v')
    except LookupError:
        nltk.download('wordnet', quiet=True, raise_on_error=False)
        try:
            verb_lemma = LEMMATIZER.lemmatize(token, pos='v')
        except LookupError:
            return token
    return LEMMATIZER.lemmatize(verb_lemma, pos='n')


def _tokens(text: str) -> list[str]:
    stopword_set, _ = _stopwords()
    return [_lemmatize(token) for token in _raw_tokens(text) if token not in stopword_set]


def _document_vector(tokens: list[str], word_vectors: Any) -> np.ndarray:
    vectors = [word_vectors[word] for word in tokens if word in word_vectors]
    if not vectors:
        return np.zeros(WORD2VEC_SIZE, dtype=np.float32)
    return np.mean(vectors, axis=0)


@lru_cache(maxsize=3)
def _trained_model(model_name: str) -> dict[str, Any]:
    documents = [_tokens(text) for _, text in TRAINING_SAMPLES]
    labels = [label for label, _ in TRAINING_SAMPLES]

    if model_name == 'word2vec':
        embeddings = Word2Vec(
            sentences=documents,
            vector_size=WORD2VEC_SIZE,
            window=5,
            min_count=1,
            workers=1,
            seed=17,
            epochs=100,
        )
        features = np.vstack([_document_vector(document, embeddings.wv) for document in documents])
        classifier = LogisticRegression(max_iter=1000, class_weight='balanced', random_state=17)
        classifier.fit(features, labels)
        return {'classifier': classifier, 'embeddings': embeddings.wv}

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
    features = vectorizer.fit_transform([' '.join(document) for document in documents])
    if model_name == 'logistic_regression':
        classifier = LogisticRegression(max_iter=1000, class_weight='balanced', random_state=17)
    else:
        classifier = CalibratedClassifierCV(
            LinearSVC(class_weight='balanced', random_state=17),
            method='sigmoid',
            cv=3,
        )
    classifier.fit(features, labels)
    return {'classifier': classifier, 'vectorizer': vectorizer}


def classify_text(text: str, model_name: str = 'logistic_regression') -> dict[str, Any]:
    if model_name not in {'logistic_regression', 'svm', 'word2vec'}:
        raise ValueError('model must be logistic_regression, svm, or word2vec')

    stopword_set, stopword_source = _stopwords()
    raw_tokens = _raw_tokens(text)
    retained_raw_tokens = [token for token in raw_tokens if token not in stopword_set]
    tokens = [_lemmatize(token) for token in retained_raw_tokens]
    removed_stopwords = [token for token in raw_tokens if token in stopword_set]
    ngrams = [' '.join(tokens[index:index + size]) for size in (1, 2) for index in range(len(tokens) - size + 1)]
    model = _trained_model(model_name)

    if model_name == 'word2vec':
        features = _document_vector(tokens, model['embeddings']).reshape(1, -1)
        confidence_values = model['classifier'].predict_proba(features)[0]
        top_features = []
        feature_method = f'Word2Vec mean-pooled embeddings ({WORD2VEC_SIZE} dimensions)'
    else:
        vectorizer = model['vectorizer']
        features = vectorizer.transform([' '.join(tokens)])
        confidence_values = model['classifier'].predict_proba(features)[0]
        names = vectorizer.get_feature_names_out()
        weights = features.toarray()[0]
        top_features = [str(names[index]) for index in np.argsort(weights)[::-1] if weights[index] > 0][:8]
        feature_method = 'TF-IDF unigram and bigram features'

    probabilities = {label: float(score) for label, score in zip(model['classifier'].classes_, confidence_values)}
    sentiment = str(model['classifier'].classes_[int(np.argmax(confidence_values))])
    polarity = probabilities.get('positive', 0.0) - probabilities.get('negative', 0.0)
    return {
        'sentiment': sentiment,
        'confidence': round(max(probabilities.values()), 3),
        'polarityScore': round(polarity, 3),
        'normalizedScore': round((polarity + 1) / 2, 3),
        'rawTokens': retained_raw_tokens,
        'lemmatizedTokens': tokens,
        'tokens': tokens,
        'removedStopwords': removed_stopwords,
        'modelDetails': {
            'model': model_name,
            'modelLabel': {
                'logistic_regression': 'Logistic Regression',
                'svm': 'Linear SVM',
                'word2vec': 'Word2Vec + Logistic Regression',
            }[model_name],
            'featureMethod': feature_method,
            'topFeatures': top_features,
            'topNgrams': Counter(ngrams).most_common(8),
            'probabilities': {label: round(probabilities.get(label, 0.0), 3) for label in LABELS},
            'stopwordSource': stopword_source,
            'lemmatizer': 'NLTK WordNet (verb and noun forms)',
            'trainingSamples': len(TRAINING_SAMPLES),
            'word2VecDimensions': WORD2VEC_SIZE if model_name == 'word2vec' else None,
        },
    }