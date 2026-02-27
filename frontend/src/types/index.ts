export interface PredictionData {
  loan_paid_back_probability: number;
  loan_will_be_paid_back: boolean;
  risk_level: string;
  confidence: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoanApplication {
  id: number;
  annual_income: number;
  debt_to_income_ratio: number;
  credit_score: number;
  loan_amount: number;
  interest_rate: number;
  gender: string;
  marital_status: string;
  education_level: string;
  employment_status: string;
  loan_purpose: string;
  grade_subgrade: string;
  loan_paid_back_probability?: number;
  is_default_predicted?: boolean;
  created_at: string;
}
