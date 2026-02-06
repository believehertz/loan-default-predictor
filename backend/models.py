from sqlalchemy import Column, Integer, Float, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class LoanApplication(Base):
    __tablename__ = "loan_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    income = Column(Float)
    loan_amount = Column(Float)
    credit_score = Column(Integer)
    employment_years = Column(Integer)
    debt_to_income_ratio = Column(Float)
    
    # ML Prediction results
    default_probability = Column(Float)
    is_default_predicted = Column(Boolean)
    created_at = Column(DateTime(timezone=True), server_default=func.now())