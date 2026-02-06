FROM python:3.11.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python packages (explicitly list critical ones)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir fastapi uvicorn[standard] xgboost pandas scikit-learn sqlalchemy psycopg2-binary pydantic joblib numpy python-multipart
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Verify installation (debug)
RUN python -c "import fastapi; import uvicorn; print('Packages installed OK')"

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
