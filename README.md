# Sentiment Analysis System

A browser-based sentiment analysis dashboard with a Python FastAPI backend and a React/Vite frontend. The project supports file upload, NLP sentiment classification, dataset analytics, and a live review testing workflow.

## Project structure

- `src/` — React frontend and dashboard UI
- `sentiment_backend/` — Python NLP and dataset processing module
- `tests/` — backend verification tests
- `firebase-applet-config.json` — Firebase browser config for sign-in support

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+
- Python 3.11+

## Setup

```powershell
npm install
python -m pip install -r requirements.txt
```

## Run the project

### Frontend only

```powershell
npm run dev:frontend
```

### Backend only

```powershell
python -m uvicorn sentiment_backend.main:app --host 0.0.0.0 --port 8000
```

### Full project (frontend + backend)

```powershell
npm run dev:all
```

Then open:
- Frontend: http://localhost:3000
- Backend health: http://localhost:8000/health

## Environment

Create a `.env` file from `.env.example` if you need to override the backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Firebase note

The Firebase web client configuration is read from `firebase-applet-config.json` and is used for Google sign-in. The current upload and analysis flow does not persist data to Firestore. Google sign-in requires the configured Firebase project, Google Authentication enabled, and `localhost` listed as an authorized domain.

Firebase web configuration is delivered to browsers and is not a server-side secret. Protect the Firebase project with appropriate API-key restrictions, Authentication settings, and Firestore Security Rules. Never put service-account credentials in this frontend project.
