// src/components/ResultCard.tsx
import React from 'react';
import { Paper, Typography, Box, Chip, LinearProgress, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface ResultProps {
  data: {
    loan_paid_back_probability: number;
    loan_will_be_paid_back: boolean;
    risk_level: string;
    confidence: string;
  } | null;
  onReset?: () => void; // Add this prop
}

const ResultCard: React.FC<ResultProps> = ({ data, onReset }) => {
  if (!data) return null;

  const prob = data.loan_paid_back_probability;
  const pct = Math.round(prob * 100);
  
  let color: 'success' | 'warning' | 'error' | 'info' = 'success';
  
  if (prob >= 0.9) {
    color = 'success';
  } else if (prob >= 0.7) {
    color = 'info';
  } else if (prob >= 0.5) {
    color = 'warning';
  } else {
    color = 'error';
  }

  return (
    <Paper elevation={24} sx={{ 
      p: 4, 
      mt: 3, 
      maxWidth: 600, 
      mx: 'auto', 
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: 4
    }}>
      <Typography variant="h4" color={`${color}.main`} gutterBottom>
        {data.loan_will_be_paid_back ? '✅ Likely to Pay' : '❌ High Default Risk'}
      </Typography>
      
      <Typography variant="h2" fontWeight="bold" color="primary">
        {pct}%
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary">
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

      <Chip 
        label={data.risk_level} 
        color={color} 
        size="medium"
        sx={{ fontSize: '1.2rem', py: 2.5, px: 2 }}
      />

      <Box mt={3} p={2} bgcolor="grey.50" borderRadius={2}>
        <Typography variant="body2" color="textSecondary">
          Confidence: {data.confidence} | Model: XGBoost | 90%+ Accuracy
        </Typography>
      </Box>

      {/* Add Reset Button */}
      {onReset && (
        <Button
          variant="outlined"
          size="large"
          startIcon={<Refresh />}
          onClick={onReset}
          sx={{ 
            mt: 4,
            px: 6,
            py: 1.5,
            borderRadius: 3,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              transform: 'translateY(-2px)',
            }
          }}
        >
          Make Another Prediction
        </Button>
      )}
    </Paper>
  );
};

export default ResultCard;