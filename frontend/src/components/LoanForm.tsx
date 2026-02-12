import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Paper, Grid, 
  CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import axios from 'axios';
import FallingMoney from './FallingMoney';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface LoanFormProps {
  onResult: (data: any) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ onResult }) => {
  const [loading, setLoading] = useState(false);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      onResult(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.reload();
      } else {
        alert('Prediction failed: ' + (error.response?.data?.detail || error.message));
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <FallingMoney />
      
      <Paper 
        elevation={24} 
        sx={{ 
          p: 4, 
          width: '100%',
          maxWidth: 900, 
          position: 'relative',
          zIndex: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ fontWeight: 700 }}>
          Loan Payback Predictor
        </Typography>
        <Typography variant="h6" color="textSecondary" align="center" gutterBottom sx={{ mb: 3 }}>
          💸 XGBoost 90%+ Accuracy | 594K+ Records Trained 💸
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Annual Income ($)" name="annual_income" 
                type="number" value={formData.annual_income} onChange={handleChange} required />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Credit Score (300-850)" name="credit_score" 
                type="number" inputProps={{ min: 300, max: 850 }}
                value={formData.credit_score} onChange={handleChange} required />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Loan Amount ($)" name="loan_amount" 
                type="number" value={formData.loan_amount} onChange={handleChange} required />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Debt-to-Income Ratio (0-1)" name="debt_to_income_ratio" 
                type="number" inputProps={{ step: 0.001, min: 0, max: 1 }}
                value={formData.debt_to_income_ratio} onChange={handleChange} required 
                helperText="e.g., 0.35 for 35%" />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Interest Rate (%)" name="interest_rate" 
                type="number" inputProps={{ step: 0.01, min: 0 }}
                value={formData.interest_rate} onChange={handleChange} required />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender">
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Marital Status</InputLabel>
                <Select name="marital_status" value={formData.marital_status} 
                  onChange={handleChange} label="Marital Status">
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
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
            
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Employment Status</InputLabel>
                <Select name="employment_status" value={formData.employment_status} 
                  onChange={handleChange} label="Employment Status">
                  <MenuItem value="Employed">Employed</MenuItem>
                  <MenuItem value="Unemployed">Unemployed</MenuItem>
                  <MenuItem value="Self-employed">Self-employed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
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
            
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Grade/Subgrade" name="grade_subgrade" 
                value={formData.grade_subgrade} onChange={handleChange} required 
                helperText="e.g., A1, B2, C3, D4, E5, F1" />
            </Grid>
          </Grid>
          
          <Button type="submit" variant="contained" fullWidth size="large" 
            sx={{ 
              mt: 3, 
              py: 1.5,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                transform: 'translateY(-2px)'
              }
            }} 
            disabled={loading}>
            {loading ? <CircularProgress size={24} /> : '💰 Predict Loan Payback 💰'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoanForm;