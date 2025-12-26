# Kairo - AI Accountability Partner

Kairo is a productivity tool that helps you stay focused by tracking your browsing habits and providing AI-powered insights.

## Prerequisites

- Python 3.8+
- Node.js 16+
- Google Gemini API Key

## Quick Start

### 1. Backend (FastAPI + SQLite)

Open a terminal in the `backend` directory:

```powershell
cd backend
# Create virtual environment if not exists
python -m venv venv
# Activate virtual environment
.\venv\Scripts\Activate.ps1
# Install dependencies
pip install -r requirements.txt
# Set your Gemini API Key
$env:GEMINI_API_KEY = "your_api_key_here"
# Set your Database URL (PostgreSQL)
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/kairo"
# Run the server
python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://localhost:8000`.
Documentation: `http://localhost:8000/docs`.

### 2. Frontend (React)

Open a new terminal in the `frontend` directory:

```powershell
cd frontend
# Install dependencies
npm install --legacy-peer-deps
# Start the development server
npm start
```

The application will open at `http://localhost:3000`.

## Architecture
- **Backend**: FastAPI, `asyncpg` (PostgreSQL), Google Generative AI
- **Frontend**: React, Lucide Icons, Axios

## Troubleshooting
- **Login Error**: Ensure the backend is running on port 8000.
- **AI Insights Failed**: Ensure `GEMINI_API_KEY` is set in your environment variables.
