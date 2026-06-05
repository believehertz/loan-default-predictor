from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime

# ==================== AUTHENTICATION SCHEMAS ====================

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

    @validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    full_name: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserDetailResponse(UserResponse):
    """Admin view of user details"""
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class EmployeeCreate(UserCreate):
    pass

# ==================== LOAN PREDICTION SCHEMAS ====================

class LoanRequest(BaseModel):
    # Numeric features — server-side bounds enforced
    annual_income: float = Field(..., gt=0, description="Must be positive")
    debt_to_income_ratio: float = Field(..., ge=0, le=1, description="0–1 ratio")
    credit_score: int = Field(..., ge=300, le=850, description="300–850 FICO range")
    loan_amount: float = Field(..., gt=0, description="Must be positive")
    interest_rate: Optional[float] = Field(None, ge=0, le=100, description="0–100% (auto-set if not provided)")

    # Categorical features
    gender: str
    marital_status: str
    education_level: str
    employment_status: str
    loan_purpose: str
    grade_subgrade: Optional[str] = "A1"  # Default value, not exposed to borrowers

class LoanPredictionResponse(BaseModel):
    loan_paid_back_probability: float
    loan_will_be_paid_back: bool
    risk_level: str
    confidence: str

# ==================== LOAN APPLICATION SCHEMAS ====================

class LoanApplicationCreate(LoanRequest):
    """Borrower submits a new loan application"""
    pass

class LoanApplicationResponse(BaseModel):
    id: int
    user_id: int
    assigned_employee_id: Optional[int] = None
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
    status: str
    approval_status: str
    
    # Repayment Schedule
    loan_term_months: Optional[int] = None
    disbursement_date: Optional[datetime] = None
    repayment_date: Optional[datetime] = None
    monthly_payment: Optional[float] = None  # Calculated as loan_amount / loan_term_months
    
    # Simplified user-facing status (maps internal workflow to plain English)
    user_facing_status: Optional[str] = None
    loan_paid_back_probability: Optional[float] = None
    is_default_predicted: Optional[bool] = None
    employee_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    customer_feedback: Optional[str] = None
    customer_rating: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    approved_by: Optional[int] = None
    approval_date: Optional[datetime] = None

    class Config:
        from_attributes = True

    @validator("user_facing_status", always=True, pre=False)
    def compute_user_facing_status(cls, v, values):
        """Map internal approval_status to a borrower-friendly label."""
        mapping = {
            "PENDING_REVIEW": "Under Review",
            "APPROVED": "Approved",
            "REJECTED": "Rejected",
            "ESCALATED": "Under Review",
        }
        raw = values.get("approval_status", "")
        return mapping.get(raw, "Under Review")

    @validator("monthly_payment", always=True, pre=False)
    def compute_monthly_payment(cls, v, values):
        """Calculate monthly payment as loan_amount / loan_term_months"""
        loan_amount = values.get("loan_amount")
        loan_term = values.get("loan_term_months")
        if loan_amount and loan_term and loan_term > 0:
            return round(loan_amount / loan_term, 2)
        return None

class LoanReviewRequest(BaseModel):
    """Employee/Admin reviews and makes decision on loan"""
    approval_status: str  # "APPROVED", "REJECTED", "ESCALATED"
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    customer_rating: Optional[int] = None  # 1-5 star rating

class SystemSettingResponse(BaseModel):
    id: int
    setting_key: str
    setting_value: str
    setting_type: str
    description: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True

class SystemSettingUpdate(BaseModel):
    setting_value: str
    setting_type: str = "string"   # string | integer | float | boolean
    description: Optional[str] = None

    @validator("setting_value")
    def validate_typed_value(cls, v, values):
        t = values.get("setting_type", "string")
        try:
            if t == "integer":
                int(v)
            elif t == "float":
                float(v)
            elif t == "boolean":
                if v.lower() not in ("true", "false", "1", "0"):
                    raise ValueError()
        except (ValueError, AttributeError):
            raise ValueError(f"Value '{v}' is not a valid {t}")
        return v

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource_type: str
    resource_id: Optional[int]
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class InterestRateSettingResponse(BaseModel):
    id: int
    loan_purpose: str
    interest_rate: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


class InterestRateSettingCreate(BaseModel):
    loan_purpose: str
    interest_rate: float = Field(..., gt=0, le=100, description="Interest rate percentage (0-100)")


class InterestRateSettingUpdate(BaseModel):
    interest_rate: float = Field(..., gt=0, le=100, description="Interest rate percentage (0-100)")
    is_active: bool = True


class OverrideRequestResponse(BaseModel):
    id: int
    loan_id: int
    employee_id: int
    requested_action: str
    admin_response: Optional[str] = None  # "APPROVED", "DENIED"
    notes: Optional[str] = None
    response_notes: Optional[str] = None
    reviewed_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmployeeBonusResponse(BaseModel):
    id: int
    employee_id: int
    bonus_type: str
    amount: float
    reason: Optional[str]
    period: Optional[str]
    awarded_by: Optional[int]
    awarded_at: datetime

    class Config:
        from_attributes = True


class EmployeeBonusCreate(BaseModel):
    employee_id: int
    bonus_type: str
    amount: float = Field(..., gt=0, description="Bonus amount must be positive")
    reason: str
    period: Optional[str] = None

# For user history endpoint
class UserWithPredictions(UserResponse):
    predictions: List[LoanApplicationResponse] = []
