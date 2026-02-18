from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from app.routers import predict, auth

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Loan Default Detector",
    version="2.0.0"
)

# NUCLEAR CORS - Allow everything (for testing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow ALL origins (change to specific URL in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(predict.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "ok", "cors": "permissive"}
