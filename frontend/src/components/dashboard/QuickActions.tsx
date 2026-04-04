import React from 'react';
import { Paper, Typography, Button, Grid, Box } from '@mui/material';
import { AddCircle, Assessment, CloudDownload, Analytics } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const textColor = darkMode ? '#ffffff' : '#1a1a2e';

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
    <Paper sx={{ p: 2, borderRadius: 0, backdropFilter: 'blur(20px)', backgroundColor: darkMode ? 'rgba(26, 26, 46, 0.4)' : 'rgba(255, 255, 255, 0.9)', border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', flexShrink: 0, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
      <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ color: textColor, textShadow: darkMode ? '0 0 8px rgba(255, 255, 255, 0.2)' : 'none' }}>
        Quick Actions
      </Typography>
      <Grid container spacing={1}>
        {actions.map((action, idx) => (
          <Grid item xs={6} key={idx}>
            <Button
              fullWidth
              variant="outlined"
              color={action.color as any}
              startIcon={action.icon}
              onClick={action.onClick}
              size="small"
              sx={{
                py: 0.75,
                borderRadius: 0,
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem'
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