from dotenv import load_dotenv
load_dotenv()  # Load .env file before anything else imports os.getenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from app.routers import predict, auth, loans, admin
import models

# Create tables
Base.metadata.create_all(bind=engine)

# Seed default interest rates if table is empty
def seed_interest_rates():
    db = SessionLocal()
    try:
        existing_rates = db.query(models.InterestRateSetting).count()
        if existing_rates == 0:
            default_rates = [
                {"loan_purpose": "Debt Consolidation", "interest_rate": 8.5},
                {"loan_purpose": "Home Improvement", "interest_rate": 7.0},
                {"loan_purpose": "Business", "interest_rate": 9.0},
                {"loan_purpose": "Education", "interest_rate": 6.5},
                {"loan_purpose": "Personal", "interest_rate": 10.0},
                {"loan_purpose": "Auto", "interest_rate": 7.5},
            ]
            for rate_data in default_rates:
                rate = models.InterestRateSetting(**rate_data)
                db.add(rate)
            db.commit()
            print("✅ Seeded default interest rates")
    except Exception as e:
        print(f"❌ Error seeding interest rates: {e}")
    finally:
        db.close()

seed_interest_rates()

app = FastAPI(
    title="Loan Default Detector",
    description="AI-powered loan risk assessment API",
    version="2.0.0"
)

# CRITICAL: CORS must be BEFORE routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://loan-default-predictor-snowy.vercel.app",  # YOUR FRONTEND
        "https://loan-default-predictor.vercel.app",     # Alternative
        "https://loan-default-predictor-q8ne.onrender.com", # Backend for development
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers AFTER CORS
app.include_router(auth.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(loans.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Loan API Running", "status": "healthy", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "ok", "cors": "enabled"}
