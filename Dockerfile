FROM python:3.11.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc g++ libpq-dev && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir fastapi uvicorn[standard] xgboost pandas scikit-learn sqlalchemy psycopg2-binary pydantic joblib numpy python-multipart

COPY backend/ ./backend/

EXPOSE 8000

# Use hardcoded port 8000 (Railway maps it automatically)
CMD python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000