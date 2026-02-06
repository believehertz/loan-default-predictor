import React from 'react';
import { Paper, Typography, Box, Chip, LinearProgress, Grid } from '@mui/material';
import { CheckCircle, Warning, Error, Help } from '@mui/icons-material';

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

  const probability = data.loan_paid_back_probability;
  const percentage = Math.round(probability * 100);
  
  // Color scheme
  let color: 'success' | 'warning' | 'error' | 'info' = 'success';
  let Icon = CheckCircle;
  
  if (probability >= 0.9) {
    color = 'success';
    Icon = CheckCircle;
  } else if (probability >= 0.7) {
    color = 'info';
    Icon = CheckCircle;
  } else if (probability >= 0.5) {
    color = 'warning';
    Icon = Help;
  } else {
    color = 'error';
    Icon = Error;
  }

  return (
    <Paper elevation={4} sx={{ p: 4, mt: 3, maxWidth: 900, mx: 'auto' }}>
      <Box textAlign="center" mb={3}>
        <Icon color={color} sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" color={`${color}.main`} gutterBottom>
          {data.loan_will_be_paid_back ? 'Loan Will Be Paid Back' : 'High Default Risk'}
        </Typography>
        <Typography variant="h2" color="primary" fontWeight="bold">
          {percentage}%
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Probability of Successful Payback
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={color}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>

      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <Chip 
            label={data.risk_level} 
            color={color} 
            size="large"
            sx={{ fontSize: '1.1rem', py: 2 }}
          />
        </Grid>
        <Grid item>
          <Chip 
            label={`Confidence: ${data.confidence}`} 
            variant="outlined"
            size="large"
            sx={{ fontSize: '1.1rem', py: 2 }}
          />
        </Grid>
      </Grid>

      <Box mt={3} p={2} bgcolor="grey.50" borderRadius={2}>
        <Typography variant="caption" display="block" color="textSecondary">
          Model: XGBoost Classifier trained on 593,995 records
        </Typography>
        <Typography variant="caption" display="block" color="textSecondary">
          Expected Accuracy: 95%+ | AUC Score: 0.97+
        </Typography>
      </Box>
    </Paper>
  );
};

export default ResultCard;