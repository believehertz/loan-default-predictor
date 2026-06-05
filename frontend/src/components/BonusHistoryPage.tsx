import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import BonusHistory from './dashboard/BonusHistory';

const BonusHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const textColor = darkMode ? '#ffffff' : '#1e293b';

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="text"
          onClick={() => navigate('/dashboard')}
          startIcon={<ArrowBack />}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ color: textColor }}>
          📋 Your Bonus History
        </Typography>
      </Box>

      <BonusHistory darkMode={darkMode} />
    </Box>
  );
};

export default BonusHistoryPage;
