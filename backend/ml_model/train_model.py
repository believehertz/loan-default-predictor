import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

def train_and_save_model():
    csv_path = os.path.join(os.path.dirname(__file__), 'train.csv')
    print(f"Loading training data from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    print(f"\nDataset: {len(df):,} records")
    print(f"Payback rate: {df['loan_paid_back'].mean():.2%}")
    
    # Check class balance
    print(f"Class 0 (Default): {(df['loan_paid_back']==0).sum():,}")
    print(f"Class 1 (Paid): {(df['loan_paid_back']==1).sum():,}")
    
    # Drop ID
    df = df.drop('id', axis=1)
    
    # Define features
    numeric = ['annual_income', 'debt_to_income_ratio', 'credit_score', 
               'loan_amount', 'interest_rate']
    categorical = ['gender', 'marital_status', 'education_level', 
                   'employment_status', 'loan_purpose', 'grade_subgrade']
    
    X = df[numeric + categorical]
    y = df['loan_paid_back']
    
    # Encode categoricals
    encoders = {}
    for col in categorical:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoders[col] = le
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # XGBoost - Balanced approach
    # The issue before: scale_pos_weight was too aggressive
    model = XGBClassifier(
        n_estimators=800,
        max_depth=6,              # Not too deep to prevent overfitting
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=2.5,     # Balanced: help the minority class but not too much
        random_state=42,
        n_jobs=-1,
        eval_metric='logloss'
    )
    
    print("\nTraining...")
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    
    print(f"\n{'='*50}")
    print(f"ACCURACY: {acc:.4f} ({acc:.2%})")
    print(f"AUC: {auc:.4f}")
    print(f"{'='*50}")
    
    print(classification_report(y_test, y_pred, target_names=['Default', 'Paid']))
    
    # Feature importance
    imp = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    print("\nFeature Importance:")
    print(imp)
    
    # Save
    package = {
        'model': model,
        'label_encoders': encoders,
        'numeric_features': numeric,
        'categorical_features': categorical,
        'accuracy': acc,
        'auc': auc
    }
    
    path = os.path.join(os.path.dirname(__file__), 'loan_model.pkl')
    joblib.dump(package, path)
    print(f"\nModel saved: {path}")

if __name__ == "__main__":
    train_and_save_model()
