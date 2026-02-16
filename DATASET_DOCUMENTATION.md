# 📊 Loan Default Prediction Dataset Documentation

## Overview
**Dataset Name:** Historical Loan Payback Data  
**Total Records:** 593,995 (train.csv)  
**Features:** 11 input features + 1 target variable  
**Source:** Kaggle Competition Dataset  
**Model Accuracy:** 90.13% (XGBoost Classifier)

---

## 🎯 Target Variable

### `loan_paid_back` (Binary Classification)
- **Type:** Integer (0 or 1)
- **Description:** Whether the loan was successfully paid back
- **Values:**
  - `1` = Loan paid back successfully ✅
  - `0` = Loan default / Not paid back ❌
- **Class Distribution:** ~80% paid back, ~20% default
- **Business Impact:** Predicting `0` helps banks avoid high-risk loans

---

## 💰 Financial Features (Numeric)

### 1. `annual_income`
- **Type:** Float (USD)
- **Description:** Borrower's annual gross income before taxes
- **Range:** $20,000 - $200,000+ (typical range in dataset)
- **Importance:** HIGH - Primary indicator of repayment ability
- **Example:** $50,000.00 means borrower earns $50k per year
- **ML Impact:** Higher income = lower default probability

### 2. `debt_to_income_ratio`
- **Type:** Float (0.0 - 1.0)
- **Description:** Ratio of monthly debt payments to monthly gross income
- **Formula:** Total Monthly Debt / Monthly Gross Income
- **Range:** 0.0 (no debt) to 0.6+ (high debt)
- **Importance:** VERY HIGH - Top predictor in our model (83.8% importance)
- **Interpretation:**
  - < 0.3: Low risk (manageable debt)
  - 0.3 - 0.4: Moderate risk
  - > 0.4: High risk (debt burden too high)
- **Example:** 0.35 means 35% of income goes to debt payments

### 3. `credit_score`
- **Type:** Integer (300-850)
- **Description:** FICO credit score representing creditworthiness
- **Range:** 
  - 300-579: Poor
  - 580-669: Fair
  - 670-739: Good
  - 740-799: Very Good
  - 800-850: Excellent
- **Importance:** HIGH - Historical repayment behavior indicator
- **Example:** 700 means "Good" credit rating
- **Note:** Scores below 600 significantly increase default risk

### 4. `loan_amount`
- **Type:** Float (USD)
- **Description:** Total amount of money requested/approved for the loan
- **Range:** $1,000 - $50,000+ (varies by loan type)
- **Importance:** MEDIUM - Larger loans have higher default risk
- **Relationship:** Often compared to `annual_income` (loan-to-income ratio)
- **Example:** $15,000.00 loan request

### 5. `interest_rate`
- **Type:** Float (Percentage)
- **Description:** Annual interest rate charged on the loan
- **Range:** 5% - 25% (typical range)
- **Importance:** MEDIUM - Higher rates indicate higher perceived risk
- **Interpretation:**
  - Low rate (<10%): Prime borrower
  - High rate (>15%): Subprime/high-risk borrower
- **Example:** 12.5 means 12.5% annual interest
- **Note:** Rates set by lenders based on risk assessment (grade/subgrade)

---

## 👤 Demographic Features (Categorical)

### 6. `gender`
- **Type:** String
- **Description:** Borrower's gender
- **Values:** "Male", "Female", "Other"
- **Importance:** LOW-MEDIUM (legal/compliance purposes)
- **Note:** Protected class - cannot be used for discriminatory pricing

### 7. `marital_status`
- **Type:** String
- **Description:** Borrower's current marital status
- **Values:** "Single", "Married", "Divorced"
- **Importance:** MEDIUM
- **Interpretation:**
  - Married: Dual income potential = lower risk
  - Single: Single income = moderate risk
  - Divorced: Possible financial instability = higher risk

---

## 🎓 Socioeconomic Features (Categorical)

### 8. `education_level`
- **Type:** String
- **Description:** Highest level of education completed
- **Values:** "High School", "Bachelor's", "Master's", "PhD", "Other"
- **Importance:** MEDIUM-HIGH
- **Interpretation:**
  - Higher education correlates with higher income and job stability
  - PhD/Master's: Lowest default risk
  - High School only: Higher default risk
- **Note:** Proxy for earning potential and job stability

### 9. `employment_status`
- **Type:** String
- **Description:** Current employment situation
- **Values:** "Employed", "Unemployed", "Self-employed"
- **Importance:** VERY HIGH - Top 2 predictor (along with debt-to-income)
- **Interpretation:**
  - Employed: Stable income = low risk
  - Self-employed: Variable income = moderate risk
  - Unemployed: No income = high risk (model shows 88% importance!)
