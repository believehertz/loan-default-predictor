from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Enum as SQLAlchemyEnum, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"
    USER = "USER"

class LoanStatus(str, enum.Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    DISBURSED = "DISBURSED"
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    OVERDUE = "OVERDUE"

class LoanApprovalStatus(str, enum.Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ESCALATED = "ESCALATED"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Password reset fields
    reset_token = Column(String, unique=True, nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    
    # Optional user profile fields
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)

class LoanApplication(Base):
    __tablename__ = "loan_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_employee_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Employee reviewing this loan
    
    # Relationships
    assigned_employee = relationship("User", foreign_keys=[assigned_employee_id], lazy="joined")
    
    # Loan Features
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
    
    # AI Prediction results
    loan_paid_back_probability = Column(Float, nullable=True)
    is_default_predicted = Column(Boolean, nullable=True)
    
    # Loan Status & Approval
    status = Column(SQLAlchemyEnum(LoanStatus), default=LoanStatus.PENDING, nullable=False)
    approval_status = Column(SQLAlchemyEnum(LoanApprovalStatus), default=LoanApprovalStatus.PENDING_REVIEW, nullable=False)
    
    # Approval tracking
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin/Employee who approved
    approval_date = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    employee_notes = Column(Text, nullable=True)
    
    # Documents & Timestamps
    documents_submitted = Column(Boolean, default=False)
    
    # Repayment Schedule
    loan_term_months = Column(Integer, nullable=True)  # Auto-calculated from loan_purpose
    disbursement_date = Column(DateTime(timezone=True), nullable=True)
    repayment_date = Column(DateTime(timezone=True), nullable=True)  # Auto-calculated: disbursement_date + term
    
    # Customer Feedback
    customer_feedback = Column(Text, nullable=True)
    customer_rating = Column(Integer, nullable=True)  # 1-5 star rating
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, unique=True, index=True, nullable=False)
    setting_value = Column(String, nullable=False)
    description = Column(String, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # "LOAN_APPROVED", "USER_CREATED", etc
    resource_type = Column(String, nullable=False)  # "LOAN", "USER", "SETTINGS"
    resource_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InterestRateSetting(Base):
    __tablename__ = "interest_rate_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_purpose = Column(String, unique=True, index=True, nullable=False)
    interest_rate = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class OverrideRequest(Base):
    __tablename__ = "override_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requested_action = Column(String, nullable=False)  # "APPROVED", "REJECTED", etc
    notes = Column(Text, nullable=True)
    admin_response = Column(String, nullable=True)  # "APPROVED", "DENIED"
    response_notes = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who reviewed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class EmployeeBonus(Base):
    __tablename__ = "employee_bonuses"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bonus_type = Column(String, nullable=False)  # "PERFORMANCE", "MILESTONE", "SPECIAL", etc
    amount = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    period = Column(String, nullable=True)  # e.g., "Q1 2024", "January 2024"
    awarded_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who awarded the bonus
    awarded_at = Column(DateTime(timezone=True), server_default=func.now())
