from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import LoanApplication, User
from auth import get_current_active_user
from schemas import LoanRequest, LoanPredictionResponse, LoanApplicationResponse
import joblib
import os
import pandas as pd
from typing import List

router = APIRouter()

# Load model
model_path = os.path.join(os.path.dirname(__file__), '../../ml_model/loan_model.pkl')
model_package = joblib.load(model_path)
model = model_package['model']
encoders = model_package['label_encoders']
numeric_features = model_package['numeric_features']
categorical_features = model_package['categorical_features']

@router.post("/predict", response_model=LoanPredictionResponse)
def predict(
    request: LoanRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        # Create DataFrame
        input_dict = {
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
        
        # Encode categoricals safely
        for col in categorical_features:
            le = encoders[col]
            val = input_df[col].iloc[0]
            
            if val in le.classes_:
                input_df[col] = le.transform([val])[0]
            else:
                input_df[col] = 0
        
        # Predict
        proba = model.predict_proba(input_df)[0][1]
        prediction = model.predict(input_df)[0]
        
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
        
        # Save to database with user_id
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
            loan_paid_back_probability=float(proba),
            is_default_predicted=not bool(prediction)
        )
        
        db.add(db_app)
        db.commit()
        db.refresh(db_app)
        
        return LoanPredictionResponse(
            loan_paid_back_probability=float(proba),
            loan_will_be_paid_back=bool(prediction),
            risk_level=risk_level,
            confidence=confidence
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[LoanApplicationResponse])
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    limit: int = 50
):
    """Get prediction history for current user"""
    predictions = db.query(LoanApplication).filter(
        LoanApplication.user_id == current_user.id
    ).order_by(
        LoanApplication.created_at.desc()
    ).limit(limit).all()
    
    return predictions

@router.get("/model-info")
def model_info():
    return {
        "accuracy": f"{model_package.get('accuracy', 0):.2%}",
        "auc": f"{model_package.get('auc', 0):.4f}",
        "training_samples": "593,994",
        "features": numeric_features + categorical_features,
        "top_feature": "employment_status (83.8% importance)"
    }

@router.get("/stats")
def get_prediction_stats(current_user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Get user's prediction statistics"""
    predictions = db.query(LoanApplication).filter(
        LoanApplication.user_id == current_user.id
    ).all()
    
    if not predictions:
        return {
            "total_predictions": 0,
            "total_loan_value": 0,
            "avg_probability": 0,
            "risk_distribution": {"low": 0, "medium": 0, "high": 0}
        }
    
    total_value = sum(p.loan_amount for p in predictions)
    avg_prob = sum(p.loan_paid_back_probability or 0 for p in predictions) / len(predictions)
    
    # Risk distribution
    low = sum(1 for p in predictions if (p.loan_paid_back_probability or 0) >= 0.7)
    medium = sum(1 for p in predictions if 0.5 <= (p.loan_paid_back_probability or 0) < 0.7)
    high = sum(1 for p in predictions if (p.loan_paid_back_probability or 0) < 0.5)
    
    return {
        "total_predictions": len(predictions),
        "total_loan_value": total_value,
        "avg_probability": avg_prob,
        "risk_distribution": {"low": low, "medium": medium, "high": high}
    }

@router.get("/feature-importance")
def get_feature_importance():
    """Get XGBoost feature importance"""
    importance_df = pd.DataFrame({
        'feature': model_package['all_features'],
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    return {
        "features": importance_df.head(10).to_dict('records'),
        "top_feature": importance_df.iloc[0]['feature'],
        "top_importance": float(importance_df.iloc[0]['importance'])
    }

@router.get("/timeline")
def get_prediction_timeline(current_user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Get predictions over time for charting"""
    predictions = db.query(LoanApplication).filter(
        LoanApplication.user_id == current_user.id
    ).order_by(LoanApplication.created_at).all()
    
    timeline = []
    for p in predictions:
        timeline.append({
            "date": p.created_at.strftime("%Y-%m-%d"),
            "probability": p.loan_paid_back_probability,
            "loan_amount": p.loan_amount,
            "risk_level": "Low" if p.loan_paid_back_probability >= 0.7 else "Medium" if p.loan_paid_back_probability >= 0.5 else "High"
        })
    
    return timeline