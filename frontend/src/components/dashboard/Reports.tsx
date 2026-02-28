import React from 'react';
import { Paper, Typography, Button, Grid, Box } from '@mui/material';
import { Download, PictureAsPdf, TableChart } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports: React.FC = () => {
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
    <Paper sx={{ p: 4, borderRadius: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Loan Reports</Typography>
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
          <Typography variant="h6" gutterBottom>Monthly Approval Trends</Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="approved" fill="#4caf50" name="Approved" />
                <Bar dataKey="rejected" fill="#f44336" name="Rejected" />
                <Bar dataKey="pending" fill="#ff9800" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Summary Statistics</Typography>
        <Typography>Total Applications: 145</Typography>
        <Typography>Approval Rate: 68%</Typography>
        <Typography>Average Loan Amount: $25,400</Typography>
        <Typography>Default Rate: 4.2%</Typography>
      </Box>
    </Paper>
  );
};

export default Reports;