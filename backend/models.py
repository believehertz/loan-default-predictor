from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Enum as SQLAlchemyEnum, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
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

    reset_token = Column(String, unique=True, nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)

    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    # Loans submitted by this user (applicant)
    loans = relationship(
        "LoanApplication",
        back_populates="user",
        foreign_keys="LoanApplication.user_id",
        cascade="all, delete-orphan",
    )

    # Loans assigned to this user (employee reviewer)
    assigned_loans = relationship(
        "LoanApplication",
        back_populates="assigned_employee",
        foreign_keys="LoanApplication.assigned_employee_id",
    )

    # Loans approved/rejected by this user (admin/employee)
    approved_loans = relationship(
        "LoanApplication",
        back_populates="approver",
        foreign_keys="LoanApplication.approved_by",
    )


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_employee_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationship to the applicant
    user = relationship(
        "User",
        back_populates="loans",
        foreign_keys=[user_id],
    )

    # Relationship to the assigned employee reviewer
    assigned_employee = relationship(
        "User",
        back_populates="assigned_loans",
        foreign_keys=[assigned_employee_id],
    )

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

    loan_paid_back_probability = Column(Float, nullable=True)
    is_default_predicted = Column(Boolean, nullable=True)

    status = Column(SQLAlchemyEnum(LoanStatus), default=LoanStatus.PENDING, nullable=False)
    approval_status = Column(SQLAlchemyEnum(LoanApprovalStatus), default=LoanApprovalStatus.PENDING_REVIEW, nullable=False)

    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approval_date = Column(DateTime(timezone=True), nullable=True)
    repayment_date = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    employee_notes = Column(Text, nullable=True)
    customer_feedback = Column(Text, nullable=True)
    customer_rating = Column(Integer, nullable=True)  # 1-5 stars

    # Relationship to the approver
    approver = relationship(
        "User",
        back_populates="approved_loans",
        foreign_keys=[approved_by],
    )

    documents_submitted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, unique=True, index=True, nullable=False)
    setting_value = Column(String, nullable=False)
    # Type tag for value validation: string | integer | float | boolean
    setting_type = Column(String, nullable=False, default="string")
    description = Column(String, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class InterestRateSetting(Base):
    __tablename__ = "interest_rate_settings"

    id = Column(Integer, primary_key=True, index=True)
    loan_purpose = Column(String, unique=True, nullable=False)
    interest_rate = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)


class OverrideRequest(Base):
    __tablename__ = "override_requests"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requested_action = Column(String, nullable=False)  # APPROVED, REJECTED
    status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)


class EmployeeBonus(Base):
    __tablename__ = "employee_bonuses"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bonus_type = Column(String, nullable=False)  # MONTHLY_BONUS, PERFORMANCE_BONUS, QUOTA_BONUS
    amount = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    period = Column(String, nullable=True)  # e.g., "2024-01" for monthly
    awarded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    awarded_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    # Nullable + SET NULL so deleting a user doesn't break audit history
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
