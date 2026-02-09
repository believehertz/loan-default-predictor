from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ==================== AUTHENTICATION SCHEMAS ====================

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# ==================== LOAN PREDICTION SCHEMAS ====================

class LoanRequest(BaseModel):
    # Numeric features
    annual_income: float
    debt_to_income_ratio: float
    credit_score: int
    loan_amount: float
    interest_rate: float
    
    # Categorical features
    gender: str
    marital_status: str
    education_level: str
    employment_status: str
    loan_purpose: str
    grade_subgrade: str

class LoanPredictionResponse(BaseModel):
    loan_paid_back_probability: float
    loan_will_be_paid_back: bool
    risk_level: str
    confidence: str

# ==================== DATABASE RESPONSE SCHEMAS ====================

class LoanApplicationResponse(BaseModel):
    id: int
    annual_income: Optional[float]
    debt_to_income_ratio: Optional[float]
    credit_score: Optional[int]
    loan_amount: Optional[float]
    interest_rate: Optional[float]
    gender: Optional[str]
    marital_status: Optional[str]
    education_level: Optional[str]
    employment_status: Optional[str]
    loan_purpose: Optional[str]
    grade_subgrade: Optional[str]
    loan_paid_back_probability: Optional[float]
    is_default_predicted: Optional[bool]
    created_at: datetime
    owner_id: Optional[int]  # Added to link to user
    
    class Config:
        from_attributes = True

# For user history endpoint
class UserWithPredictions(UserResponse):
    predictions: List[LoanApplicationResponse] = []
    
    class Config:
        from_attributes = True
