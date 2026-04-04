import React, { useState } from 'react';
import { Paper, Typography, Box, Switch, FormControlLabel, Divider, Button, TextField, Alert, IconButton } from '@mui/material';
import { Save, Notifications, Security, Palette, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const textColor = darkMode ? '#ffffff' : '#1a1a2e';
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    autoSave: true,
    twoFactor: false,
    apiAccess: true
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 0, backdropFilter: 'blur(20px)', backgroundColor: darkMode ? 'rgba(26, 26, 46, 0.7)' : 'rgba(255, 255, 255, 0.95)', border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', maxWidth: 800, mx: 'auto', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', color: textColor }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/dashboard')}
          sx={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(102, 126, 234, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.8)' } }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" sx={{ color: textColor, textShadow: darkMode ? '0 0 12px rgba(255, 255, 255, 0.3)' : 'none' }}>Settings</Typography>
      </Box>
      {saved && <Alert severity="success" sx={{ mb: 3 }}>Settings saved successfully!</Alert>}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: textColor }}>
          <Notifications color="primary" />
          Notifications
        </Typography>
        <FormControlLabel
          control={<Switch checked={settings.emailNotifications} onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})} />}
          label="Email notifications for high-risk loans"
          sx={{ color: textColor }}
        />
        <FormControlLabel
          control={<Switch checked={settings.autoSave} onChange={(e) => setSettings({...settings, autoSave: e.target.checked})} />}
          label="Auto-save prediction history"
          sx={{ color: textColor }}
        />
      </Box>

      <Divider sx={{ my: 3, borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: textColor }}>
          <Security color="primary" />
          Security
        </Typography>
        <FormControlLabel
          control={<Switch checked={settings.twoFactor} onChange={(e) => setSettings({...settings, twoFactor: e.target.checked})} />}
          label="Enable Two-Factor Authentication"
          sx={{ color: textColor }}
        />
        <FormControlLabel
          control={<Switch checked={settings.apiAccess} onChange={(e) => setSettings({...settings, apiAccess: e.target.checked})} />}
          label="Allow API Access"
          sx={{ color: textColor }}
        />
      </Box>

      <Divider sx={{ my: 3, borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: textColor }}>
          <Palette color="primary" />
          Preferences
        </Typography>
        <TextField
          fullWidth
          label="Default Currency"
          defaultValue="USD ($)"
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              color: darkMode ? '#ffffff' : '#000000',
              backdropFilter: 'blur(10px)',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)'
            },
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiInputLabel-root': { color: darkMode ? '#ffffff' : '#000000' }
          }}
        />
        <TextField
          fullWidth
          label="Date Format"
          defaultValue="MM/DD/YYYY"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: darkMode ? '#ffffff' : '#000000',
              backdropFilter: 'blur(10px)',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)'
            },
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiInputLabel-root': { color: darkMode ? '#ffffff' : '#000000' }
          }}
        />
      </Box>

      <Button variant="contained" startIcon={<Save />} onClick={handleSave} fullWidth>
        Save Settings
      </Button>
    </Paper>
  );
};

export default Settings;