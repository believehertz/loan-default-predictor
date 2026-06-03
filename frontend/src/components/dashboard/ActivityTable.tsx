// src/components/dashboard/ActivityTable.tsx
import React from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Chip, Avatar,
  Box, Button
} from '@mui/material';
import { FilterList, Download } from '@mui/icons-material';

interface ActivityTableProps {
  darkMode: boolean;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ darkMode }) => {
  const bgColor = darkMode ? '#1a1a2e' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1a1a2e';

  const activities = [
    { id: 1, name: 'John Doe', amount: 25000, status: 'Approved', date: '2024-02-19', riskScore: 0.92 },
    { id: 2, name: 'Jane Smith', amount: 15000, status: 'Pending', date: '2024-02-19', riskScore: 0.78 },
    { id: 3, name: 'Bob Johnson', amount: 50000, status: 'Rejected', date: '2024-02-18', riskScore: 0.34 },
    { id: 4, name: 'Alice Brown', amount: 32000, status: 'Approved', date: '2024-02-18', riskScore: 0.88 },
  ];

  const handleExport = () => {
    // Create CSV content
    const headers = ['Applicant', 'Amount', 'Status', 'Risk Score', 'Date'];
    const csvContent = [
      headers.join(','),
      ...activities.map(row => 
        `"${row.name}",$${row.amount.toLocaleString()},${row.status},${(row.riskScore * 100).toFixed(0)}%,${row.date}`
      )
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `loan-applications-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: darkMode ? '#1e293b' : '#ffffff', border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', flexShrink: 0 }}>
        <Typography variant="body1" fontWeight="bold" sx={{ color: textColor }}>
          Recent Loan Applications
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<FilterList />} variant="outlined" size="small">
            Filter
          </Button>
          <Button 
            startIcon={<Download />} 
            variant="contained" 
            size="small"
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      <TableContainer sx={{ overflow: 'auto', flexGrow: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: darkMode ? '#0f172a' : '#f8fafc' }}>
              <TableCell sx={{ color: textColor }}>Applicant</TableCell>
              <TableCell sx={{ color: textColor }}>Amount</TableCell>
              <TableCell sx={{ color: textColor }}>Status</TableCell>
              <TableCell sx={{ color: textColor }}>Risk Score</TableCell>
              <TableCell sx={{ color: textColor }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      {row.name[0]}
                    </Avatar>
                    <Typography sx={{ color: textColor }}>{row.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: textColor }}>${row.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={getStatusColor(row.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ color: textColor }}>{(row.riskScore * 100).toFixed(0)}%</TableCell>
                <TableCell sx={{ color: textColor }}>{row.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ActivityTable;