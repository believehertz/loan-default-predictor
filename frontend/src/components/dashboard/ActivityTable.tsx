// src/components/Dashboard/ActivityTable.tsx
import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  Box,
  IconButton,
  Button
} from '@mui/material';
import { FilterList, Download } from '@mui/icons-material';

interface LoanActivity {
  id: number;
  name: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  date: string;
  riskScore: number;
  avatar: string;
}

const ActivityTable: React.FC = () => {
  const activities: LoanActivity[] = [
    { id: 1, name: 'John Doe', amount: 25000, status: 'Approved', date: '2024-02-19', riskScore: 0.92, avatar: 'J' },
    { id: 2, name: 'Jane Smith', amount: 15000, status: 'Pending', date: '2024-02-19', riskScore: 0.78, avatar: 'J' },
    { id: 3, name: 'Bob Johnson', amount: 50000, status: 'Rejected', date: '2024-02-18', riskScore: 0.34, avatar: 'B' },
    { id: 4, name: 'Alice Brown', amount: 32000, status: 'Approved', date: '2024-02-18', riskScore: 0.88, avatar: 'A' },
    { id: 5, name: 'Charlie Wilson', amount: 18000, status: 'Approved', date: '2024-02-17', riskScore: 0.91, avatar: 'C' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.5) return 'warning';
    return 'error';
  };

  return (
    <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold">
          Recent Loan Applications
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<FilterList />} variant="outlined" size="small">
            Filter
          </Button>
          <Button startIcon={<Download />} variant="contained" size="small">
            Export
          </Button>
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
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                      {row.avatar}
                    </Avatar>
                    <Typography fontWeight="medium">{row.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">
                    ${row.amount.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={getStatusColor(row.status) as any}
                    size="small"
                    sx={{ fontWeight: 600, minWidth: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={`${(row.riskScore * 100).toFixed(0)}%`}
                    color={getRiskColor(row.riskScore) as any}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
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
