import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Paper, Grid, 
  CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import axios from 'axios';

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
      const response = await axios.post('http://localhost:8000/api/predict', {
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
      });
      
      onResult(response.data);
    } catch (error: any) {
      alert('Prediction failed: ' + (error.response?.data?.detail || error.message));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Loan Payback Predictor (XGBoost 95%+)
      </Typography>
      <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
        Trained on 593,995 real loan records
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Numeric Fields */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Annual Income ($)" name="annual_income" 
              type="number" value={formData.annual_income} onChange={handleChange} required />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Credit Score (300-850)" name="credit_score" 
              type="number" inputProps={{ min: 300, max: 850 }}
              value={formData.credit_score} onChange={handleChange} required />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Loan Amount ($)" name="loan_amount" 
              type="number" value={formData.loan_amount} onChange={handleChange} required />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Debt-to-Income Ratio (0-1)" name="debt_to_income_ratio" 
              type="number" inputProps={{ step: 0.001, min: 0, max: 1 }}
              value={formData.debt_to_income_ratio} onChange={handleChange} required 
              helperText="e.g., 0.35 for 35%" />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Interest Rate (%)" name="interest_rate" 
              type="number" inputProps={{ step: 0.01, min: 0 }}
              value={formData.interest_rate} onChange={handleChange} required />
          </Grid>

          {/* Categorical Fields */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender">
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
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
          
          <Grid item xs={12} sm={6} md={4}>
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
          
          <Grid item xs={12} sm={6} md={4}>
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
          
          <Grid item xs={12} sm={6} md={4}>
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
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Grade/Subgrade" name="grade_subgrade" 
              value={formData.grade_subgrade} onChange={handleChange} required 
              helperText="e.g., A1, B2, C3, D4, E5, F1" />
          </Grid>
        </Grid>
        
        <Button type="submit" variant="contained" fullWidth size="large" 
          sx={{ mt: 3, py: 1.5 }} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Predict Loan Payback (95%+ Accurate)'}
        </Button>
      </Box>
    </Paper>
  );
};

export default LoanForm;