// src/components/dashboard/ActivityTable.tsx
import React from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Chip, Avatar,
  Box, Button
} from '@mui/material';
import { FilterList, Download } from '@mui/icons-material';

const ActivityTable: React.FC = () => {
  const activities = [
    { id: 1, name: 'John Doe', amount: 25000, status: 'Approved', date: '2024-02-19', riskScore: 0.92 },
    { id: 2, name: 'Jane Smith', amount: 15000, status: 'Pending', date: '2024-02-19', riskScore: 0.78 },
    { id: 3, name: 'Bob Johnson', amount: 50000, status: 'Rejected', date: '2024-02-18', riskScore: 0.34 },
    { id: 4, name: 'Alice Brown', amount: 32000, status: 'Approved', date: '2024-02-18', riskScore: 0.88 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ borderRadius: 4, overflow: 'hidden', mt: 4 }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Recent Loan Applications</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<FilterList />} variant="outlined" size="small">Filter</Button>
          <Button startIcon={<Download />} variant="contained" size="small">Export</Button>
        </Box>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Applicant</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Risk Score</TableCell>
              <TableCell>Date</TableCell>
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
                    <Typography fontWeight="medium">{row.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>${row.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip label={row.status} color={getStatusColor(row.status) as any} size="small" />
                </TableCell>
                <TableCell>{(row.riskScore * 100).toFixed(0)}%</TableCell>
                <TableCell>{row.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ActivityTable;