# my-llm-app

Fullstack app that queries OpenRouter LLMs using a React frontend and FastAPI backend.


## WORK IN IN PROGRESS

### Current State

- Basic Functionality and Data Stream Logic ✅
- Frontend and Backend Structure (Components, Basic Layout) ✅
- Dockerization (Dockerfile, docker-compose.yml) ✅


### To be done

- Polishing/Smoothing of UI ❗
- Implementation of basic securtiy Standards (Prevention of common attack vectors, encryption) ❗
- Implementation of Streaming 
- Thorough Testing ❗

## 🔧 Setup

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```


### Frontend

```bash
cd frontend
npm install
npm run dev
```
