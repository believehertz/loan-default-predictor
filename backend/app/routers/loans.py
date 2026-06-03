"""
Loan management endpoints for borrowers, employees, and admins
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime

from database import get_db
import models
from schemas import (
    LoanApplicationResponse,
    LoanApplicationCreate,
    LoanReviewRequest,
    InterestRateSettingResponse,
    LoanRequest
)
from app.routers.auth import (
    get_current_active_user,
    require_employee_or_admin,
    require_admin
)
import email_service
from app.routers.predict import _run_prediction


def calculate_grade_subgrade(credit_score: int, debt_to_income_ratio: float, annual_income: float) -> str:
    """
    Calculate bank grade and subgrade based on borrower's financial profile.
    This is an internal bank classification similar to LendingClub's grading system.
    """
    # Grade determination based on credit score
    if credit_score >= 780:
        grade = 'A'
    elif credit_score >= 740:
        grade = 'B'
    elif credit_score >= 700:
        grade = 'C'
    elif credit_score >= 660:
        grade = 'D'
    elif credit_score >= 620:
        grade = 'E'
    elif credit_score >= 580:
        grade = 'F'
    else:
        grade = 'G'

    # Subgrade determination (1-5 within each grade, 1 being best)
    # Based on combination of credit score, DTI, and income
    score_factor = (credit_score - 300) / 550  # Normalize credit score (300-850 to 0-1)
    dti_factor = 1 - debt_to_income_ratio  # Lower DTI is better
    income_factor = min(annual_income / 200000, 1)  # Cap at $200k for normalization

    combined_score = (score_factor * 0.5) + (dti_factor * 0.3) + (income_factor * 0.2)

    # Map combined score to subgrade (1-5)
    if combined_score >= 0.8:
        subgrade = '1'
    elif combined_score >= 0.6:
        subgrade = '2'
    elif combined_score >= 0.4:
        subgrade = '3'
    elif combined_score >= 0.2:
        subgrade = '4'
    else:
        subgrade = '5'

    return f"{grade}{subgrade}"


router = APIRouter(prefix="/loans", tags=["loans"])

# ==========================================
# STATIC ENDPOINTS
# (Must come first to prevent route shadowing)
# ==========================================

@router.get("/interest-rate/{loan_purpose}", response_model=InterestRateSettingResponse)
def get_interest_rate_by_purpose(
    loan_purpose: str,
    db: Session = Depends(get_db)
):
    """Public endpoint to get interest rate for a specific loan purpose."""
    rate = db.query(models.InterestRateSetting).filter(
        models.InterestRateSetting.loan_purpose == loan_purpose,
        models.InterestRateSetting.is_active == True
    ).first()

    if not rate:
        raise HTTPException(
            status_code=404,
            detail=f"No active interest rate configured for loan purpose: {loan_purpose}"
        )

    return rate


# ---------- User (Borrower) ----------

@router.post("/", response_model=LoanApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_loan_application(
    loan_data: LoanApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Borrower submits a new loan application.
    The predict endpoint handles quick scoring only — this creates the formal
    application record (single record per intent, no duplicates).
    Interest rate is auto-populated based on loan purpose.
    """
    if current_user.role in (models.UserRole.ADMIN, models.UserRole.EMPLOYEE):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only borrowers can submit loan applications"
        )

    # Auto-populate interest rate based on loan purpose
    rate_setting = db.query(models.InterestRateSetting).filter(
        models.InterestRateSetting.loan_purpose == loan_data.loan_purpose,
        models.InterestRateSetting.is_active == True
    ).first()

    if not rate_setting:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No interest rate configured for loan purpose: {loan_data.loan_purpose}. Please contact admin."
        )

    interest_rate = rate_setting.interest_rate

    # Auto-calculate grade_subgrade based on financial profile
    calculated_grade = calculate_grade_subgrade(
        loan_data.credit_score,
        loan_data.debt_to_income_ratio,
        loan_data.annual_income
    )

    # Run AI prediction for payback probability
    prediction_request = LoanRequest(
        annual_income=loan_data.annual_income,
        debt_to_income_ratio=loan_data.debt_to_income_ratio,
        credit_score=loan_data.credit_score,
        loan_amount=loan_data.loan_amount,
        interest_rate=interest_rate,
        gender=loan_data.gender,
        marital_status=loan_data.marital_status,
        education_level=loan_data.education_level,
        employment_status=loan_data.employment_status,
        loan_purpose=loan_data.loan_purpose,
        grade_subgrade=calculated_grade
    )
    
    prediction_result = _run_prediction(prediction_request)
    loan_paid_back_probability = prediction_result["proba"]
    is_default_predicted = prediction_result["prediction"] == 0

    db_loan = models.LoanApplication(
        user_id=current_user.id,
        annual_income=loan_data.annual_income,
        debt_to_income_ratio=loan_data.debt_to_income_ratio,
        credit_score=loan_data.credit_score,
        loan_amount=loan_data.loan_amount,
        interest_rate=interest_rate,
        gender=loan_data.gender,
        marital_status=loan_data.marital_status,
        education_level=loan_data.education_level,
        employment_status=loan_data.employment_status,
        loan_purpose=loan_data.loan_purpose,
        grade_subgrade=calculated_grade,
        loan_paid_back_probability=loan_paid_back_probability,
        is_default_predicted=is_default_predicted,
        status=models.LoanStatus.PENDING,
        approval_status=models.LoanApprovalStatus.PENDING_REVIEW,
        documents_submitted=True
    )

    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)

    # Audit log for loan application submission
    audit = models.AuditLog(
        user_id=current_user.id,
        action="LOAN_SUBMITTED",
        resource_type="LOAN",
        resource_id=db_loan.id,
        details=f"User {current_user.username} submitted loan application for ${loan_data.loan_amount} at {interest_rate}% interest"
    )
    db.add(audit)
    db.commit()

    return db_loan


