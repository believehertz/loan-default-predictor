from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from app.routers import predict, auth


# Create tables in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Loan Default Detector",
    description="AI-powered loan risk assessment API",
    version="1.0.0"
)

# Enable CORS - ONLY your actual domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://loan-default-predictor-one.vercel.app",  # Your actual Vercel URL from screenshot
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(predict.router, prefix="/api", tags=["predictions"])

@app.get("/")
def root():
    return {"message": "Loan API Running", "status": "healthy"}