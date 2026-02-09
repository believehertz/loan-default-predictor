from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from app.routers import predict, auth

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Loan Default Detector",
    description="AI-powered loan risk assessment API",
    version="2.0.0"
)

# CORS - MUST BE BEFORE ROUTERS
origins = [
    "https://loan-default-predictor-one.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers AFTER CORS
app.include_router(auth.router, prefix="/api")
app.include_router(predict.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Loan API Running", "status": "healthy", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "ok", "cors": "enabled"}
