from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import os

from database import get_db
from models import LoanApplication, User
from schemas import LoanRequest, LoanPredictionResponse, LoanApplicationResponse
from app.routers.auth import get_current_active_user, require_admin, require_employee_or_admin

import joblib
import pandas as pd
from typing import Any, Dict, List, Optional, cast
import logging
import warnings

router = APIRouter()
logger = logging.getLogger(__name__)

warnings.filterwarnings('ignore', category=UserWarning)

model_package: Optional[Dict[str, Any]] = None
model: Any = None
encoders: Dict[str, Any] = {}
numeric_features: List[str] = []
categorical_features: List[str] = []
all_features: List[str] = []

try:
    model_path = os.path.join(os.path.dirname(__file__), '../../ml_model/loan_model.pkl')
    if not os.path.exists(model_path):
        model_path = os.path.join(os.path.dirname(__file__), '../ml_model/loan_model.pkl')
    if not os.path.exists(model_path):
        model_path = 'ml_model/loan_model.pkl'
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")

    loaded_package: Dict[str, Any] = joblib.load(model_path)  # type: ignore
    model_package = loaded_package
    model = loaded_package['model']
    encoders = loaded_package.get('label_encoders', {})
    numeric_features = loaded_package.get('numeric_features', [])
    categorical_features = loaded_package.get('categorical_features', [])
    all_features = loaded_package.get('all_features', numeric_features + categorical_features)
    logger.info(f"Model loaded successfully from {model_path}")

except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    model_package = None
    model = None


