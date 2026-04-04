// src/components/dashboard/Dashboard.tsx
import React, { useState } from 'react';
import {
  Box, Grid, Typography, Button,
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
  LightMode
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import SummaryCards from './SummaryCards';
import ChartSection from './ChartSection';
import ActivityTable from './ActivityTable';
import QuickActions from './QuickActions';

const drawerWidth = 280;

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Theme colors
  const bgColor = darkMode ? '#0f0f1e' : '#ffffff';
  const paperColor = darkMode ? '#1a1a2e' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#000000';
  const sidebarBg = darkMode ? 'rgba(26, 26, 46, 0.7)' : 'rgba(255, 255, 255, 0.95)';
  const sidebarBorder = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const glassBg = darkMode ? 'rgba(26, 26, 46, 0.6)' : 'rgba(255, 255, 255, 0.8)';
  const glassBorder = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

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
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
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
            backdropFilter: 'blur(20px)',
            backgroundColor: sidebarBg,
            border: `1px solid ${sidebarBorder}`,
            boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
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
            backdropFilter: 'blur(20px)',
            backgroundColor: sidebarBg,
            border: `1px solid ${sidebarBorder}`,
            boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
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
          p: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderRadius: 0,
          backdropFilter: 'blur(20px)',
          backgroundColor: glassBg,
          border: `1px solid ${glassBorder}`,
          color: textColor,
          flexShrink: 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleDrawerToggle} sx={{ display: { md: 'none' }, color: textColor }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="body2" fontWeight="600">
              Dashboard
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton sx={{ color: textColor }}>
                <Notifications />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Dashboard Content */}
        <Box sx={{ flexGrow: 1, p: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <SummaryCards darkMode={darkMode} />
          
          <Grid container spacing={1} sx={{ mt: 0, flexGrow: 0 }}>
            <Grid item xs={12} lg={7} sx={{ overflow: 'auto', height: { xs: 'auto', lg: 200 } }}>
              <ChartSection darkMode={darkMode} />
            </Grid>
            <Grid item xs={12} lg={5} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, overflow: 'hidden' }}>
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <QuickActions />
              </Box>
              <Paper sx={{ p: 1, borderRadius: 0, backdropFilter: 'blur(20px)', backgroundColor: darkMode ? 'rgba(26, 26, 46, 0.4)' : 'rgba(255, 255, 255, 0.9)', border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', color: textColor, flexGrow: 1, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                <Typography variant="caption" fontWeight="bold" gutterBottom sx={{ display: 'block', textShadow: darkMode ? '0 0 8px rgba(255, 255, 255, 0.2)' : 'none' }}>
                  System Alerts
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                  <Button 
                    variant="outlined" 
                    color="warning" 
                    fullWidth
                    size="small"
                    sx={{ justifyContent: 'flex-start', fontSize: '0.7rem' }}
                  >
                    ⚠️ 3 high-risk loans
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="success" 
                    fullWidth
                    size="small"
                    sx={{ justifyContent: 'flex-start', fontSize: '0.7rem' }}
                  >
                    ✅ Accuracy: 91.2%
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 1, flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
            <ActivityTable darkMode={darkMode} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;