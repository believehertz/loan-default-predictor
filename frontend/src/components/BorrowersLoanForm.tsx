import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface LoanFormData {
  annual_income: number | '';
  debt_to_income_ratio: number | '';
  credit_score: number | '';
  loan_amount: number | '';
  gender: string;
  marital_status: string;
  education_level: string;
  employment_status: string;
  loan_purpose: string;
}

interface Props {
  darkMode: boolean;
}

const BorrowersLoanForm: React.FC<Props> = ({ darkMode: _ }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<LoanFormData>({
    annual_income: '',
    debt_to_income_ratio: '',
    credit_score: '',
    loan_amount: '',
    gender: 'Male',
    marital_status: 'Single',
    education_level: 'Bachelor',
    employment_status: 'Employed',
    loan_purpose: 'Debt Consolidation',
  });

  const [currentInterestRate, setCurrentInterestRate] = useState<number | null>(null);

  const textColor = darkMode ? '#ffffff' : '#1e293b';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';

  const handleChange = (field: keyof LoanFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Fetch interest rate when loan purpose changes
    if (field === 'loan_purpose') {
      fetchInterestRate(value);
    }
  };

  const fetchInterestRate = async (loanPurpose: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/loans/interest-rate/${loanPurpose}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentInterestRate(response.data.interest_rate);
    } catch (err: any) {
      console.error('Failed to fetch interest rate:', err);
      setCurrentInterestRate(null);
    }
  };

  useEffect(() => {
    // Fetch initial interest rate for default loan purpose
    fetchInterestRate(formData.loan_purpose);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.annual_income || !formData.credit_score || !formData.loan_amount) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/loans/`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Loan application submitted successfully! You can track its status in your dashboard.');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit loan application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Card sx={{ bgcolor: bgColor, color: textColor }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Apply for a Loan
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
            Fill out the form below to submit your loan application
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Financial Information */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Financial Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Annual Income ($)"
                  type="number"
                  value={formData.annual_income}
                  onChange={(e) => handleChange('annual_income', parseFloat(e.target.value) || '')}
                  required
                  inputProps={{ step: 'any', min: '0' }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: textColor
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Debt-to-Income Ratio"
                  type="number"
                  value={formData.debt_to_income_ratio}
                  onChange={(e) => handleChange('debt_to_income_ratio', parseFloat(e.target.value) || '')}
                  required
                  inputProps={{ step: '0.01', min: '0', max: '1' }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: textColor
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Credit Score"
                  type="number"
                  value={formData.credit_score}
                  onChange={(e) => handleChange('credit_score', parseInt(e.target.value) || '')}
                  required
                  inputProps={{ min: '300', max: '850' }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: textColor
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Loan Amount ($)"
                  type="number"
                  value={formData.loan_amount}
                  onChange={(e) => handleChange('loan_amount', parseFloat(e.target.value) || '')}
                  required
                  inputProps={{ step: 'any', min: '0' }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: textColor
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Interest Rate (%)"
                  type="number"
                  value={currentInterestRate !== null ? currentInterestRate : 'Loading...'}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                    }
                  }}
                  helperText="Auto-set based on loan purpose"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: textColor
                    }
                  }}
                />
              </Grid>

              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 2 }}>
                  Personal Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: textColor
                    }
                  }}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Marital Status"
                  value={formData.marital_status}
                  onChange={(e) => handleChange('marital_status', e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: textColor
                    }
                  }}
                >
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Education Level"
                  value={formData.education_level}
                  onChange={(e) => handleChange('education_level', e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: textColor
                    }
                  }}
                >
                  <MenuItem value="High School">High School</MenuItem>
                  <MenuItem value="Bachelor">Bachelor</MenuItem>
                  <MenuItem value="Master">Master</MenuItem>
                  <MenuItem value="PhD">PhD</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Employment Status"
                  value={formData.employment_status}
                  onChange={(e) => handleChange('employment_status', e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: textColor
                    }
                  }}
                >
                  <MenuItem value="Employed">Employed</MenuItem>
                  <MenuItem value="Self-Employed">Self-Employed</MenuItem>
                  <MenuItem value="Unemployed">Unemployed</MenuItem>
                  <MenuItem value="Retired">Retired</MenuItem>
                </TextField>
              </Grid>

              {/* Loan Details */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 2 }}>
                  Loan Details
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Loan Purpose"
                  value={formData.loan_purpose}
                  onChange={(e) => handleChange('loan_purpose', e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: textColor
                    }
                  }}
                >
                  <MenuItem value="Debt Consolidation">Debt Consolidation</MenuItem>
                  <MenuItem value="Home Improvement">Home Improvement</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Education">Education</MenuItem>
                  <MenuItem value="Personal">Personal</MenuItem>
                  <MenuItem value="Auto">Auto</MenuItem>
                </TextField>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    sx={{ minWidth: 150 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Submit Application'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BorrowersLoanForm;
