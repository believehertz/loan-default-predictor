// src/components/dashboard/ChartSection.tsx
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const ChartSection: React.FC = () => {
  const trendData = [
    { month: 'Jan', approvals: 65 },
    { month: 'Feb', approvals: 78 },
    { month: 'Mar', approvals: 90 },
    { month: 'Apr', approvals: 85 },
    { month: 'May', approvals: 95 },
    { month: 'Jun', approvals: 110 },
  ];

  const riskDistribution = [
    { name: 'Low Risk', value: 65, color: '#4caf50' },
    { name: 'Medium Risk', value: 25, color: '#ff9800' },
    { name: 'High Risk', value: 10, color: '#f44336' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Loan Approval Trends
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorApprovals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="approvals" stroke="#667eea" strokeWidth={3} fill="url(#colorApprovals)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Risk Distribution
        </Typography>
        <Box sx={{ height: 250, display: 'flex', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChartSection;