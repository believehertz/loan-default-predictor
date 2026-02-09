from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to predictions
    predictions = relationship("LoanApplication", back_populates="owner")

class LoanApplication(Base):
    __tablename__ = "loan_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
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
    
    # Relationship
    owner = relationship("User", back_populates="predictions")
