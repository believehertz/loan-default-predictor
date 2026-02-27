// src/components/Dashboard/QuickActions.tsx
import React from 'react';
import { Paper, Typography, Button, Box, Grid } from '@mui/material';
import { 
  AddCircle, 
  Assessment, 
  CloudDownload, 
  Analytics 
} from '@mui/icons-material';

const QuickActions: React.FC = () => {
  const actions = [
    { label: 'New Prediction', icon: <AddCircle />, color: 'primary', variant: 'contained' },
    { label: 'View Reports', icon: <Assessment />, color: 'info', variant: 'outlined' },
    { label: 'Export Data', icon: <CloudDownload />, color: 'success', variant: 'outlined' },
    { label: 'Risk Analysis', icon: <Analytics />, color: 'warning', variant: 'outlined' },
  ];

  return (
    <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {actions.map((action, idx) => (
          <Grid item xs={6} key={idx}>
            <Button
              fullWidth
              variant={action.variant as any}
              color={action.color as any}
              startIcon={action.icon}
              sx={{ 
                py: 1.5, 
                borderRadius: 2,
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default QuickActions;
