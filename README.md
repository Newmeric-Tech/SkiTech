# SkiTech Monorepo

Full-stack hospitality governance platform.

## Structure

```
├── frontend/    # Next.js application
└── backend/    # FastAPI application
```

## Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
