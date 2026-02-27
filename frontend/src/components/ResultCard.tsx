import React from 'react';
import { Paper, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { CheckCircle, Warning, Error } from '@mui/icons-material';

interface ResultProps {
  data: {
    loan_paid_back_probability: number;
    loan_will_be_paid_back: boolean;
    risk_level: string;
    confidence: string;
  } | null;
}

// Update to match dashboard styling:
import { Paper, Typography, Box, Chip, LinearProgress } from '@mui/material';

const ResultCard: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;

  const prob = data.loan_paid_back_probability || 0;
  const color = prob >= 0.7 ? 'success' : prob >= 0.5 ? 'warning' : 'error';

  return (
    <Paper elevation={3} sx={{ 
      p: 4, 
      mt: 3, 
      maxWidth: 600, 
      mx: 'auto',
      borderRadius: 4,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)'
    }}>
      <Typography variant="h4" align="center" color={`${color}.main`} gutterBottom>
        {data.loan_will_be_paid_back ? '✅ Likely to Pay' : '❌ High Risk'}
      </Typography>
      
      <Typography variant="h2" align="center" fontWeight="bold" color="primary">
        {(prob * 100).toFixed(1)}%
      </Typography>
      
      <LinearProgress 
        variant="determinate" 
        value={prob * 100} 
        color={color}
        sx={{ height: 10, borderRadius: 5, mt: 2 }}
      />
      
      <Chip 
        label={data.risk_level} 
        color={color} 
        sx={{ mt: 2, display: 'block', mx: 'auto' }}
      />
    </Paper>
  );
};


export default ResultCard;
