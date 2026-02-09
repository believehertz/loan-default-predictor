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