@router.get("/my-applications", response_model=list[LoanApplicationResponse])
def get_my_loan_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Borrower views all their loan applications."""
    if current_user.role != models.UserRole.USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only borrowers can view their applications"
        )

    loans = db.query(models.LoanApplication).filter(
        models.LoanApplication.user_id == current_user.id
    ).all()
    return loans


# ---------- Employee / Admin ----------

@router.get("/review-queue", response_model=list[LoanApplicationResponse])
def get_pending_loans(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_employee_or_admin)
):
    """Employee/Admin views pending loans that need review — paginated."""
    loans = db.query(models.LoanApplication).filter(
        models.LoanApplication.approval_status == models.LoanApprovalStatus.PENDING_REVIEW
    ).offset(skip).limit(limit).all()
    return loans


@router.get("/assigned", response_model=list[LoanApplicationResponse])
def get_assigned_loans(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_employee_or_admin)
):
    """Employee views loans assigned to them — paginated."""
    loans = db.query(models.LoanApplication).filter(
        models.LoanApplication.assigned_employee_id == current_user.id
    ).offset(skip).limit(limit).all()
    return loans


@router.get("/my-stats")
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_employee_or_admin)
):
    """Employee views their own performance stats."""
    total = db.query(func.count(models.LoanApplication.id)).filter(
        models.LoanApplication.approved_by == current_user.id
    ).scalar() or 0

    approved = db.query(func.count(models.LoanApplication.id)).filter(
        models.LoanApplication.approved_by == current_user.id,
        models.LoanApplication.approval_status == models.LoanApprovalStatus.APPROVED
    ).scalar() or 0

    rejected = db.query(func.count(models.LoanApplication.id)).filter(
        models.LoanApplication.approved_by == current_user.id,
        models.LoanApplication.approval_status == models.LoanApprovalStatus.REJECTED
    ).scalar() or 0

    escalated = db.query(func.count(models.LoanApplication.id)).filter(
        models.LoanApplication.assigned_employee_id == current_user.id,
        models.LoanApplication.approval_status == models.LoanApprovalStatus.ESCALATED
    ).scalar() or 0

    assigned_backlog = db.query(func.count(models.LoanApplication.id)).filter(
        models.LoanApplication.assigned_employee_id == current_user.id,
        models.LoanApplication.approval_status == models.LoanApprovalStatus.PENDING_REVIEW
    ).scalar() or 0

    return {
        "total_reviewed": total,
        "approved": approved,
        "rejected": rejected,
        "escalated": escalated,
        "approval_rate": f"{(approved / total * 100) if total > 0 else 0:.1f}%",
        "current_backlog": assigned_backlog,
    }


@router.get("/all", response_model=list[LoanApplicationResponse])
def get_all_loans(
    status: str = None,
    approval_status: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin views all loans with optional filtering and pagination."""
    query = db.query(models.LoanApplication)

    if status:
        try:
            loan_status = models.LoanStatus(status)
            query = query.filter(models.LoanApplication.status == loan_status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

    if approval_status:
        try:
            approval_stat = models.LoanApprovalStatus(approval_status)
            query = query.filter(models.LoanApplication.approval_status == approval_stat)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid approval status")

    return query.offset(skip).limit(limit).all()


# ==========================================
# DYNAMIC ENDPOINTS
# (Must be at the bottom to catch {loan_id})
# ==========================================

@router.get("/{loan_id}", response_model=LoanApplicationResponse)
def get_loan_details(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get loan details — borrower can only see their own, employees/admins can see all."""
    loan = db.query(models.LoanApplication).filter(
        models.LoanApplication.id == loan_id
    ).first()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    if current_user.role == models.UserRole.USER and loan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own loan applications"
        )

    return loan


@router.delete("/{loan_id}/cancel", response_model=LoanApplicationResponse)
def cancel_loan_application(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Borrower cancels a PENDING application before it is reviewed."""
    loan = db.query(models.LoanApplication).filter(
        models.LoanApplication.id == loan_id
    ).first()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    # Borrowers can only cancel their own loans
    if current_user.role == models.UserRole.USER and loan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own applications")

    if loan.status != models.LoanStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Only PENDING applications can be cancelled"
        )

    loan.status = models.LoanStatus.CLOSED
    db.commit()
    db.refresh(loan)

    # Audit
    audit = models.AuditLog(
        user_id=current_user.id,
        action="LOAN_CANCELLED",
        resource_type="LOAN",
        resource_id=loan_id,
        details=f"Application cancelled by user {current_user.username}"
    )
    db.add(audit)
    db.commit()

    return loan


@router.post("/{loan_id}/review", response_model=LoanApplicationResponse)
def review_loan_application(
    loan_id: int,
    review: LoanReviewRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_employee_or_admin)
):
    """
    Employee/Admin reviews and makes decision on loan application.
    Four-eyes rule: employees cannot approve their own assigned loan.
    """
    loan = db.query(models.LoanApplication).filter(
        models.LoanApplication.id == loan_id
    ).first()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    # Four-eyes principle: employee cannot approve/reject their own assigned loan
    if (
        loan.assigned_employee_id == current_user.id
        and current_user.role != models.UserRole.ADMIN
        and review.approval_status in ("APPROVED", "REJECTED")
    ):
        # Create override request instead of blocking
        override_request = models.OverrideRequest(
            loan_id=loan_id,
            employee_id=current_user.id,
            requested_action=review.approval_status,
            notes=f"{review.notes}. Rejection reason: {review.rejection_reason}" if review.approval_status == "REJECTED" and review.rejection_reason else review.notes
        )
        db.add(override_request)
        db.commit()

        # Audit log
        audit = models.AuditLog(
            user_id=current_user.id,
            action="OVERRIDE_REQUESTED",
            resource_type="LOAN",
            resource_id=loan_id,
            details=f"Employee {current_user.username} requested admin override to {review.approval_status} loan assigned to them"
        )
        db.add(audit)
        db.commit()

        raise HTTPException(
            status_code=403,
            detail="Override request submitted to admin for approval. You cannot approve or reject a loan you were assigned to."
        )

    try:
        approval_status = models.LoanApprovalStatus(review.approval_status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid approval status"
        )

    loan.approval_status = approval_status
    loan.employee_notes = review.notes

    # Only set assigned_employee if not already set (first reviewer "claims" it)
    if loan.assigned_employee_id is None:
        loan.assigned_employee_id = current_user.id

    if approval_status == models.LoanApprovalStatus.APPROVED:
        loan.status = models.LoanStatus.APPROVED
        loan.approved_by = current_user.id
        loan.approval_date = datetime.utcnow()
        # Calculate repayment date (e.g., 12 months from approval)
        from dateutil.relativedelta import relativedelta
        loan.repayment_date = datetime.utcnow() + relativedelta(months=12)
    elif approval_status == models.LoanApprovalStatus.REJECTED:
        loan.status = models.LoanStatus.REJECTED
        loan.rejection_reason = review.rejection_reason
        loan.approved_by = current_user.id
        loan.approval_date = datetime.utcnow()
    elif approval_status == models.LoanApprovalStatus.ESCALATED:
        loan.status = models.LoanStatus.PENDING

    db.commit()
    db.refresh(loan)

    # Send email notification for approved/rejected status
    borrower = db.query(models.User).filter(models.User.id == loan.user_id).first()
    if borrower and approval_status in (models.LoanApprovalStatus.APPROVED, models.LoanApprovalStatus.REJECTED):
        background_tasks.add_task(
            email_service.send_loan_status_email,
            to_email=borrower.email,
            username=borrower.username,
            loan_id=loan_id,
            status=approval_status.value,
            rejection_reason=review.rejection_reason if approval_status == models.LoanApprovalStatus.REJECTED else None
        )

    # Audit
    audit_log = models.AuditLog(
        user_id=current_user.id,
        action=f"LOAN_{review.approval_status}",
        resource_type="LOAN",
        resource_id=loan_id,
        details=f"Status changed to {review.approval_status}"
    )
    db.add(audit_log)
    db.commit()

    return loan


