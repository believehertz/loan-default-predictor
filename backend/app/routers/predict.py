from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os

# Use ABSOLUTE import, not relative
from backend.database import get_db
from backend.models import LoanApplication, User
from backend.schemas import LoanRequest, LoanPredictionResponse, LoanApplicationResponse
from app.routers.auth import get_current_active_user

import joblib
import pandas as pd
from typing import Any, Dict, List, Optional, cast
import logging
import warnings

# ... rest of file unchanged

router = APIRouter()
logger = logging.getLogger(__name__)

# Suppress XGBoost warnings
warnings.filterwarnings('ignore', category=UserWarning)

# Type annotations for model components loaded from pickle
model_package: Optional[Dict[str, Any]] = None
model: Any = None
encoders: Dict[str, Any] = {}
numeric_features: List[str] = []
categorical_features: List[str] = []
all_features: List[str] = []

# Load model with error handling
try:
    model_path = os.path.join(os.path.dirname(__file__), '../../ml_model/loan_model.pkl')

    if not os.path.exists(model_path):
        # Try alternative path for Railway deployment
        model_path = os.path.join(os.path.dirname(__file__), '../ml_model/loan_model.pkl')

    if not os.path.exists(model_path):
        model_path = 'ml_model/loan_model.pkl'  # Try root relative path

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")

    # Load and immediately cast to Dict to avoid Optional issues
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
    encoders = {}
    numeric_features = []
    categorical_features = []
    all_features = []

@router.post("/predict", response_model=LoanPredictionResponse)
def predict(
    request: LoanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> LoanPredictionResponse:
    if model is None:
        raise HTTPException(status_code=503, detail="Model not available")

    try:
        # Create DataFrame
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

        # Ensure column order matches training
        input_df = input_df[numeric_features + categorical_features]

        # Encode categoricals safely
        col: str
        for col in categorical_features:
            if col in encoders:
                le: Any = encoders[col]
                val: Any = input_df[col].iloc[0]

                if val in le.classes_:
                    input_df[col] = le.transform([val])[0]
                else:
                    input_df[col] = 0
            else:
                logger.warning(f"No encoder found for {col}")

        # Predict
        proba = float(model.predict_proba(input_df)[0][1])
        prediction = int(model.predict(input_df)[0])

        # Determine risk level
        if proba >= 0.85:
            risk_level = "Very Low Risk"
            confidence = "Excellent"
        elif proba >= 0.65:
            risk_level = "Low Risk"
            confidence = "Good"
        elif proba >= 0.5:
            risk_level = "Medium Risk"
            confidence = "Fair"
        else:
            risk_level = "High Risk"
            confidence = "Poor"

        # Save to database
        # prediction=1 means will pay back, 0 means default
        db_app = LoanApplication(
            user_id=current_user.id,
            annual_income=request.annual_income,
            debt_to_income_ratio=request.debt_to_income_ratio,
            credit_score=request.credit_score,
            loan_amount=request.loan_amount,
            interest_rate=request.interest_rate,
            gender=request.gender,
            marital_status=request.marital_status,
            education_level=request.education_level,
            employment_status=request.employment_status,
            loan_purpose=request.loan_purpose,
            grade_subgrade=request.grade_subgrade,
            loan_paid_back_probability=proba,
            is_default_predicted=(prediction == 0)  # True if prediction is 0 (default)
        )

        db.add(db_app)
        db.commit()
        db.refresh(db_app)

        return LoanPredictionResponse(
            loan_paid_back_probability=proba,
            loan_will_be_paid_back=(prediction == 1),  # True if prediction is 1 (paid back)
            risk_level=risk_level,
            confidence=confidence
        )

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/history", response_model=List[LoanApplicationResponse])
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    limit: int = 50
) -> List[Any]:
    """Get prediction history for current user"""
    try:
        predictions = db.query(LoanApplication).filter(
            LoanApplication.user_id == current_user.id
        ).order_by(
            LoanApplication.created_at.desc()
        ).limit(limit).all()

        return predictions  # type: ignore
    except Exception as e:
        logger.error(f"History fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-info")
def model_info() -> Dict[str, Any]:
    if model_package is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Now model_package is not None, cast to Dict
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
    limit: int = 50
) -> Dict[str, Any]:
    """Return aggregated statistics for the current user's predictions"""
    try:
        predictions = db.query(LoanApplication).filter(
            LoanApplication.user_id == current_user.id
        ).order_by(
            LoanApplication.created_at.desc()
        ).limit(limit).all()

        if not predictions:
            return {
                "total_predictions": 0,
                "total_loan_value": 0,
                "avg_probability": 0,
                "risk_distribution": {"low": 0, "medium": 0, "high": 0}
            }

        total_value = sum(float(cast(Any, p).loan_amount or 0) for p in predictions)
        avg_prob = sum(float(cast(Any, p).loan_paid_back_probability or 0) for p in predictions) / len(predictions)

        low = sum(1 for p in predictions if float(cast(Any, p).loan_paid_back_probability or 0) >= 0.7)
        medium = sum(1 for p in predictions if 0.5 <= float(cast(Any, p).loan_paid_back_probability or 0) < 0.7)
        high = sum(1 for p in predictions if float(cast(Any, p).loan_paid_back_probability or 0) < 0.5)

        return {
            "total_predictions": len(predictions),
            "total_loan_value": total_value,
            "avg_probability": avg_prob,
            "risk_distribution": {"low": low, "medium": medium, "high": high}
        }

    except Exception as e:
        logger.error(f"Stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feature-importance")
def get_feature_importance() -> Dict[str, Any]:
    """Get XGBoost feature importance"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        # Handle different model types
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
    """Get predictions over time for charting"""
    try:
        predictions = db.query(LoanApplication).filter(
            LoanApplication.user_id == current_user.id
        ).order_by(LoanApplication.created_at).all()

        timeline: List[Dict[str, Any]] = []
        for p in predictions:
            # Cast to Any to access attributes without Column type issues
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