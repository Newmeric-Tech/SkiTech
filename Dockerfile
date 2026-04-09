# syntax=docker/dockerfile:1.6
FROM python:3.12-slim AS base

# ── System deps ────────────────────────────────────────────
# build tools needed for asyncpg, bcrypt, psycopg2-binary wheels on slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        curl \
 && rm -rf /var/lib/apt/lists/*

# ── Python env ─────────────────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install Python deps first (better layer caching)
COPY requirements.txt ./
RUN pip install --upgrade pip \
 && pip install -r requirements.txt \
 && pip install greenlet  # required by SQLAlchemy async

# ── App source ─────────────────────────────────────────────
COPY . .

# Coolify (and most PaaS) inject $PORT. Default to 8000 for local docker run.
ENV PORT=8000
EXPOSE 8000

# Healthcheck hits the public health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/health" || exit 1

# Production start: 2 workers, uvloop + httptools, no reload
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2 --loop uvloop --http httptools --proxy-headers --forwarded-allow-ips='*'"]
