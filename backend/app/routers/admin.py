"""
Admin-only endpoints for system management, audit logs, and settings
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional

from database import get_db
import models
from schemas import (
    UserDetailResponse,
    SystemSettingResponse,
    SystemSettingUpdate,
    AuditLogResponse,
    InterestRateSettingResponse,
    InterestRateSettingCreate,
    InterestRateSettingUpdate,
    OverrideRequestResponse,
    EmployeeBonusResponse,
    EmployeeBonusCreate
)
from app.routers.auth import require_admin, require_employee_or_admin

router = APIRouter(prefix="/admin", tags=["admin"])

# ========== USER MANAGEMENT ==========

@router.get("/users", response_model=list[UserDetailResponse])
def list_all_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin views all users — paginated with optional search."""
    query = db.query(models.User)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (models.User.username.ilike(pattern)) | (models.User.email.ilike(pattern))
        )
    return query.offset(skip).limit(limit).all()


@router.get("/users/{user_id}", response_model=UserDetailResponse)
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")

    user.is_active = False
    db.commit()

    audit_log = models.AuditLog(
        user_id=current_user.id,
        action="USER_DEACTIVATED",
        resource_type="USER",
        resource_id=user_id,
        details=f"User {user.username} deactivated"
    )
    db.add(audit_log)
    db.commit()

    return {"message": "User deactivated successfully"}


@router.put("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    db.commit()

    audit_log = models.AuditLog(
        user_id=current_user.id,
        action="USER_ACTIVATED",
        resource_type="USER",
        resource_id=user_id,
        details=f"User {user.username} activated"
    )
    db.add(audit_log)
    db.commit()

    return {"message": "User activated successfully"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin permanently deletes a user. Blocked if loans exist."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    loan_count = db.query(models.LoanApplication).filter(
        models.LoanApplication.user_id == user_id
    ).count()
    if loan_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete: user has {loan_count} loan application(s). Deactivate instead."
        )

    assigned_count = db.query(models.LoanApplication).filter(
        models.LoanApplication.assigned_employee_id == user_id
    ).count()
    if assigned_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete: employee is assigned to {assigned_count} loan(s). Reassign first."
        )

    username_snapshot = user.username
    email_snapshot = user.email
    role_snapshot = user.role.value

    audit_log = models.AuditLog(
        user_id=current_user.id,
        action="USER_DELETED",
        resource_type="USER",
        resource_id=user_id,
        details=f"User deleted — username: {username_snapshot}, email: {email_snapshot}, role: {role_snapshot}"
    )
    db.add(audit_log)
    db.flush()

    db.delete(user)
    db.commit()

    return {"message": f"User '{username_snapshot}' has been permanently deleted."}


# ========== LOAN REASSIGNMENT ==========

