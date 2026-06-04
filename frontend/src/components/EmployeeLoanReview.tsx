import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import { CheckCircle, Cancel, ArrowBack, WarningAmber } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = (() => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${base.replace(/\/+$/, '')}/api`;
})();

interface Loan {
  id: number;
  user_id: number;
  loan_amount: number;
  annual_income: number;
  credit_score: number;
  status: string;
  approval_status: string;
  loan_paid_back_probability: number;
  is_default_predicted: boolean;
  created_at: string;
  employee_notes?: string;
  debt_to_income_ratio: number;
  employment_status: string;
  loan_purpose: string;
  education_level: string;
  marital_status: string;
  gender: string;
  interest_rate: number;
  grade_subgrade: string;
  repayment_date?: string;
}

interface Props {
  darkMode: boolean;
}

const EmployeeLoanReview: React.FC<Props> = ({ darkMode: _ }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { isAdmin } = useAuth();
  const textColor = darkMode ? '#ffffff' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, [activeTab]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let endpoint = `${API_URL}/loans/review-queue`;

      if (activeTab === 1) {
        endpoint = `${API_URL}/loans/assigned`;
      } else if (activeTab === 2 && isAdmin) {
        endpoint = `${API_URL}/loans/all`;
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load loans: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setReviewNotes('');
    setRejectionReason('');
    setReviewDialogOpen(true);
  };

  const submitReview = async (status: 'APPROVED' | 'REJECTED' | 'ESCALATED') => {
    if (!selectedLoan) return;

    try {
      setReviewLoading(true);
      const token = localStorage.getItem('token');

      await axios.post(`${API_URL}/loans/${selectedLoan.id}/review`, {
        approval_status: status,
        notes: reviewNotes,
        rejection_reason: status === 'REJECTED' ? rejectionReason : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReviewDialogOpen(false);
      await fetchLoans();
    } catch (err: any) {
      setError('Failed to submit review: ' + (err.response?.data?.detail || err.message));
    } finally {
      setReviewLoading(false);
    }
  };

  const getRiskColor = (probability: number) => {
    if (probability >= 0.85) return 'success';
    if (probability >= 0.65) return 'info';
    if (probability >= 0.5) return 'warning';
    return 'error';
  };

  const getRiskLabel = (probability: number) => {
    if (probability >= 0.85) return 'Very Low Risk';
    if (probability >= 0.65) return 'Low Risk';
    if (probability >= 0.5) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button 
          variant="text"
          onClick={() => navigate('/dashboard')}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ color: textColor }}>
          Loan Application Review
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ bgcolor: bgColor, color: textColor }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ p: 2 }}>
          <Tab label="Pending Review" />
          <Tab label="Assigned to Me" />
          {isAdmin && <Tab label="All Loans" />}
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Loan ID</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Credit Score</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Risk Level</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        {activeTab === 0 ? 'No pending loans to review' : 'No loans assigned to you'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  loans.map((loan) => (
                    <TableRow key={loan.id} hover>
                      <TableCell sx={{ color: textColor }}>#{loan.id}</TableCell>
                      <TableCell sx={{ color: textColor }}>
                        ${loan.loan_amount.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: textColor }}>
                        {loan.credit_score}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRiskLabel(loan.loan_paid_back_probability)}
                          color={getRiskColor(loan.loan_paid_back_probability) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={loan.approval_status}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleReviewClick(loan)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Loan Application</DialogTitle>
        <DialogContent>
          {selectedLoan && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Applicant Profile</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">Loan Amount</Typography>
                      <Typography variant="body1" fontWeight="medium">${selectedLoan.loan_amount?.toLocaleString() || '—'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">Interest Rate</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedLoan.interest_rate}%</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">Credit Score</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedLoan.credit_score}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">Annual Income</Typography>
                      <Typography variant="body1" fontWeight="medium">${selectedLoan.annual_income?.toLocaleString() || '—'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">DTI Ratio</Typography>
                      <Typography variant="body1" fontWeight="medium">{((selectedLoan.debt_to_income_ratio || 0) * 100).toFixed(1)}%</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">Employment</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedLoan.employment_status || '—'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">Loan Purpose</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedLoan.loan_purpose || '—'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">Education</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedLoan.education_level || '—'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">Marital Status</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedLoan.marital_status || '—'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedLoan.gender || '—'}</Typography>
                    </Grid>
                    {selectedLoan.repayment_date && (
                      <Grid item xs={6} sm={4}>
                        <Typography variant="subtitle2" color="textSecondary">Repayment Date</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {new Date(selectedLoan.repayment_date + 'Z').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={6} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">Grade/Subgrade</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedLoan.grade_subgrade || '—'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">AI Risk Assessment</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={getRiskLabel(selectedLoan.loan_paid_back_probability)}
                          color={getRiskColor(selectedLoan.loan_paid_back_probability) as any}
                        />
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          Payback Probability: {(selectedLoan.loan_paid_back_probability * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Review Notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add your assessment and notes here..."
              />

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Rejection Reason (if applicable)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why you're rejecting this loan (optional)..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)} disabled={reviewLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => submitReview('ESCALATED')}
            variant="outlined"
            startIcon={<WarningAmber />}
            disabled={reviewLoading}
          >
            Escalate
          </Button>
          <Button
            onClick={() => submitReview('REJECTED')}
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            disabled={reviewLoading}
          >
            Reject
          </Button>
          <Button
            onClick={() => submitReview('APPROVED')}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            disabled={reviewLoading}
          >
            {reviewLoading ? <CircularProgress size={24} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeLoanReview;
