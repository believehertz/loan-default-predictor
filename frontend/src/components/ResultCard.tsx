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

const ResultCard: React.FC<ResultProps> = ({ data }) => {
  if (!data) return null;

  const prob = data.loan_paid_back_probability;
  const pct = Math.round(prob * 100);
  
  let color: 'success' | 'warning' | 'error' = 'success';
  let Icon = CheckCircle;
  
  if (prob >= 0.8) {
    color = 'success';
    Icon = CheckCircle;
  } else if (prob >= 0.5) {
    color = 'warning';
    Icon = Warning;
  } else {
    color = 'error';
    Icon = Error;
  }

  return (
    <Paper elevation={4} sx={{ p: 4, mt: 3, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
      <Icon color={color} sx={{ fontSize: 80, mb: 2 }} />
      
      <Typography variant="h4" color={`${color}.main`} gutterBottom>
        {data.loan_will_be_paid_back ? '✅ Loan Will Be Paid Back' : '❌ High Default Risk'}
      </Typography>
      
      <Typography variant="h1" fontWeight="bold" color="primary">
        {pct}%
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Probability of Successful Payback
      </Typography>

      <Box sx={{ my: 3, px: 4 }}>
        <LinearProgress 
          variant="determinate" 
          value={pct} 
          color={color}
          sx={{ height: 12, borderRadius: 6 }}
        />
      </Box>

      <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
        <Chip 
          label={data.risk_level} 
          color={color} 
          sx={{ fontSize: '1.2rem', py: 2.5, px: 1 }}
        />
        <Chip 
          label={`Confidence: ${data.confidence}`} 
          variant="outlined"
          sx={{ fontSize: '1.2rem', py: 2.5, px: 1 }}
        />
      </Box>

      <Box mt={3} p={2} bgcolor="grey.50" borderRadius={2}>
        <Typography variant="body2" color="textSecondary">
          🧠 XGBoost Model | 90.13% Accuracy | Trained on 593,994 records
        </Typography>
      </Box>
    </Paper>
  );
};

export default ResultCard;
