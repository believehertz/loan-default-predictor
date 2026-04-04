// src/components/ResultCard.tsx
import React from 'react';
import { Paper, Typography, Box, Chip, LinearProgress, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

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
  const { darkMode } = useTheme();
  
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
      background: darkMode ? 'rgba(26, 26, 46, 0.7)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: 0,
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
      color: darkMode ? '#ffffff' : '#000000'
    }}>
      <Typography variant="h4" color={`${color}.main`} gutterBottom>
        {data.loan_will_be_paid_back ? '✅ Likely to Pay' : '❌ High Default Risk'}
      </Typography>
      
      <Typography variant="h2" fontWeight="bold" color="primary">
        {pct}%
      </Typography>
      
      <Typography variant="subtitle1" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
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

      <Box mt={3} p={2} sx={{ backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
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
            borderRadius: 0,
            borderWidth: 2,
            color: darkMode ? '#ffffff' : '#000000',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              borderWidth: 2,
              transform: 'translateY(-2px)',
              borderColor: darkMode ? '#ffffff' : '#000000'
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