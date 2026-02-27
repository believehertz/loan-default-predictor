// src/components/dashboard/QuickActions.tsx
import React from 'react';
import { Paper, Typography, Button, Grid } from '@mui/material';
import { 
  AddCircle, 
  Assessment, 
  CloudDownload, 
  Analytics 
} from '@mui/icons-material';

const QuickActions: React.FC = () => {
  const actions = [
    { label: 'New Prediction', icon: <AddCircle />, color: 'primary' },
    { label: 'View Reports', icon: <Assessment />, color: 'info' },
    { label: 'Export Data', icon: <CloudDownload />, color: 'success' },
    { label: 'Risk Analysis', icon: <Analytics />, color: 'warning' },
  ];

  return (
    <Paper sx={{ p: 3, borderRadius: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action, idx) => (
          <Grid item xs={6} key={idx}>
            <Button
              fullWidth
              variant="outlined"
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
