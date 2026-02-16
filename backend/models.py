from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Password reset fields
    reset_token = Column(String, unique=True, nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)

class LoanApplication(Base):
    __tablename__ = "loan_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    
    # Features
    annual_income = Column(Float)
    debt_to_income_ratio = Column(Float)
    credit_score = Column(Integer)
    loan_amount = Column(Float)
    interest_rate = Column(Float)
    gender = Column(String)
    marital_status = Column(String)
    education_level = Column(String)
    employment_status = Column(String)
    loan_purpose = Column(String)
    grade_subgrade = Column(String)
    
    # Prediction results
    loan_paid_back_probability = Column(Float)
    is_default_predicted = Column(Boolean)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
