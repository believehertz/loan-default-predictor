"""
Loan utility functions for term calculation and amortization
"""
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

# Base loan terms by purpose (in months)
# These are adjusted based on LTI, credit score, and DTI
BASE_LOAN_TERMS = {
    "personal": 36,
    "auto": 60,
    "home": 240,
    "mortgage": 240,
    "business": 84,
    "education": 120,
    "medical": 24,
    "debt consolidation": 36,
    "home improvement": 60,
}


def estimate_loan_term(
    loan_amount: float,
    annual_income: float,
    credit_score: int,
    dti_ratio: float,
    loan_purpose: str
) -> int:
    """
    Dynamically calculate loan term based on multiple factors.
    
    Adjustments:
    1. Base term from loan purpose
    2. Loan-to-Income (LTI) adjustment
    3. Credit score adjustment
    4. Debt-to-Income (DTI) adjustment
    5. Clamp to 12-360 months (1-30 years)
    
    Args:
        loan_amount: Loan principal amount
        annual_income: Borrower's annual income
        credit_score: Borrower's credit score (300-850)
        dti_ratio: Debt-to-income ratio as decimal (e.g., 0.35 for 35%)
        loan_purpose: Purpose of the loan
        
    Returns:
        Estimated loan term in months (int)
    """
    # Step 1: Base term from purpose
    purpose_key = loan_purpose.lower()
    term = BASE_LOAN_TERMS.get(purpose_key, 48)  # Default to 48 months if not found
    
    # Step 2: Loan-to-Income (LTI) adjustment
    lti = loan_amount / annual_income if annual_income > 0 else 3
    
    if lti > 3:
        lti_adj = 36
    elif lti > 2:
        lti_adj = 24
    elif lti > 1:
        lti_adj = 12
    else:
        lti_adj = 0
    
    term += lti_adj
    
    # Step 3: Credit score adjustment
    if credit_score > 750:
        credit_adj = -12
    elif credit_score > 700:
        credit_adj = -6
    elif credit_score > 650:
        credit_adj = 0
    elif credit_score > 600:
        credit_adj = 6
    else:
        credit_adj = 12
    
    term += credit_adj
    
    # Step 4: Debt-to-Income (DTI) adjustment
    dti_pct = dti_ratio * 100
    
    if dti_pct > 43:
        dti_adj = 12
    elif dti_pct > 36:
        dti_adj = 6
    elif dti_pct > 28:
        dti_adj = 0
    else:
        dti_adj = -6
    
    term += dti_adj
    
    # Step 5: Clamp to min/max (12-24 months = 1-2 years)
    final_term = max(12, min(int(term), 24))
    
    return final_term


def calculate_repayment_date(
    disbursement_date: datetime,
    loan_amount: float,
    annual_income: float,
    credit_score: int,
    dti_ratio: float,
    loan_purpose: str
) -> datetime:
    """
    Calculate repayment date based on dynamically estimated loan term.
    
    Args:
        disbursement_date: When the loan is disbursed
        loan_amount: Loan principal amount
        annual_income: Borrower's annual income
        credit_score: Borrower's credit score (300-850)
        dti_ratio: Debt-to-income ratio as decimal (e.g., 0.35 for 35%)
        loan_purpose: Purpose of the loan
        
    Returns:
        Estimated repayment date (datetime)
    """
    term_months = estimate_loan_term(loan_amount, annual_income, credit_score, dti_ratio, loan_purpose)
    repayment_date = disbursement_date + relativedelta(months=term_months)
    return repayment_date


def calculate_monthly_payment(
    principal: float,
    annual_interest_rate: float,
    term_months: int
) -> float:
    """
    Calculate fixed monthly payment using standard amortization formula.
    Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    where:
      M = Monthly payment
      P = Principal (loan amount)
      r = Monthly interest rate (annual rate / 12 / 100)
      n = Total number of payments (term in months)
    
    Args:
        principal: Loan amount
        annual_interest_rate: Annual interest rate (as percentage, e.g., 8.5)
        term_months: Loan term in months
        
    Returns:
        Fixed monthly payment amount (float)
    """
    if term_months <= 0 or principal <= 0:
        return 0.0
    
    monthly_rate = (annual_interest_rate / 100) / 12
    
    # If interest rate is 0, simple division
    if monthly_rate == 0:
        return principal / term_months
    
    # Standard amortization formula
    numerator = monthly_rate * (1 + monthly_rate) ** term_months
    denominator = (1 + monthly_rate) ** term_months - 1
    monthly_payment = principal * (numerator / denominator)
    
    return round(monthly_payment, 2)


def get_loan_term_description(term_months: int) -> str:
    """
    Get human-readable term description.
    
    Args:
        term_months: Loan term in months
        
    Returns:
        Description like "36 months (3 years)"
    """
    years = term_months / 12
    if years == int(years):
        return f"{term_months} months ({int(years)} year{'s' if years != 1 else ''})"
    else:
        return f"{term_months} months (~{years:.1f} years)"