@router.put("/loans/{loan_id}/assign")
def assign_loan(
    loan_id: int,
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin reassigns a loan to a different employee."""
    loan = db.query(models.LoanApplication).filter(
        models.LoanApplication.id == loan_id
    ).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    employee = db.query(models.User).filter(
        models.User.id == employee_id,
        models.User.role == models.UserRole.EMPLOYEE
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    old_assignee = loan.assigned_employee_id
    loan.assigned_employee_id = employee_id
    db.commit()

    audit_log = models.AuditLog(
        user_id=current_user.id,
        action="LOAN_REASSIGNED",
        resource_type="LOAN",
        resource_id=loan_id,
        details=f"Reassigned from employee {old_assignee} to {employee_id}"
    )
    db.add(audit_log)
    db.commit()

    return {"message": f"Loan {loan_id} reassigned to employee {employee_id}"}


# ========== EMPLOYEE PERFORMANCE ==========

@router.get("/employee-performance")
def get_employee_performance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """
    Admin sees per-employee review stats: total reviewed, approved, rejected,
    escalated, approval rate, and total bonuses.
    """
    employees = db.query(models.User).filter(
        models.User.role == models.UserRole.EMPLOYEE
    ).all()

    result = []
    for emp in employees:
        total = db.query(func.count(models.LoanApplication.id)).filter(
            models.LoanApplication.approved_by == emp.id
        ).scalar() or 0

        approved = db.query(func.count(models.LoanApplication.id)).filter(
            models.LoanApplication.approved_by == emp.id,
            models.LoanApplication.approval_status == models.LoanApprovalStatus.APPROVED
        ).scalar() or 0

        rejected = db.query(func.count(models.LoanApplication.id)).filter(
            models.LoanApplication.approved_by == emp.id,
            models.LoanApplication.approval_status == models.LoanApprovalStatus.REJECTED
        ).scalar() or 0

        escalated = db.query(func.count(models.LoanApplication.id)).filter(
            models.LoanApplication.assigned_employee_id == emp.id,
            models.LoanApplication.approval_status == models.LoanApprovalStatus.ESCALATED
        ).scalar() or 0

        assigned_backlog = db.query(func.count(models.LoanApplication.id)).filter(
            models.LoanApplication.assigned_employee_id == emp.id,
            models.LoanApplication.approval_status == models.LoanApprovalStatus.PENDING_REVIEW
        ).scalar() or 0

        # Calculate total bonuses
        total_bonus = db.query(func.sum(models.EmployeeBonus.amount)).filter(
            models.EmployeeBonus.employee_id == emp.id
        ).scalar() or 0

        result.append({
            "employee_id": emp.id,
            "username": emp.username,
            "email": emp.email,
            "total_reviewed": total,
            "approved": approved,
            "rejected": rejected,
            "escalated": escalated,
            "approval_rate": f"{(approved / total * 100) if total > 0 else 0:.1f}%",
            "current_backlog": assigned_backlog,
            "total_bonus": float(total_bonus),
        })

    return result


# ========== SYSTEM SETTINGS ==========

@router.get("/settings", response_model=list[SystemSettingResponse])
def get_system_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    return db.query(models.SystemSettings).all()


@router.get("/settings/{key}", response_model=SystemSettingResponse)
def get_system_setting(
    key: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    setting = db.query(models.SystemSettings).filter(
        models.SystemSettings.setting_key == key
    ).first()

    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")

    return setting


@router.post("/settings/{key}", response_model=SystemSettingResponse)
def create_system_setting(
    key: str,
    data: SystemSettingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    existing = db.query(models.SystemSettings).filter(
        models.SystemSettings.setting_key == key
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Setting already exists. Use PUT to update.")

    setting = models.SystemSettings(
        setting_key=key,
        setting_value=data.setting_value,
        setting_type=data.setting_type,
        description=data.description,
        updated_by=current_user.id
    )

    db.add(setting)
    db.commit()
    db.refresh(setting)

    audit_log = models.AuditLog(
        user_id=current_user.id,
        action="SETTING_CREATED",
        resource_type="SETTINGS",
        details=f"Setting '{key}' created (type={data.setting_type})"
    )
    db.add(audit_log)
    db.commit()

    return setting


@router.put("/settings/{key}", response_model=SystemSettingResponse)
def update_system_setting(
    key: str,
    data: SystemSettingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    setting = db.query(models.SystemSettings).filter(
        models.SystemSettings.setting_key == key
    ).first()

    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")

    old_value = setting.setting_value
    setting.setting_value = data.setting_value
    setting.setting_type = data.setting_type
    setting.description = data.description
    setting.updated_by = current_user.id

    db.commit()
    db.refresh(setting)

    audit_log = models.AuditLog(
        user_id=current_user.id,
        action="SETTING_UPDATED",
        resource_type="SETTINGS",
        details=f"Setting '{key}' changed: {old_value} -> {data.setting_value}"
    )
    db.add(audit_log)
    db.commit()

    return setting


# ========== AUDIT LOGS & MONITORING ==========

@router.get("/audit-logs", response_model=list[AuditLogResponse])
def get_audit_logs(
    action: str = None,
    resource_type: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    query = db.query(models.AuditLog)

    if action:
        query = query.filter(models.AuditLog.action.ilike(f"%{action}%"))

    if resource_type:
        query = query.filter(models.AuditLog.resource_type == resource_type)

    return query.order_by(models.AuditLog.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/recent-activity", response_model=list[AuditLogResponse])
def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    return (
        db.query(models.AuditLog)
        .order_by(models.AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/dashboard-stats")
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.is_active == True).count()

    total_loans = db.query(models.LoanApplication).count()
    pending_loans = db.query(models.LoanApplication).filter(
        models.LoanApplication.approval_status == models.LoanApprovalStatus.PENDING_REVIEW
    ).count()
    approved_loans = db.query(models.LoanApplication).filter(
        models.LoanApplication.status == models.LoanStatus.APPROVED
    ).count()
    rejected_loans = db.query(models.LoanApplication).filter(
        models.LoanApplication.status == models.LoanStatus.REJECTED
    ).count()

    total_loan_amount = db.query(
        func.sum(models.LoanApplication.loan_amount)
    ).scalar() or 0

    high_risk_loans = db.query(models.LoanApplication).filter(
        models.LoanApplication.is_default_predicted == True
    ).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_loans": total_loans,
        "pending_loans": pending_loans,
        "approved_loans": approved_loans,
        "rejected_loans": rejected_loans,
        "total_loan_amount": float(total_loan_amount),
        "high_risk_loans": high_risk_loans,
        "approval_rate": f"{(approved_loans / total_loans * 100) if total_loans > 0 else 0:.1f}%"
    }


# ========== INTEREST RATE MANAGEMENT ==========

@router.get("/interest-rates", response_model=list[InterestRateSettingResponse])
def get_all_interest_rates(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin views all interest rate configurations."""
    return db.query(models.InterestRateSetting).all()


@router.post("/interest-rates", response_model=InterestRateSettingResponse, status_code=status.HTTP_201_CREATED)
def create_interest_rate(
    rate_data: InterestRateSettingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin creates a new interest rate configuration for a loan purpose."""
    # Check if loan purpose already exists
    existing = db.query(models.InterestRateSetting).filter(
        models.InterestRateSetting.loan_purpose == rate_data.loan_purpose
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Interest rate for '{rate_data.loan_purpose}' already exists. Use PUT to update."
        )

    rate = models.InterestRateSetting(
        loan_purpose=rate_data.loan_purpose,
        interest_rate=rate_data.interest_rate,
        created_by=current_user.id
    )
    db.add(rate)
    db.commit()
    db.refresh(rate)

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="INTEREST_RATE_CREATED",
        resource_type="INTEREST_RATE",
        resource_id=rate.id,
        details=f"Admin {current_user.username} created interest rate {rate_data.interest_rate}% for {rate_data.loan_purpose}"
    )
    db.add(audit)
    db.commit()

    return rate


@router.put("/interest-rates/{rate_id}", response_model=InterestRateSettingResponse)
def update_interest_rate(
    rate_id: int,
    rate_data: InterestRateSettingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin updates an existing interest rate configuration."""
    rate = db.query(models.InterestRateSetting).filter(
        models.InterestRateSetting.id == rate_id
    ).first()
    if not rate:
        raise HTTPException(status_code=404, detail="Interest rate setting not found")

    old_rate = rate.interest_rate
    rate.interest_rate = rate_data.interest_rate
    rate.is_active = rate_data.is_active
    db.commit()
    db.refresh(rate)

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="INTEREST_RATE_UPDATED",
        resource_type="INTEREST_RATE",
        resource_id=rate_id,
        details=f"Admin {current_user.username} updated interest rate for {rate.loan_purpose} from {old_rate}% to {rate_data.interest_rate}%"
    )
    db.add(audit)
    db.commit()

    return rate


@router.delete("/interest-rates/{rate_id}")
def delete_interest_rate(
    rate_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin deletes an interest rate configuration."""
    rate = db.query(models.InterestRateSetting).filter(
        models.InterestRateSetting.id == rate_id
    ).first()
    if not rate:
        raise HTTPException(status_code=404, detail="Interest rate setting not found")

    loan_purpose_snapshot = rate.loan_purpose
    rate_snapshot = rate.interest_rate

    db.delete(rate)
    db.commit()

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="INTEREST_RATE_DELETED",
        resource_type="INTEREST_RATE",
        resource_id=rate_id,
        details=f"Admin {current_user.username} deleted interest rate {rate_snapshot}% for {loan_purpose_snapshot}"
    )
    db.add(audit)
    db.commit()

    return {"message": "Interest rate setting deleted successfully"}


# ========== OVERRIDE REQUEST MANAGEMENT ==========

@router.get("/override-requests", response_model=list[OverrideRequestResponse])
def get_override_requests(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin views all override requests, optionally filtered by status."""
    query = db.query(models.OverrideRequest)
    if status:
        query = query.filter(models.OverrideRequest.status == status)
    return query.order_by(models.OverrideRequest.created_at.desc()).all()


@router.put("/override-requests/{request_id}/approve")
def approve_override_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin approves an override request, allowing the employee to proceed."""
    override_request = db.query(models.OverrideRequest).filter(
        models.OverrideRequest.id == request_id
    ).first()
    if not override_request:
        raise HTTPException(status_code=404, detail="Override request not found")

    if override_request.status != "PENDING":
        raise HTTPException(status_code=400, detail="Override request has already been processed")

    override_request.status = "APPROVED"
    override_request.reviewed_at = datetime.utcnow()
    override_request.reviewed_by = current_user.id
    db.commit()

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="OVERRIDE_APPROVED",
        resource_type="OVERRIDE_REQUEST",
        resource_id=request_id,
        details=f"Admin {current_user.username} approved override request for loan {override_request.loan_id}"
    )
    db.add(audit)
    db.commit()

    return {"message": "Override request approved. Employee can now proceed with the review."}


@router.put("/override-requests/{request_id}/reject")
def reject_override_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin rejects an override request."""
    override_request = db.query(models.OverrideRequest).filter(
        models.OverrideRequest.id == request_id
    ).first()
    if not override_request:
        raise HTTPException(status_code=404, detail="Override request not found")

    if override_request.status != "PENDING":
        raise HTTPException(status_code=400, detail="Override request has already been processed")

    override_request.status = "REJECTED"
    override_request.reviewed_at = datetime.utcnow()
    override_request.reviewed_by = current_user.id
    db.commit()

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="OVERRIDE_REJECTED",
        resource_type="OVERRIDE_REQUEST",
        resource_id=request_id,
        details=f"Admin {current_user.username} rejected override request for loan {override_request.loan_id}"
    )
    db.add(audit)
    db.commit()

    return {"message": "Override request rejected."}


# ========== EMPLOYEE BONUS MANAGEMENT ==========

@router.get("/bonuses", response_model=list[EmployeeBonusResponse])
def get_all_bonuses(
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin views all bonuses, optionally filtered by employee."""
    query = db.query(models.EmployeeBonus)
    if employee_id:
        query = query.filter(models.EmployeeBonus.employee_id == employee_id)
    return query.order_by(models.EmployeeBonus.awarded_at.desc()).all()


@router.post("/bonuses", response_model=EmployeeBonusResponse, status_code=status.HTTP_201_CREATED)
def create_bonus(
    bonus: EmployeeBonusCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin awards a bonus to an employee."""
    employee = db.query(models.User).filter(models.User.id == bonus.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if employee.role != models.UserRole.EMPLOYEE:
        raise HTTPException(status_code=400, detail="Can only award bonuses to employees")

    new_bonus = models.EmployeeBonus(
        employee_id=bonus.employee_id,
        bonus_type=bonus.bonus_type,
        amount=bonus.amount,
        reason=bonus.reason,
        period=bonus.period,
        awarded_by=current_user.id
    )
    db.add(new_bonus)
    db.commit()
    db.refresh(new_bonus)

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="BONUS_AWARDED",
        resource_type="EMPLOYEE_BONUS",
        resource_id=new_bonus.id,
        details=f"Admin {current_user.username} awarded ${bonus.amount} {bonus.bonus_type} to employee {employee.username}"
    )
    db.add(audit)
    db.commit()

    return new_bonus


@router.delete("/bonuses/{bonus_id}")
def delete_bonus(
    bonus_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin deletes a bonus record."""
    bonus = db.query(models.EmployeeBonus).filter(models.EmployeeBonus.id == bonus_id).first()
    if not bonus:
        raise HTTPException(status_code=404, detail="Bonus not found")

    db.delete(bonus)
    db.commit()

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="BONUS_DELETED",
        resource_type="EMPLOYEE_BONUS",
        resource_id=bonus_id,
        details=f"Admin {current_user.username} deleted bonus record {bonus_id}"
    )
    db.add(audit)
    db.commit()

    return {"message": "Bonus deleted successfully"}


@router.post("/calculate-bonuses")
def calculate_automated_bonuses(
    period: str,  # Format: YYYY-MM
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """
    Automatically calculate and award bonuses based on performance metrics:
    - Number of customers served (loans reviewed)
    - Number of approved loans
    - Customer ratings (1-5 stars)
    
    Bonus formula:
    - Base bonus: $10 per loan reviewed
    - Approval bonus: $5 per approved loan
    - Rating bonus: $20 per loan with 5-star rating, $10 for 4-star, $5 for 3-star
    """
    from datetime import datetime
    
    # Parse period (YYYY-MM)
    try:
        year, month = map(int, period.split('-'))
        period_start = datetime(year, month, 1)
        if month == 12:
            period_end = datetime(year + 1, 1, 1)
        else:
            period_end = datetime(year, month + 1, 1)
    except:
        raise HTTPException(status_code=400, detail="Invalid period format. Use YYYY-MM")

    employees = db.query(models.User).filter(
        models.User.role == models.UserRole.EMPLOYEE
    ).all()

    results = []
    for emp in employees:
        # Get loans reviewed in the period
        loans_reviewed = db.query(models.LoanApplication).filter(
            models.LoanApplication.approved_by == emp.id,
            models.LoanApplication.approval_date >= period_start,
            models.LoanApplication.approval_date < period_end
        ).all()

        if not loans_reviewed:
            continue

        # Calculate metrics
        total_loans = len(loans_reviewed)
        approved_loans = sum(1 for loan in loans_reviewed if loan.approval_status == models.LoanApprovalStatus.APPROVED)
        
        # Calculate rating bonus
        rating_bonus = 0
        for loan in loans_reviewed:
            if loan.customer_rating:
                if loan.customer_rating == 5:
                    rating_bonus += 20
                elif loan.customer_rating == 4:
                    rating_bonus += 10
                elif loan.customer_rating == 3:
                    rating_bonus += 5

        # Calculate total bonus
        base_bonus = total_loans * 10  # $10 per loan reviewed
        approval_bonus = approved_loans * 5  # $5 per approved loan
        total_bonus = base_bonus + approval_bonus + rating_bonus

        # Check if bonus already awarded for this period
        existing_bonus = db.query(models.EmployeeBonus).filter(
            models.EmployeeBonus.employee_id == emp.id,
            models.EmployeeBonus.period == period
        ).first()

        if existing_bonus:
            results.append({
                "employee_id": emp.id,
                "username": emp.username,
                "total_loans": total_loans,
                "approved_loans": approved_loans,
                "base_bonus": base_bonus,
                "approval_bonus": approval_bonus,
                "rating_bonus": rating_bonus,
                "total_bonus": total_bonus,
                "status": "already_awarded",
                "existing_bonus_id": existing_bonus.id
            })
        else:
            # Award the bonus
            new_bonus = models.EmployeeBonus(
                employee_id=emp.id,
                bonus_type="PERFORMANCE_BONUS",
                amount=total_bonus,
                reason=f"Automated bonus for {period}: {total_loans} loans reviewed, {approved_loans} approved, rating bonus ${rating_bonus}",
                period=period,
                awarded_by=current_user.id
            )
            db.add(new_bonus)
            db.commit()

            results.append({
                "employee_id": emp.id,
                "username": emp.username,
                "total_loans": total_loans,
                "approved_loans": approved_loans,
                "base_bonus": base_bonus,
                "approval_bonus": approval_bonus,
                "rating_bonus": rating_bonus,
                "total_bonus": total_bonus,
                "status": "awarded",
                "bonus_id": new_bonus.id
            })

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="BONUS_CALCULATION",
        resource_type="EMPLOYEE_BONUS",
        resource_id=0,
        details=f"Admin {current_user.username} calculated automated bonuses for period {period}"
    )
    db.add(audit)
    db.commit()

    return {
        "period": period,
        "results": results,
        "total_employees": len(results)
    }
