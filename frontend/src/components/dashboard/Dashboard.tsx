// src/components/dashboard/Dashboard.tsx
import React, { useState } from 'react';
import {
  Box, Typography, Button,
  Divider, Avatar, useMediaQuery,
  CssBaseline, IconButton, Tooltip,
  Paper, Switch, FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  TrendingUp,
  Notifications,
  DarkMode,
  LightMode,
  AdminPanelSettings,
  Percent,
  EmojiEvents
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const drawerWidth = 280;

interface DashboardProps {
  onLogout: () => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, isAdmin, isEmployee } = useAuth();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  // Theme colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const paperColor = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f8fafc' : '#0f172a';
  const sidebarBg = darkMode ? '#1e293b' : '#0f2b46';
  const sidebarText = '#ffffff';

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, onClick: () => navigate('/dashboard'), show: true },
    
    // User (Borrower) menu items
    { text: 'Apply for Loan', icon: <AssessmentIcon />, onClick: () => navigate('/apply-loan'), show: !isAdmin && !isEmployee },
    { text: 'My Loan Applications', icon: <AssessmentIcon />, onClick: () => navigate('/my-loans'), show: !isAdmin && !isEmployee },
    
    // Employee & Admin menu items
    { text: 'Review Loans', icon: <AssessmentIcon />, onClick: () => navigate('/employee-review'), show: isEmployee || isAdmin },
    { text: 'New Prediction', icon: <AssessmentIcon />, onClick: () => navigate('/predict'), show: isEmployee || isAdmin },
    
    // Admin-only menu items
    { text: 'System Dashboard', icon: <TrendingUp />, onClick: () => navigate('/admin-dashboard'), show: isAdmin },
    { text: 'Users & Roles', icon: <PeopleIcon />, onClick: () => navigate('/users'), show: isAdmin },
    { text: 'Interest Rates', icon: <Percent />, onClick: () => navigate('/interest-rates'), show: isAdmin },
    { text: 'Employee Performance', icon: <EmojiEvents />, onClick: () => navigate('/employee-performance'), show: isAdmin },
    { text: 'System Reports', icon: <AssessmentIcon />, onClick: () => navigate('/reports'), show: isAdmin },
    { text: 'Risk Analysis', icon: <TrendingUp />, onClick: () => navigate('/risk-analysis'), show: isAdmin },
    { text: 'Settings', icon: <SettingsIcon />, onClick: () => navigate('/settings'), show: isAdmin },
  ].filter(item => item.show);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: sidebarBg, color: sidebarText }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 40, height: 40 }}>
          {isAdmin ? <AdminPanelSettings /> : <TrendingUp />}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold" noWrap>
            LoanGuard
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {user?.role || 'USER'} PORTAL
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mx: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Box sx={{ px: 2, py: 3, flex: 1, overflowY: 'auto' }}>
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
              color: sidebarText,
              opacity: 0.8,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', opacity: 1 }
            }}
          >
            {item.text}
          </Button>
        ))}
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} color="default" />}
          label={darkMode ? <DarkMode /> : <LightMode />}
          sx={{ mb: 2, display: 'flex', justifyContent: 'center', color: sidebarText }}
        />
        <Button 
          fullWidth 
          variant="outlined" 
          startIcon={<LogoutIcon />} 
          onClick={handleLogout}
          sx={{ color: sidebarText, borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  const renderDashboardContent = () => {
    if (isAdmin) return <AdminDashboard darkMode={darkMode} />;
    if (isEmployee) return <EmployeeDashboard darkMode={darkMode} />;
    return <UserDashboard darkMode={darkMode} />;
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: bgColor, color: textColor, overflow: 'hidden' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <Box sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: mobileOpen ? 0 : -drawerWidth,
            width: drawerWidth,
            height: '100vh',
            transition: 'left 0.3s',
            zIndex: 1200,
            boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
          }}>
            {drawer}
          </Box>
        ) : (
          <Box sx={{
            width: drawerWidth,
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
          }}>
            {drawer}
          </Box>
        )}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` }, display: 'flex', flexDirection: 'column' }}>
        {/* Top App Bar */}
        <Paper sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderRadius: 0,
          bgcolor: paperColor,
          color: textColor,
          flexShrink: 0,
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }} elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleDrawerToggle} sx={{ display: { md: 'none' }, color: textColor }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="600">
              Welcome back, {user?.username}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Notifications">
              <IconButton sx={{ color: textColor }}>
                <Notifications />
              </IconButton>
            </Tooltip>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </Box>
        </Paper>

        {/* Dynamic Role-Based Content */}
        {renderDashboardContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;