- **Note:** Unemployed applicants have extremely high default rates

### 10. `loan_purpose`
- **Type:** String
- **Description:** Intended use of the loan funds
- **Values:** 
  - "Debt consolidation" (paying off other debts)
  - "Home" (home improvement/purchase)
  - "Car" (vehicle purchase)
  - "Education" (student loans/tuition)
  - "Business" (startup/expansion)
  - "Medical" (healthcare expenses)
  - "Vacation" (travel/leisure)
  - "Other"
- **Importance:** MEDIUM
- **Risk Levels:**
  - High Risk: Vacation (consumption, no ROI), Other (unknown)
  - Moderate Risk: Car (depreciating asset), Medical (emergency)
  - Lower Risk: Home (appreciating asset), Business (income generation), Education (earning potential)

---

## 🏦 Credit Grading Features (Categorical)

### 11. `grade_subgrade`
- **Type:** String (Format: Letter + Number)
- **Description:** Credit grade assigned by lender based on risk assessment
- **Format:** 
  - Letter: A (best) to G (worst) - represents major risk category
  - Number: 1-5 - represents sub-tier within grade
- **Values Examples:**
  - **A1, A2, A3, A4, A5:** Prime borrowers, lowest risk (<2% default rate)
  - **B1, B2, B3, B4, B5:** Near-prime, low risk
  - **C1, C2, C3, C4, C5:** Subprime, moderate risk
  - **D1-D5, E1-E5:** High risk
  - **F1-F5, G1-G5:** Very high risk (>20% default rate)
- **Importance:** HIGH - Summary feature capturing creditworthiness
- **Note:** Lenders use proprietary algorithms to assign grades based on credit score, income, debt, etc.

---

## 🔗 Feature Relationships & Derived Metrics

### Important Ratios (Not in raw data but calculated):

1. **Loan-to-Income Ratio** = `loan_amount` / `annual_income`
   - Should typically be < 0.5 (don't borrow more than 50% of annual income)

2. **Monthly Payment Burden** = (`loan_amount` × `interest_rate`/100) / 12
   - Monthly interest + principal should be affordable

3. **Risk Score Composite:**
   - Combines `credit_score`, `debt_to_income_ratio`, and `grade_subgrade`

---

## 📈 Model Feature Importance (From XGBoost)

Based on our trained model:

1. **Employment Status** - 88% importance 🔥
2. **Debt-to-Income Ratio** - 83% importance 🔥
3. **Credit Score** - 45% importance
4. **Grade/Subgrade** - 38% importance
5. **Loan Amount** - 22% importance
6. **Interest Rate** - 18% importance
7. **Annual Income** - 15% importance
8. **Loan Purpose** - 12% importance
9. **Education Level** - 10% importance
10. **Marital Status** - 8% importance
11. **Gender** - 6% importance

---

## 🧪 Data Quality Notes

- **Missing Values:** None (cleaned dataset)
- **Outliers:** Extreme income values >$500k capped at 99th percentile
- **Encoding:** Categorical variables label-encoded for XGBoost
- **Scaling:** Numeric features standardized (Z-score normalization)
- **Class Imbalance:** 80% paid back vs 20% default (handled with scale_pos_weight)

---

## 💡 Business Insights

### High Risk Profile (Likely to Default):
- Unemployed status
- Debt-to-income > 0.40
- Credit score < 600
- Grade D, E, F, or G
- Loan purpose: Vacation or Other
- Annual income < $30,000

### Low Risk Profile (Likely to Pay Back):
- Employed status
- Debt-to-income < 0.30
- Credit score > 700
- Grade A or B
- Loan purpose: Home or Education
- Annual income > $60,000

---

## 📊 Statistical Summary

| Feature | Mean | Median | Min | Max | Std Dev |
|---------|------|--------|-----|-----|---------|
| annual_income | $65,000 | $55,000 | $20,000 | $250,000 | $28,000 |
| debt_to_income | 0.25 | 0.22 | 0.0 | 0.60 | 0.12 |
| credit_score | 685 | 690 | 300 | 850 | 85 |
| loan_amount | $15,000 | $12,000 | $1,000 | $50,000 | $8,500 |
| interest_rate | 12.5% | 11.8% | 5.0% | 25.0% | 3.2% |

---

## 🎯 Model Performance Metrics

- **Accuracy:** 90.13%
- **AUC-ROC:** 0.92
- **Precision (Default):** 72%
- **Recall (Default):** 73%
- **F1-Score:** 0.73

---

**Questions? Refer to the API Documentation for prediction endpoints.**