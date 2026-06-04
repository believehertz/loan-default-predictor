import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, TextField, Chip,
  CircularProgress, Alert, Divider
} from '@mui/material';
import { Search, Warning, CheckCircle, Assignment, TrendingUp } from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface LoanApplication {
  id: number;
  user_id: number;
  loan_amount: number;
  credit_score: number;
  annual_income: number;
  debt_to_income_ratio: number;
  employment_status: string;
  loan_purpose: string;
  education_level: string;
  marital_status: string;
  gender: string;
  interest_rate: number;
  grade_subgrade: string;
  loan_paid_back_probability: number;
  is_default_predicted: boolean;
  approval_status: string;
  status: string;
  created_at: string;
}

interface EmployeeStats {
  total_reviewed: number;
  approved: number;
  rejected: number;
  escalated: number;
  approval_rate: string;
  current_backlog: number;
}

interface Props {
  darkMode: boolean;
}

const EmployeeDashboard: React.FC<Props> = ({ darkMode }) => {
  const textColor = darkMode ? '#ffffff' : '#000000';
  const paperBg = darkMode ? 'rgba(26, 26, 46, 0.7)' : '#ffffff';

  const [queue, setQueue] = useState<LoanApplication[]>([]);
  const [assigned, setAssigned] = useState<LoanApplication[]>([]);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [queueRes, assignedRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/loans/review-queue?limit=20`, { headers }),
        axios.get(`${API_URL}/loans/assigned?limit=20`, { headers }),
        axios.get(`${API_URL}/loans/my-stats`, { headers }).catch(() => ({ data: null })),
      ]);

      setQueue(queueRes.data);
      setAssigned(assignedRes.data);
      if (statsRes.data) setEmployeeStats(statsRes.data);
    } catch (err: any) {
      setError('Failed to load data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (loanId: number, decision: 'APPROVED' | 'REJECTED') => {
    try {
      setReviewingId(loanId);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `${API_URL}/loans/${loanId}/review`,
        { approval_status: decision },
        { headers }
      );
      await fetchData();
    } catch (err: any) {
      setError('Review failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setReviewingId(null);
    }
  };

  const riskColor = (prob: number) => {
    if (prob >= 0.7) return 'success';
    if (prob >= 0.5) return 'warning';
    return 'error';
  };

  const riskLabel = (prob: number) => {
    if (prob >= 0.7) return 'Low Risk';
    if (prob >= 0.5) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, color: textColor }}>
        Employee Workspace
      </Typography>

      {/* Stats strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Pending Review', value: queue.length, icon: <Warning color="warning" /> },
          { label: 'Assigned to Me', value: assigned.length, icon: <Assignment color="info" /> },
          { label: 'Total Reviewed', value: employeeStats?.total_reviewed || 0, icon: <TrendingUp color="success" /> },
          { label: 'Approval Rate', value: employeeStats?.approval_rate || '0%', icon: <CheckCircle color="primary" /> },
        ].map((card) => (
          <Grid item xs={6} md={3} key={card.label}>
            <Paper sx={{ p: 2, bgcolor: paperBg, color: textColor, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {card.icon}
              <Box>
                <Typography variant="h5" fontWeight="bold">{card.value}</Typography>
                <Typography variant="caption" color="text.secondary">{card.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Pending Review Queue */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, bgcolor: paperBg, color: textColor, borderRadius: 2, minHeight: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" />
              Pending Manual Reviews
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
              Applications awaiting human review
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
            ) : queue.length === 0 ? (
              <Box display="flex" flexDirection="column" alignItems="center" mt={4} gap={1}>
                <CheckCircle color="success" sx={{ fontSize: 48 }} />
                <Typography color="text.secondary">All caught up — no pending reviews!</Typography>
              </Box>
            ) : (
              queue.map((loan) => (
                <Box
                  key={loan.id}
                  sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography fontWeight="bold">App ID: #L-{loan.id}</Typography>
                    <Chip
                      label={riskLabel(loan.loan_paid_back_probability)}
                      color={riskColor(loan.loan_paid_back_probability) as any}
                      size="small"
                    />
                  </Box>

                  {/* Full applicant profile */}
                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    {[
                      { label: 'Loan Amount', value: `$${loan.loan_amount?.toLocaleString()}` },
                      { label: 'Credit Score', value: loan.credit_score },
                      { label: 'Annual Income', value: `$${loan.annual_income?.toLocaleString()}` },
                      { label: 'DTI Ratio', value: `${(loan.debt_to_income_ratio * 100).toFixed(1)}%` },
                      { label: 'Employment', value: loan.employment_status },
                      { label: 'Purpose', value: loan.loan_purpose },
                      { label: 'Education', value: loan.education_level },
                      { label: 'Payback Prob.', value: `${(loan.loan_paid_back_probability * 100).toFixed(1)}%` },
                    ].map(({ label, value }) => (
                      <Grid item xs={6} sm={3} key={label}>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                        <Typography variant="body2" fontWeight="medium">{value ?? '—'}</Typography>
                      </Grid>
                    ))}
                  </Grid>

                  <Box display="flex" gap={2} mt={1}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      disabled={reviewingId === loan.id}
                      onClick={() => handleReview(loan.id, 'APPROVED')}
                    >
                      {reviewingId === loan.id ? <CircularProgress size={16} /> : 'Approve'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled={reviewingId === loan.id}
                      onClick={() => handleReview(loan.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: paperBg, color: textColor, borderRadius: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>User Lookup</Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
              <TextField
                fullWidth
                label="Search by Email or ID"
                variant="standard"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  input: { color: textColor },
                  label: { color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }
                }}
              />
              <Button sx={{ ml: 1 }} variant="contained"><Search /></Button>
            </Box>

            <Typography variant="subtitle2" color="text.secondary" mb={1}>Quick Links</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button variant="text" sx={{ justifyContent: 'flex-start' }} href="/predict">Run Assessment</Button>
              <Button variant="text" sx={{ justifyContent: 'flex-start' }} href="/reports">View Reports</Button>
            </Box>
          </Paper>

          {/* My Assigned Backlog */}
          <Paper sx={{ p: 3, bgcolor: paperBg, color: textColor, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp fontSize="small" /> My Assigned Loans
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : assigned.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No assigned loans.</Typography>
            ) : (
              assigned.slice(0, 5).map((loan) => (
                <Box key={loan.id} sx={{ mb: 1 }}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">#L-{loan.id}</Typography>
                    <Chip label={loan.approval_status} size="small" variant="outlined" />
                  </Box>
                  <Divider sx={{ mt: 0.5 }} />
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