def _run_prediction(request: LoanRequest) -> Dict[str, Any]:
    """Core prediction logic, reusable by both /predict and /loans/ submission."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not available")

    input_dict: Dict[str, Any] = {
        'annual_income': request.annual_income,
        'debt_to_income_ratio': request.debt_to_income_ratio,
        'credit_score': request.credit_score,
        'loan_amount': request.loan_amount,
        'interest_rate': request.interest_rate,
        'gender': request.gender,
        'marital_status': request.marital_status,
        'education_level': request.education_level,
        'employment_status': request.employment_status,
        'loan_purpose': request.loan_purpose,
        'grade_subgrade': request.grade_subgrade
    }

    input_df = pd.DataFrame([input_dict])
    input_df = input_df[numeric_features + categorical_features]

    col: str
    for col in categorical_features:
        if col in encoders:
            le: Any = encoders[col]
            val: Any = input_df[col].iloc[0]
            input_df[col] = le.transform([val])[0] if val in le.classes_ else 0
        else:
            logger.warning(f"No encoder found for {col}")

    proba = float(model.predict_proba(input_df)[0][1])
    prediction = int(model.predict(input_df)[0])

    if proba >= 0.85:
        risk_level, confidence = "Very Low Risk", "Excellent"
    elif proba >= 0.65:
        risk_level, confidence = "Low Risk", "Good"
    elif proba >= 0.5:
        risk_level, confidence = "Medium Risk", "Fair"
    else:
        risk_level, confidence = "High Risk", "Poor"

    return {
        "proba": proba,
        "prediction": prediction,
        "risk_level": risk_level,
        "confidence": confidence,
    }


@router.post("/predict", response_model=LoanPredictionResponse)
def predict(
    request: LoanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> LoanPredictionResponse:
    """
    Quick AI score only — does NOT create a LoanApplication row.
    To formally apply, use POST /loans/.
    """
    try:
        result = _run_prediction(request)
        proba = result["proba"]
        prediction = result["prediction"]

        return LoanPredictionResponse(
            loan_paid_back_probability=proba,
            loan_will_be_paid_back=(prediction == 1),
            risk_level=result["risk_level"],
            confidence=result["confidence"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/history", response_model=List[LoanApplicationResponse])
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 50
) -> List[Any]:
    """Get loan application history for current user — paginated."""
    try:
        predictions = db.query(LoanApplication).filter(
            LoanApplication.user_id == current_user.id
        ).order_by(
            LoanApplication.created_at.desc()
        ).offset(skip).limit(limit).all()
        return predictions  # type: ignore
    except Exception as e:
        logger.error(f"History fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/all-predictions", response_model=List[LoanApplicationResponse])
def get_all_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee_or_admin),
    skip: int = 0,
    limit: int = 50
) -> List[Any]:
    """Get all applications system-wide — paginated (replaces hard limit=100 cap)."""
    try:
        predictions = db.query(LoanApplication).order_by(
            LoanApplication.created_at.desc()
        ).offset(skip).limit(limit).all()
        return predictions  # type: ignore
    except Exception as e:
        logger.error(f"All history fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/model-info")
def model_info() -> Dict[str, Any]:
    if model_package is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    pkg: Dict[str, Any] = model_package

    try:
        return {
            "accuracy": f"{pkg.get('accuracy', 0):.2%}",
            "auc": f"{pkg.get('auc', 0):.4f}",
            "training_samples": "593,994",
            "features": numeric_features + categorical_features,
            "top_feature": "employment_status (83.8% importance)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
def get_prediction_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """Aggregated stats for the current user — computed in SQL, not Python loops."""
    try:
        row = db.query(
            func.count(LoanApplication.id).label("total"),
            func.sum(LoanApplication.loan_amount).label("total_value"),
            func.avg(LoanApplication.loan_paid_back_probability).label("avg_prob"),
            func.sum(
                func.cast(LoanApplication.loan_paid_back_probability >= 0.7, db.bind.dialect.INTEGER if db.bind else int)
            ).label("low"),
        ).filter(LoanApplication.user_id == current_user.id).one()

        total = int(row.total or 0)
        avg_prob = float(row.avg_prob or 0)

        # Risk buckets via separate count queries (portable across SQLite & Postgres)
        low = db.query(func.count()).filter(
            LoanApplication.user_id == current_user.id,
            LoanApplication.loan_paid_back_probability >= 0.7
        ).scalar() or 0
        medium = db.query(func.count()).filter(
            LoanApplication.user_id == current_user.id,
            LoanApplication.loan_paid_back_probability >= 0.5,
            LoanApplication.loan_paid_back_probability < 0.7
        ).scalar() or 0
        high = db.query(func.count()).filter(
            LoanApplication.user_id == current_user.id,
            LoanApplication.loan_paid_back_probability < 0.5
        ).scalar() or 0

        return {
            "total_predictions": total,
            "total_loan_value": float(row.total_value or 0),
            "avg_probability": avg_prob,
            "risk_distribution": {"low": low, "medium": medium, "high": high}
        }
    except Exception as e:
        logger.error(f"Stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/stats")
def get_admin_prediction_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee_or_admin),
) -> Dict[str, Any]:
    """System-wide aggregated stats — computed in SQL."""
    try:
        row = db.query(
            func.count(LoanApplication.id).label("total"),
            func.sum(LoanApplication.loan_amount).label("total_value"),
            func.avg(LoanApplication.loan_paid_back_probability).label("avg_prob"),
        ).one()

        total = int(row.total or 0)
        avg_prob = float(row.avg_prob or 0)

        low = db.query(func.count()).filter(
            LoanApplication.loan_paid_back_probability >= 0.7
        ).scalar() or 0
        medium = db.query(func.count()).filter(
            LoanApplication.loan_paid_back_probability >= 0.5,
            LoanApplication.loan_paid_back_probability < 0.7
        ).scalar() or 0
        high = db.query(func.count()).filter(
            LoanApplication.loan_paid_back_probability < 0.5
        ).scalar() or 0

        return {
            "total_predictions": total,
            "total_loan_value": float(row.total_value or 0),
            "avg_probability": avg_prob,
            "risk_distribution": {"low": low, "medium": medium, "high": high}
        }
    except Exception as e:
        logger.error(f"Admin stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/feature-importance")
def get_feature_importance() -> Dict[str, Any]:
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        importances: List[float]
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif hasattr(model, 'get_booster'):
            booster = model.get_booster()
            importance_dict = booster.get_score(importance_type='gain')
            importances = [importance_dict.get(f, 0) for f in all_features]
        else:
            return {"features": [], "message": "Feature importance not available"}

        if not all_features or len(all_features) != len(importances):
            return {"features": [], "message": "Feature names not available"}

        importance_df = pd.DataFrame({
            'feature': all_features,
            'importance': importances
        }).sort_values('importance', ascending=False)

        top_features = importance_df.head(10)

        return {
            "features": top_features.to_dict('records'),
            "top_feature": importance_df.iloc[0]['feature'] if len(importance_df) > 0 else None,
            "top_importance": float(importance_df.iloc[0]['importance']) if len(importance_df) > 0 else 0
        }
    except Exception as e:
        logger.error(f"Feature importance error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeline")
def get_prediction_timeline(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get predictions over time for charting."""
    try:
        predictions = db.query(LoanApplication).filter(
            LoanApplication.user_id == current_user.id
        ).order_by(LoanApplication.created_at).all()

        timeline: List[Dict[str, Any]] = []
        for p in predictions:
            p_any: Any = p
            prob = float(p_any.loan_paid_back_probability or 0)
            risk = "Low" if prob >= 0.7 else "Medium" if prob >= 0.5 else "High"

            created_at_val: Optional[Any] = p_any.created_at
            loan_amt: Any = p_any.loan_amount

            timeline.append({
                "date": created_at_val.strftime("%Y-%m-%d") if created_at_val else None,
                "probability": prob,
                "loan_amount": float(loan_amt) if loan_amt is not None else 0,
                "risk_level": risk
            })

        return timeline
    except Exception as e:
        logger.error(f"Timeline error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
