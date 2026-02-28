import React from 'react';
import { Paper, Typography, Button, Grid } from '@mui/material';
import { AddCircle, Assessment, CloudDownload, Analytics } from '@mui/icons-material';
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
      onClick: () => navigate('/reports')
    },
    { 
      label: 'Export Data', 
      icon: <CloudDownload />, 
      color: 'success', 
      onClick: () => {
        // Trigger CSV download
        const csvContent = "data:text/csv;charset=utf-8,ID,Name,Amount,Status\n1,John Doe,25000,Approved\n2,Jane Smith,15000,Pending";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "loan_data_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    { 
      label: 'Risk Analysis', 
      icon: <Analytics />, 
      color: 'warning', 
      onClick: () => navigate('/risk-analysis')
    },
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