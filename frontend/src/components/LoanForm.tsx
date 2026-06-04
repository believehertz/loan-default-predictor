// src/components/LoanForm.tsx
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Paper, Grid, 
  CircularProgress, FormControl, InputLabel, Select, MenuItem,
  IconButton, Tooltip, Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Dashboard as DashboardIcon, ArrowBack } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Define the result interface
interface PredictionResult {
  loan_paid_back_probability: number;
  loan_will_be_paid_back: boolean;
  risk_level: string;
  confidence: string;
}

interface LoanFormProps {
  onResult: (data: PredictionResult) => void;
}

interface FormErrors {
  [key: string]: string;
}

const LoanForm: React.FC<LoanFormProps> = ({ onResult }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [formData, setFormData] = useState({
    annual_income: '',
    debt_to_income_ratio: '',
    credit_score: '',
    loan_amount: '',
    interest_rate: '',
    gender: 'Male',
    marital_status: 'Single',
    education_level: 'High School',
    employment_status: 'Employed',
    loan_purpose: 'Debt consolidation',
    grade_subgrade: 'C1'
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Annual Income validation
    const income = parseFloat(formData.annual_income);
    if (!formData.annual_income) {
      newErrors.annual_income = 'Annual income is required';
    } else if (income <= 0) {
      newErrors.annual_income = 'Annual income must be greater than 0';
    } else if (income > 10000000) {
      newErrors.annual_income = 'Annual income seems too high (max $10M)';
    }

    // Credit Score validation
    const creditScore = parseInt(formData.credit_score);
    if (!formData.credit_score) {
      newErrors.credit_score = 'Credit score is required';
    } else if (creditScore < 300 || creditScore > 850) {
      newErrors.credit_score = 'Credit score must be between 300 and 850';
    }

    // Loan Amount validation
    const loanAmount = parseFloat(formData.loan_amount);
    if (!formData.loan_amount) {
      newErrors.loan_amount = 'Loan amount is required';
    } else if (loanAmount <= 0) {
      newErrors.loan_amount = 'Loan amount must be greater than 0';
    } else if (loanAmount > 10000000) {
      newErrors.loan_amount = 'Loan amount seems too high (max $10M)';
    }

    // Debt-to-Income Ratio validation
    const dtiRatio = parseFloat(formData.debt_to_income_ratio);
    if (!formData.debt_to_income_ratio) {
      newErrors.debt_to_income_ratio = 'Debt-to-income ratio is required';
    } else if (isNaN(dtiRatio) || dtiRatio < 0 || dtiRatio > 1) {
      newErrors.debt_to_income_ratio = 'Debt-to-income ratio must be between 0 and 1';
    }

    // Interest Rate validation
    const interestRate = parseFloat(formData.interest_rate);
    if (!formData.interest_rate) {
      newErrors.interest_rate = 'Interest rate is required';
    } else if (interestRate < 0 || interestRate > 50) {
      newErrors.interest_rate = 'Interest rate must be between 0% and 50%';
    }

    // Grade/Subgrade validation
    if (!formData.grade_subgrade) {
      newErrors.grade_subgrade = 'Grade/Subgrade is required';
    } else if (!/^[A-F]\d$/.test(formData.grade_subgrade)) {
      newErrors.grade_subgrade = 'Grade must be in format like A1, B2, C3 (A-F followed by 1-5)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    
    // Validate form before submission
    if (!validateForm()) {
      setApiError('Please fix the errors above and try again');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/predict`, 
        {
          annual_income: parseFloat(formData.annual_income),
          debt_to_income_ratio: parseFloat(formData.debt_to_income_ratio),
          credit_score: parseInt(formData.credit_score),
          loan_amount: parseFloat(formData.loan_amount),
          interest_rate: parseFloat(formData.interest_rate),
          gender: formData.gender,
          marital_status: formData.marital_status,
          education_level: formData.education_level,
          employment_status: formData.employment_status,
          loan_purpose: formData.loan_purpose,
          grade_subgrade: formData.grade_subgrade
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Pass result to parent
      onResult(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setApiError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.reload();
        }, 1500);
      } else if (error.response?.status === 422) {
        setApiError('Invalid data: ' + (error.response?.data?.detail?.[0]?.msg || 'Please check your inputs'));
      } else if (error.response?.data?.detail) {
        setApiError('Prediction failed: ' + error.response.data.detail);
      } else if (error.message === 'Network Error') {
        setApiError('Network error. Please check your connection and try again.');
      } else {
        setApiError('Prediction failed: ' + (error.message || 'Unknown error'));
      }
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute theme-aware styles
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      color: darkMode ? '#ffffff' : '#000000',
      backdropFilter: 'blur(10px)',
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      border: (fieldError: boolean) =>  `1px solid ${fieldError ? 'rgba(244, 67, 54, 0.5)' : (darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)')}`
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiInputBase-input::placeholder': { color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)', opacity: 1 },
    '& .MuiInputLabel-root': { color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' },
    '& .MuiFormHelperText-root': { color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }
  };

  const getTextFieldSx = (hasError: boolean) => ({
    '& .MuiOutlinedInput-root': {
      color: darkMode ? '#ffffff' : '#000000',
      backdropFilter: 'blur(10px)',
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      border: hasError ? 'rgba(244, 67, 54, 0.5)' : (darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)')
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiInputBase-input::placeholder': { color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)', opacity: 1 },
    '& .MuiInputLabel-root': { color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' },
    '& .MuiFormHelperText-root': { color: hasError ? (darkMode ? '#ffcdd2' : '#d32f2f') : (darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)') }
  });

  const getSelectSx = () => ({
    '& .MuiOutlinedInput-root': {
      color: darkMode ? '#ffffff' : '#000000',
      backdropFilter: 'blur(10px)',
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)'
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiInputLabel-root': { color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' },
    '& .MuiSvgIcon-root': { color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }
  });

  return (
    <Box sx={{ 
      width: '100%',
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 1,
      position: 'relative',
      background: 'transparent',
      overflow: 'auto'
    }}>
      <Box sx={{ 
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <Tooltip title="Back to Dashboard">
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>

        <Tooltip title="Go to Dashboard">
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
          >
            <DashboardIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Paper 
        elevation={24} 
        sx={{ 
          p: 2,
          width: '95%',
          maxWidth: '900px',
          borderRadius: 2,
          backdropFilter: 'blur(20px)',
          backgroundColor: darkMode ? '#1e293b' : '#ffffff',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 2,
          margin: '0 auto',
          mt: 1
        }}
      >
        <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 700, mb: 0.5 }}>
          Loan Payback Predictor
        </Typography>
        <Typography variant="body2" align="center" gutterBottom sx={{ mb: 1.5, color: 'text.secondary' }}>
          Powered by XGBoost • 90%+ Accuracy • 594K+ Records Trained
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          {apiError && (
            <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(211, 47, 47, 0.2)', border: '1px solid rgba(229, 57, 53, 0.5)', color: '#ffcdd2' }}>
              {apiError}
            </Alert>
          )}
          
          <Grid container spacing={1} justifyContent="center" alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Annual Income ($)" name="annual_income" 
                type="number" value={formData.annual_income} onChange={handleChange} 
                error={!!errors.annual_income}
                helperText={errors.annual_income || 'e.g., 50000'}
                sx={getTextFieldSx(!!errors.annual_income)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Credit Score (300-850)" name="credit_score" 
                type="number" inputProps={{ min: 300, max: 850 }}
                value={formData.credit_score} onChange={handleChange} 
                error={!!errors.credit_score}
                helperText={errors.credit_score || 'e.g., 750'}
                sx={getTextFieldSx(!!errors.credit_score)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Loan Amount ($)" name="loan_amount" 
                type="number" value={formData.loan_amount} onChange={handleChange} 
                error={!!errors.loan_amount}
                helperText={errors.loan_amount || 'e.g., 25000'}
                sx={getTextFieldSx(!!errors.loan_amount)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                fullWidth 
                label="Debt-to-Income Ratio (0-1)" 
                name="debt_to_income_ratio" 
                type="number" 
                inputProps={{ step: 0.001, min: 0, max: 1 }}
                value={formData.debt_to_income_ratio} 
                onChange={handleChange} 
                error={!!errors.debt_to_income_ratio}
                helperText={errors.debt_to_income_ratio || 'e.g., 0.35 for 35%'}
                sx={getTextFieldSx(!!errors.debt_to_income_ratio)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                fullWidth 
                label="Interest Rate (%)" 
                name="interest_rate" 
                type="number" 
                inputProps={{ step: 0.01, min: 0 }}
                value={formData.interest_rate} 
                onChange={handleChange}
                error={!!errors.interest_rate}
                helperText={errors.interest_rate || 'e.g., 5.5'}
                sx={getTextFieldSx(!!errors.interest_rate)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={getSelectSx()}>
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender">
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={getSelectSx()}>
                <InputLabel>Marital Status</InputLabel>
                <Select name="marital_status" value={formData.marital_status} 
                  onChange={handleChange} label="Marital Status">
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={getSelectSx()}>
                <InputLabel>Education Level</InputLabel>
                <Select name="education_level" value={formData.education_level} 
                  onChange={handleChange} label="Education Level">
                  <MenuItem value="High School">High School</MenuItem>
                  <MenuItem value="Bachelor's">Bachelor's</MenuItem>
                  <MenuItem value="Master's">Master's</MenuItem>
                  <MenuItem value="PhD">PhD</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={getSelectSx()}>
                <InputLabel>Employment Status</InputLabel>
                <Select name="employment_status" value={formData.employment_status} 
                  onChange={handleChange} label="Employment Status">
                  <MenuItem value="Employed">Employed</MenuItem>
                  <MenuItem value="Unemployed">Unemployed</MenuItem>
                  <MenuItem value="Self-employed">Self-employed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={getSelectSx()}>
                <InputLabel>Loan Purpose</InputLabel>
                <Select name="loan_purpose" value={formData.loan_purpose} 
                  onChange={handleChange} label="Loan Purpose">
                  <MenuItem value="Debt consolidation">Debt consolidation</MenuItem>
                  <MenuItem value="Home">Home</MenuItem>
                  <MenuItem value="Car">Car</MenuItem>
                  <MenuItem value="Education">Education</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Vacation">Vacation</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Grade/Subgrade" name="grade_subgrade" 
                value={formData.grade_subgrade} onChange={handleChange}
                error={!!errors.grade_subgrade}
                helperText={errors.grade_subgrade || 'e.g., A1, B2, C3, D4'}
                sx={getTextFieldSx(!!errors.grade_subgrade)}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, width: '100%' }}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              disabled={loading || Object.keys(errors).some(key => errors[key])}
              sx={{ 
                py: 1.5,
                px: 8,
                fontWeight: 700,
                backdropFilter: 'blur(10px)',
                backgroundColor: darkMode ? 'rgba(102, 126, 234, 0.6)' : 'rgba(102, 126, 234, 0.7)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
                color: darkMode ? '#ffffff' : '#ffffff',
                textShadow: darkMode ? '0 0 8px rgba(255, 255, 255, 0.3)' : 'none',
                boxShadow: darkMode ? '0 4px 15px rgba(102, 126, 234, 0.3)' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  backdropFilter: 'blur(10px)',
                  backgroundColor: darkMode ? 'rgba(102, 126, 234, 0.8)' : 'rgba(102, 126, 234, 0.85)',
                  transform: 'translateY(-2px)',
                  boxShadow: darkMode ? '0 6px 20px rgba(102, 126, 234, 0.5)' : '0 6px 20px rgba(102, 126, 234, 0.6)'
                },
                '&:disabled': {
                  opacity: 0.6,
                  cursor: 'not-allowed'
                }
              }} 
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'PREDICT LOAN PAYBACK'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoanForm;