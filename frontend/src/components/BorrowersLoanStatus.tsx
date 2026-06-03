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
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Info } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Loan {
  id: number;
  user_id: number;
  loan_amount: number;
  annual_income: number;
  credit_score: number;
  status: string;
  approval_status: string;
  user_facing_status?: string;
  loan_paid_back_probability: number;
  is_default_predicted: boolean;
  created_at: string;
  approval_date?: string;
  repayment_date?: string;
  rejection_reason?: string;
  employee_notes?: string;
  interest_rate: number;
  employment_status: string;
  loan_purpose: string;
}

interface Props {
  darkMode: boolean;
}

const BorrowersLoanStatus: React.FC<Props> = ({ darkMode: _ }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const textColor = darkMode ? '#ffffff' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchLoans();

    // Poll for status updates every 30 seconds
    const interval = setInterval(() => {
      fetchLoans();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/loans/my-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(response.data);
      setLastUpdated(new Date());
      setError('');
    } catch (err: any) {
      setError('Failed to load your loan applications: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'DISBURSED': return 'info';
      case 'PENDING':
      case 'UNDER_REVIEW': return 'warning';
      default: return 'default';
    }
  };

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setDetailsDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button 
          variant="text"
          onClick={() => navigate('/dashboard')}
          startIcon={<ArrowBack />}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ color: textColor }}>
          My Loan Applications
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/apply-loan')}
        >
          Apply for New Loan
        </Button>
        <Typography variant="caption" color="text.secondary">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Typography>
      </Box>

      <Paper sx={{ bgcolor: bgColor, color: textColor }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : loans.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              You haven't submitted any loan applications yet.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/apply-loan')}
            >
              Apply for a Loan
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Loan ID</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Purpose</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Submitted</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Repayment Date</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id} hover>
                    <TableCell sx={{ color: textColor }}>#{loan.id}</TableCell>
                    <TableCell sx={{ color: textColor }}>
                      ${loan.loan_amount.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: textColor }}>
                      {loan.loan_purpose}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={loan.user_facing_status || loan.status}
                        color={getStatusColor(loan.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: textColor }}>
                      {new Date(loan.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: textColor }}>
                      {loan.repayment_date
                        ? new Date(loan.repayment_date + 'Z').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Info />}
                        onClick={() => handleViewDetails(loan)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Loan Application Details</DialogTitle>
        <DialogContent>
          {selectedLoan && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Loan ID</Typography>
                      <Typography variant="h6">#{selectedLoan.id}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                      <Typography variant="h6">${selectedLoan.loan_amount.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Interest Rate</Typography>
                      <Typography variant="h6">{selectedLoan.interest_rate}%</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                      <Chip
                        label={selectedLoan.user_facing_status || selectedLoan.status}
                        color={getStatusColor(selectedLoan.status) as any}
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Loan Purpose</Typography>
                      <Typography variant="body2">{selectedLoan.loan_purpose}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Credit Score</Typography>
                      <Typography variant="body2">{selectedLoan.credit_score}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Employment Status</Typography>
                      <Typography variant="body2">{selectedLoan.employment_status}</Typography>
                    </Grid>
                    {selectedLoan.repayment_date && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">Repayment Date</Typography>
                        <Typography variant="body2">
                          {new Date(selectedLoan.repayment_date + 'Z').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Submitted On</Typography>
                      <Typography variant="body2">
                        {new Date(selectedLoan.created_at).toLocaleString()}
                      </Typography>
                    </Grid>
                    {selectedLoan.approval_date && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">Decision Date</Typography>
                        <Typography variant="body2">
                          {new Date(selectedLoan.approval_date).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                    {selectedLoan.employee_notes && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">Employee Notes</Typography>
                        <Typography variant="body2">{selectedLoan.employee_notes}</Typography>
                      </Grid>
                    )}
                    {selectedLoan.rejection_reason && (
                      <Grid item xs={12}>
                        <Alert severity="error">
                          <Typography variant="subtitle2">Rejection Reason</Typography>
                          <Typography variant="body2">{selectedLoan.rejection_reason}</Typography>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BorrowersLoanStatus;
