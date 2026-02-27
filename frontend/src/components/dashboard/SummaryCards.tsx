// src/components/Dashboard/SummaryCards.tsx
import React from 'react';
import { Grid, Paper, Typography, Box, Avatar } from '@mui/material';
import { TrendingUp, AttachMoney, CheckCircle, Warning } from '@mui/icons-material';
import CountUp from 'react-countup';

interface CardData {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  trend: number;
}

const SummaryCards: React.FC = () => {
  const cards: CardData[] = [
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
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              },
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Accent line */}
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
                <Typography color="text.secondary" variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  {card.title}
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
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
                    color: card.trend > 0 ? 'success.main' : 'error.main',
                    fontWeight: 600,
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
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