@router.post("/{loan_id}/disburse", response_model=LoanApplicationResponse)
def disburse_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_employee_or_admin)
):
    """Employee disburses an approved loan."""
    loan = db.query(models.LoanApplication).filter(
        models.LoanApplication.id == loan_id
    ).first()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    if loan.approval_status != models.LoanApprovalStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only approved loans can be disbursed"
        )

    loan.status = models.LoanStatus.DISBURSED
    db.commit()
    db.refresh(loan)

    audit_log = models.AuditLog(
        user_id=current_user.id,
        action="LOAN_DISBURSED",
        resource_type="LOAN",
        resource_id=loan_id,
        details=f"Loan disbursed by {current_user.username}"
    )
    db.add(audit_log)
    db.commit()

    return loan


@router.post("/{loan_id}/override", response_model=LoanApplicationResponse)
def override_loan_decision(
    loan_id: int,
    review: LoanReviewRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin overrides employee decision on loan."""
    loan = db.query(models.LoanApplication).filter(
        models.LoanApplication.id == loan_id
    ).first()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    try:
        approval_status = models.LoanApprovalStatus(review.approval_status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid approval status")

    old_status = loan.approval_status.value

    loan.approval_status = approval_status
    loan.employee_notes = review.notes
    loan.approved_by = current_user.id
    loan.approval_date = datetime.utcnow()

    if approval_status == models.LoanApprovalStatus.APPROVED:
        loan.status = models.LoanStatus.APPROVED
    elif approval_status == models.LoanApprovalStatus.REJECTED:
        loan.status = models.LoanStatus.REJECTED
        loan.rejection_reason = review.rejection_reason

    db.commit()
    db.refresh(loan)

    audit_log = models.AuditLog(
        user_id=current_user.id,
        action="LOAN_OVERRIDE",
        resource_type="LOAN",
        resource_id=loan_id,
        details=f"Admin override: {old_status} -> {approval_status.value}"
    )
    db.add(audit_log)
    db.commit()

    return loan
