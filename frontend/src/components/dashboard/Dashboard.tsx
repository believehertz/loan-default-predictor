// src/components/dashboard/Dashboard.tsx
import React, { useState } from 'react';
import {
  Box, Grid, Paper, Typography, Button,
  Divider, Avatar, useTheme, useMediaQuery,
  CssBaseline, IconButton, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  TrendingUp,
  Notifications
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Predictions', icon: <AssessmentIcon />, path: '/predict' },
    { text: 'Users', icon: <PeopleIcon />, path: '#' },
    { text: 'Settings', icon: <SettingsIcon />, path: '#' },
  ];

  const drawer = (
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
            onClick={() => navigate(item.path)}
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

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={onLogout}>
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      
      <Box sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: mobileOpen ? 0 : -drawerWidth,
            width: drawerWidth,
            height: '100vh',
            bgcolor: 'background.paper',
            boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
            transition: 'left 0.3s',
            zIndex: 1200
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
            bgcolor: 'background.paper',
            boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
          }}>
            {drawer}
          </Box>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, ml: { md: `${drawerWidth}px` }, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="600">Dashboard Overview</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton><Notifications /></IconButton>
            </Tooltip>
            <Button variant="contained" color="error" startIcon={<LogoutIcon />} onClick={onLogout}>
              Logout
            </Button>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
          <SummaryCards />
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} lg={8}>
              <ChartSection />
            </Grid>
            <Grid item xs={12} lg={4}>
              <QuickActions />
            </Grid>
          </Grid>

          <ActivityTable />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;