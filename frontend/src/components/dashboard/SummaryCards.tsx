// src/components/dashboard/SummaryCards.tsx
import React from 'react';
import { Grid, Paper, Typography, Box, Avatar } from '@mui/material';
import { TrendingUp, AttachMoney, CheckCircle, Warning } from '@mui/icons-material';
import CountUp from 'react-countup';

interface SummaryCardsProps {
  darkMode: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ darkMode }) => {
  const bgColor = darkMode ? '#1a1a2e' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1a1a2e';

  const cards = [
    {
      title: 'Total Predictions',
      value: 1247,
      icon: <TrendingUp />,
      color: '#667eea',
      trend: 12.5
    },
    {
      title: 'Total Value Analyzed',
      value: 2450000,
      suffix: ' USD',
      icon: <AttachMoney />,
      color: '#4caf50',
      trend: 8.2
    },
    {
      title: 'Low Risk Loans',
      value: 892,
      icon: <CheckCircle />,
      color: '#2196f3',
      trend: 15.3
    },
    {
      title: 'High Risk Detected',
      value: 34,
      icon: <Warning />,
      color: '#ff9800',
      trend: -5.4
    }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              background: bgColor,
              border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-4px)' },
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              bgcolor: card.color
            }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ color: darkMode ? '#a0a0b0' : '#64748b', mb: 1 }}>
                  {card.title}
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: textColor }}>
                  <CountUp 
                    end={card.value} 
                    duration={2} 
                    separator="," 
                    suffix={card.suffix || ''}
                    prefix={card.title.includes('Value') ? '$' : ''}
                  />
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: card.trend > 0 ? '#4caf50' : '#f44336',
                    fontWeight: 600
                  }}
                >
                  {card.trend > 0 ? '↑' : '↓'} {Math.abs(card.trend)}% from last month
                </Typography>
              </Box>
              <Avatar sx={{ 
                bgcolor: `${card.color}20`, 
                color: card.color,
                width: 48,
                height: 48
              }}>
                {card.icon}
              </Avatar>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;