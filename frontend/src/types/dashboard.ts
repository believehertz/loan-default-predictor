export type UserRole = 'admin' | 'user';
export type TimeRange = '7d' | '30d' | '1y';

export interface Stats {
  total_predictions: number;
  total_loan_value: number;
  avg_probability: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface Feature {
  feature: string;
  importance: number;
}

export interface TimelinePoint {
  date: string;
  probability: number;
}

export interface Prediction {
  id?: string;
  loan_amount: number;
  loan_paid_back_probability: number;
  applicant_name?: string;
  created_at?: string;
  status?: 'approved' | 'pending' | 'rejected';
}

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
}

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  adminOnly?: boolean;
}
