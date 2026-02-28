// src/components/dashboard/Sidebar.tsx
import React from 'react';
import { Box, Divider, Avatar, Typography, Button } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, onClick: () => navigate('/dashboard') },
    { text: 'New Prediction', icon: <AssessmentIcon />, onClick: () => navigate('/predict') },
    { text: 'Users', icon: <PeopleIcon />, onClick: () => navigate('/users') },
    { text: 'Settings', icon: <SettingsIcon />, onClick: () => navigate('/settings') },
];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          <TrendingUp />
        </Avatar>
        <Typography variant="h6" fontWeight="bold" noWrap>LoanPredictor</Typography>
      </Box>
      
      <Divider sx={{ mx: 2 }} />
      
      <Box sx={{ px: 2, py: 3, flex: 1 }}>
        {menuItems.map((item) => (
          <Button
            key={item.text}
            fullWidth
            onClick={item.onClick}
            startIcon={item.icon}
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              mb: 1,
              borderRadius: 2,
              color: 'text.primary',
            }}
          >
            {item.text}
          </Button>
        ))}
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={onLogout}>
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;