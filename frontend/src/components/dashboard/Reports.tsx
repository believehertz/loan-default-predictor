import React from 'react';
import { Paper, Typography, Button, Grid, Box } from '@mui/material';
import { PictureAsPdf, TableChart, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const textColor = darkMode ? '#ffffff' : '#1a1a2e';
  const gridColor = darkMode ? '#333' : '#e0e0e0';
  
  const monthlyData = [
    { month: 'Jan', approved: 45, rejected: 12, pending: 8 },
    { month: 'Feb', approved: 52, rejected: 15, pending: 10 },
    { month: 'Mar', approved: 48, rejected: 18, pending: 6 },
  ];

  const exportCSV = () => {
    const csvContent = "Month,Approved,Rejected,Pending\nJan,45,12,8\nFeb,52,15,10\nMar,48,18,6";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loan-report.csv';
    a.click();
  };

  const exportPDF = () => {
    alert('PDF Export: In production, this would generate a PDF report');
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: darkMode ? '#1e293b' : '#ffffff', border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', color: textColor, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="text"
            onClick={() => navigate('/dashboard')}
            startIcon={<ArrowBack />}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" fontWeight="bold" sx={{ color: textColor }}>Loan Reports</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<TableChart />} onClick={exportCSV}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<PictureAsPdf />} onClick={exportPDF} color="error">
            Export PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ color: textColor }}>Monthly Approval Trends</Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={textColor} />
                <YAxis stroke={textColor} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1a1a2e' : '#ffffff', color: textColor, border: 'none', borderRadius: 8 }} />
                <Bar dataKey="approved" fill="#4caf50" name="Approved" />
                <Bar dataKey="rejected" fill="#f44336" name="Rejected" />
                <Bar dataKey="pending" fill="#ff9800" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 3, backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: textColor }}>Summary Statistics</Typography>
        <Typography sx={{ color: textColor }}>Total Applications: 145</Typography>
        <Typography sx={{ color: textColor }}>Approval Rate: 68%</Typography>
        <Typography sx={{ color: textColor }}>Average Loan Amount: $25,400</Typography>
        <Typography sx={{ color: textColor }}>Default Rate: 4.2%</Typography>
      </Box>
    </Paper>
  );
};

export default Reports;