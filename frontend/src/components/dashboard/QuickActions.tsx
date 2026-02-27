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

// Sample data for export (in real app, fetch from API)
const exportData = [
  { id: 1, name: 'John Doe', amount: 25000, status: 'Approved', date: '2024-02-19', riskScore: 0.92 },
  { id: 2, name: 'Jane Smith', amount: 15000, status: 'Pending', date: '2024-02-19', riskScore: 0.78 },
  { id: 3, name: 'Bob Johnson', amount: 50000, status: 'Rejected', date: '2024-02-18', riskScore: 0.34 },
  { id: 4, name: 'Alice Brown', amount: 32000, status: 'Approved', date: '2024-02-18', riskScore: 0.88 },
];

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const handleExport = () => {
    // Convert data to CSV
    const headers = ['ID', 'Name', 'Amount', 'Status', 'Date', 'Risk Score'];
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        `${row.id},"${row.name}",${row.amount},${row.status},${row.date},${(row.riskScore * 100).toFixed(0)}%`
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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
      onClick: () => navigate('/reports')  // Fixed: actual navigation
    },
    { 
      label: 'Export Data', 
      icon: <CloudDownload />, 
      color: 'success', 
      onClick: handleExport  // Fixed: actual CSV download
    },
    { 
      label: 'Risk Analysis', 
      icon: <Analytics />, 
      color: 'warning', 
      onClick: () => navigate('/risk-analysis')  // Fixed: actual navigation
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