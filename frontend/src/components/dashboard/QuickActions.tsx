// src/components/dashboard/QuickActions.tsx
import React from 'react';
import { Paper, Typography, Button, Grid } from '@mui/material';
import { 
  AddCircle, 
  Assessment, 
  CloudDownload, 
  Analytics 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    { 
      label: 'New Prediction', 
      icon: <AddCircle />, 
      color: 'primary', 
      onClick: () => navigate('/predict')
    },
    { 
      label: 'View Reports', 
      icon: <Assessment />, 
      color: 'info', 
      onClick: () => alert('Reports feature coming soon!')
    },
    { 
      label: 'Export Data', 
      icon: <CloudDownload />, 
      color: 'success', 
      onClick: () => alert('Export feature coming soon!')
    },
    { 
      label: 'Risk Analysis', 
      icon: <Analytics />, 
      color: 'warning', 
      onClick: () => alert('Risk Analysis coming soon!')
    },
  ];

  return (
    <Paper sx={{ p: 3, borderRadius: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {actions.map((action, idx) => (
          <Grid item xs={6} key={idx}>
            <Button
              fullWidth
              variant="outlined"
              color={action.color as any}
              startIcon={action.icon}
              onClick={action.onClick}
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