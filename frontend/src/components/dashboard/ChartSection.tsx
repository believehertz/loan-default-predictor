// src/components/dashboard/ChartSection.tsx
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface ChartSectionProps {
  darkMode: boolean;
}

const ChartSection: React.FC<ChartSectionProps> = ({ darkMode }) => {
  const textColor = darkMode ? '#ffffff' : '#1a1a2e';
  const gridColor = darkMode ? '#333' : '#e0e0e0';

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
      <Paper sx={{ p: 3, borderRadius: 4, bgcolor: darkMode ? '#1a1a2e' : '#ffffff' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: textColor }}>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="month" stroke={textColor} />
              <YAxis stroke={textColor} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: 8, 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  backgroundColor: darkMode ? '#1a1a2e' : '#ffffff',
                  color: textColor
                }}
              />
              <Area 
                type="monotone" 
                dataKey="approvals" 
                stroke="#667eea" 
                strokeWidth={3}
                fill="url(#colorApprovals)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 4, bgcolor: darkMode ? '#1a1a2e' : '#ffffff' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: textColor }}>
          Risk Distribution
        </Typography>
        <Box sx={{ height: 250, display: 'flex', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1a1a2e' : '#ffffff',
                  color: textColor,
                  border: 'none',
                  borderRadius: 8
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ ml: 4 }}>
            {riskDistribution.map((item) => (
              <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                <Typography sx={{ color: textColor }}>{item.name}: {item.value}%</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChartSection;