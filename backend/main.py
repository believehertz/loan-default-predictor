from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from app.routers import predict

# Create tables in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Loan Default Detector",
    description="AI-powered loan risk assessment API",
    version="1.0.0"
)

# Enable CORS - UPDATED FOR RAILWAY DEPLOYMENT
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (Vercel, Railway, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix="/api", tags=["predictions"])

@app.get("/")
def root():
    return {"message": "Loan API Running", "status": "healthy"}