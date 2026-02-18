from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from app.routers import predict, auth

# Create tables in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Loan Default Detector",
    description="AI-powered loan risk assessment API with Authentication",
    version="2.0.0"
)

# CORS - FIXED: Add your exact Vercel frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://loan-default-predictor-one.vercel.app",  # YOUR FRONTEND URL
        "http://localhost:5173",  # For local development
        "http://localhost:3000",  # Alternative local port
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(predict.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Loan API Running",
        "status": "healthy",
        "docs": "/docs",
        "version": "2.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "cors": "enabled"}
