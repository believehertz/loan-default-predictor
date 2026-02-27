// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Button,
  Divider, Avatar, useMediaQuery,
  CssBaseline, IconButton, Tooltip,
  Switch, FormControlLabel, Paper
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
  LightMode
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SummaryCards from './SummaryCards';
import ChartSection from './ChartSection';
import ActivityTable from './ActivityTable';
import QuickActions from './QuickActions';

const drawerWidth = 280;

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [darkMode, setDarkMode] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Load dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) setDarkMode(saved === 'true');
  }, []);

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Theme colors
  const bgColor = darkMode ? '#0f0f1e' : '#f3f4f6';
  const paperColor = darkMode ? '#1a1a2e' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#1a1a2e';

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, onClick: () => navigate('/dashboard') },
    { text: 'New Prediction', icon: <AssessmentIcon />, onClick: () => navigate('/predict') },
    { text: 'Users', icon: <PeopleIcon />, onClick: () => navigate('/users') },
    { text: 'Settings', icon: <SettingsIcon />, onClick: () => navigate('/settings') },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: paperColor }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          <TrendingUp />
        </Avatar>
        <Typography variant="h6" fontWeight="bold" noWrap sx={{ color: textColor }}>
          LoanPredictor
        </Typography>
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
              color: textColor,
              '&:hover': { bgcolor: 'primary.light', color: 'white' }
            }}
          >
            {item.text}
          </Button>
        ))}
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={handleDarkModeToggle} />}
          label={darkMode ? <DarkMode sx={{ color: textColor }} /> : <LightMode sx={{ color: textColor }} />}
          sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}
        />
        <Button 
          fullWidth 
          variant="outlined" 
          color="error" 
          startIcon={<LogoutIcon />} 
          onClick={onLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: bgColor, color: textColor }}>
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
            boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
            transition: 'left 0.3s',
            zIndex: 1200,
            bgcolor: paperColor
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
            boxShadow: '4px 0 24px rgba(0,0,0,0.05)',
            bgcolor: paperColor
          }}>
            {drawer}
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` }, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderRadius: 0,
          bgcolor: paperColor,
          color: textColor
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleDrawerToggle} sx={{ display: { md: 'none' }, color: textColor }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="600">
              Dashboard Overview
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton sx={{ color: textColor }}>
                <Notifications />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleDarkModeToggle} sx={{ color: textColor }}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
            <Button 
              variant="contained" 
              color="error" 
              startIcon={<LogoutIcon />} 
              onClick={onLogout}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Logout
            </Button>
          </Box>
        </Paper>

        {/* Dashboard Content */}
        <Box sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
          <SummaryCards darkMode={darkMode} />
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} lg={8}>
              <ChartSection darkMode={darkMode} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <QuickActions />
              <Paper sx={{ p: 3, mt: 4, borderRadius: 3, bgcolor: paperColor, color: textColor }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  System Alerts
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="warning" 
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    ⚠️ 3 high-risk loans detected
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="success" 
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    ✅ Model accuracy: 91.2%
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <ActivityTable darkMode={darkMode} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;