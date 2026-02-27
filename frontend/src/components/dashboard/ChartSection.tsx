// src/components/Dashboard/ChartSection.tsx
import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ChartSection: React.FC = () => {
  const theme = useTheme();

  const trendData = [
    { month: 'Jan', approvals: 65, defaults: 12 },
    { month: 'Feb', approvals: 78, defaults: 15 },
    { month: 'Mar', approvals: 90, defaults: 18 },
    { month: 'Apr', approvals: 85, defaults: 14 },
    { month: 'May', approvals: 95, defaults: 10 },
    { month: 'Jun', approvals: 110, defaults: 8 },
  ];

  const riskDistribution = [
    { name: 'Low Risk', value: 65, color: '#4caf50' },
    { name: 'Medium Risk', value: 25, color: '#ff9800' },
    { name: 'High Risk', value: 10, color: '#f44336' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Main Trend Chart */}
      <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Loan Approval Trends
        </Typography>
        <Box sx={{ height: 300, mt: 2 }}>
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
              <Tooltip 
                contentStyle={{ 
                  borderRadius: 8, 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                }}
              />
              <Area 
                type="monotone" 
                dataKey="approvals" 
                stroke="#667eea" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorApprovals)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Bottom Row - Risk Distribution */}
      <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Risk Distribution
        </Typography>
        <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ ml: 4 }}>
            {riskDistribution.map((item) => (
              <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                <Typography variant="body2">
                  {item.name}: {item.value}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChartSection;
