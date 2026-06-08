// src/components/dashboard/SummaryCards.tsx
// src/components/dashboard/SummaryCards.tsx
import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Avatar } from '@mui/material';
import { TrendingUp, CheckCircle, HourglassEmpty } from '@mui/icons-material';
import CountUp from 'react-countup';
import axios from 'axios';

const API_URL = (() => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${base.replace(/\/+$/, '')}/api`;
})();

interface SummaryCardsProps {
  darkMode: boolean;
}

interface StatsData {
  total_reviewed: number;
  approved: number;
  rejected: number;
  escalated: number;
  approval_rate: string;
  current_backlog: number;
  total_bonus?: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ darkMode }) => {
  const bgColor = darkMode ? '#1a1a2e' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1a1a2e';
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/loans/my-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Loans Reviewed',
      value: stats?.total_reviewed || 0,
      icon: <TrendingUp />,
      color: '#667eea',
      trend: 12.5
    },
    {
      title: 'Approved Loans',
      value: stats?.approved || 0,
      icon: <CheckCircle />,
      color: '#29b6f6',
      trend: 15.3
    },
    {
      title: 'Approval Rate',
      value: stats?.approval_rate ? parseFloat(stats.approval_rate) : 0,
      suffix: '%',
      icon: <TrendingUp />,
      color: '#00e676',
      trend: 8.2,
      isPercentage: true
    },
    {
      title: 'Pending Reviews',
      value: stats?.current_backlog || 0,
      icon: <HourglassEmpty />,
      color: '#ffc107',
      trend: -3.2
    }
  ];

  return (
    <Grid container spacing={0.5}>
      {cards.map((card, index) => (
        <Grid item xs={6} sm={6} md={3} key={index}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
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
                <Typography variant="caption" sx={{ color: darkMode ? '#a0a0b0' : '#64748b', mb: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: textColor, lineHeight: 1, textShadow: '0 0 12px rgba(255, 255, 255, 0.3)' }}>
                  <CountUp 
                    end={card.value} 
                    duration={2} 
                    separator="," 
                    suffix={card.suffix || ''}
                    decimals={card.suffix === '%' ? 1 : 0}
                  />
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: card.trend > 0 ? '#4caf50' : '#f44336',
                    fontWeight: 600,
                    fontSize: '0.7rem'
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