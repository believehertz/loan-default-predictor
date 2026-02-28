import React, { useState } from 'react';
import { Paper, Typography, Box, Switch, FormControlLabel, Divider, Button, TextField, Alert } from '@mui/material';
import { Save, Notifications, Security, Palette } from '@mui/icons-material';

const Settings: React.FC = () => {
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
    <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Settings</Typography>
      
      {saved && <Alert severity="success" sx={{ mb: 3 }}>Settings saved successfully!</Alert>}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Notifications color="primary" />
          Notifications
        </Typography>
        <FormControlLabel
          control={<Switch checked={settings.emailNotifications} onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})} />}
          label="Email notifications for high-risk loans"
        />
        <FormControlLabel
          control={<Switch checked={settings.autoSave} onChange={(e) => setSettings({...settings, autoSave: e.target.checked})} />}
          label="Auto-save prediction history"
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Security color="primary" />
          Security
        </Typography>
        <FormControlLabel
          control={<Switch checked={settings.twoFactor} onChange={(e) => setSettings({...settings, twoFactor: e.target.checked})} />}
          label="Enable Two-Factor Authentication"
        />
        <FormControlLabel
          control={<Switch checked={settings.apiAccess} onChange={(e) => setSettings({...settings, apiAccess: e.target.checked})} />}
          label="Allow API Access"
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Palette color="primary" />
          Preferences
        </Typography>
        <TextField
          fullWidth
          label="Default Currency"
          defaultValue="USD ($)"
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Date Format"
          defaultValue="MM/DD/YYYY"
        />
      </Box>

      <Button variant="contained" startIcon={<Save />} onClick={handleSave} fullWidth>
        Save Settings
      </Button>
    </Paper>
  );
};

export default Settings;