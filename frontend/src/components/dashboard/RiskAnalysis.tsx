import React from 'react';
import { Paper, Typography, Box, Grid, LinearProgress, Alert, Chip } from '@mui/material';
import { Warning, TrendingDown, Security } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const RiskAnalysis: React.FC = () => {
  const { darkMode } = useTheme();
  const textColor = darkMode ? '#ffffff' : '#1a1a2e';
  
  const riskFactors = [
    { factor: 'Employment Status', impact: 88, risk: 'High', color: 'error' },
    { factor: 'Debt-to-Income Ratio', impact: 65, risk: 'Medium', color: 'warning' },
    { factor: 'Credit Score', impact: 45, risk: 'Medium', color: 'warning' },
    { factor: 'Loan Amount', impact: 25, risk: 'Low', color: 'success' },
  ];

  return (
    <Paper sx={{ p: 4, borderRadius: 0, backdropFilter: 'blur(20px)', backgroundColor: darkMode ? 'rgba(26, 26, 46, 0.7)' : 'rgba(255, 255, 255, 0.95)', border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', color: textColor }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: textColor }}>
        <Security color="primary" />
        Risk Analysis Engine
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Powered by XGBoost ML Model trained on 594K+ loan records
      </Alert>

      <Grid container spacing={3}>
        {riskFactors.map((item, idx) => (
          <Grid item xs={12} key={idx}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography fontWeight="bold" sx={{ color: textColor }}>{item.factor}</Typography>
                <Chip 
                  label={`${item.impact}% Impact`} 
                  color={item.color as any} 
                  size="small" 
                  icon={item.risk === 'High' ? <Warning /> : undefined}
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={item.impact} 
                color={item.color as any}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}>
                {item.risk} Risk Factor
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, backgroundColor: darkMode ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)', borderRadius: 0, color: darkMode ? 'rgba(255, 107, 107, 1)' : '#d32f2f' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingDown />
          High Risk Indicators
        </Typography>
        <Typography>
          • Unemployment status increases default risk by 340%<br/>
          • Credit score below 600: 85% higher default probability<br/>
          • Debt-to-income ratio {'>'} 40%: Critical risk level
        </Typography>
      </Box>
    </Paper>
  );
};

export default RiskAnalysis;