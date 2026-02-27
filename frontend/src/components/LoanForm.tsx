// src/components/LoanForm.tsx
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Paper, Grid,
  CircularProgress, FormControl, InputLabel, Select, MenuItem,
  IconButton, Tooltip
} from '@mui/material';
import axios from 'axios';
import FallingMoney from './FallingMoney';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';  // Removed DashboardIcon

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface LoanFormProps {
  onResult: (data: any) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ onResult }) => {
  const navigate = useNavigate();
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      position: 'relative',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <FallingMoney />
      
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
            sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Paper sx={{ 
        p: 4,
        width: '95%',
        maxWidth: '900px',
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.95)',
        mt: 6
      }}>
        <Typography variant="h4" align="center" color="primary" fontWeight={700}>
          Loan Payback Predictor
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Annual Income ($)" name="annual_income" 
                type="number" value={formData.annual_income} onChange={handleChange} required />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Credit Score" name="credit_score" 
                type="number" value={formData.credit_score} onChange={handleChange} required />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Loan Amount ($)" name="loan_amount" 
                type="number" value={formData.loan_amount} onChange={handleChange} required />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                fullWidth 
                label="Debt-to-Income Ratio" 
                name="debt_to_income_ratio" 
                type="number"
                inputProps={{ step: "0.01" }}  // Fixed: moved step to inputProps
                value={formData.debt_to_income_ratio} 
                onChange={handleChange} 
                required 
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Interest Rate (%)" name="interest_rate" 
                type="number" value={formData.interest_rate} onChange={handleChange} required />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formData.gender} onChange={handleChange}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Marital Status</InputLabel>
                <Select name="marital_status" value={formData.marital_status} onChange={handleChange}>
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Employment Status</InputLabel>
                <Select name="employment_status" value={formData.employment_status} onChange={handleChange}>
                  <MenuItem value="Employed">Employed</MenuItem>
                  <MenuItem value="Unemployed">Unemployed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Loan Purpose</InputLabel>
                <Select name="loan_purpose" value={formData.loan_purpose} onChange={handleChange}>
                  <MenuItem value="Debt consolidation">Debt consolidation</MenuItem>
                  <MenuItem value="Home">Home</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              disabled={loading}
              sx={{ 
                py: 1.5,
                px: 8,
                fontWeight: 700,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              }} 
            >
              {loading ? <CircularProgress size={24} /> : '💰 PREDICT LOAN PAYBACK 💰'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoanForm;