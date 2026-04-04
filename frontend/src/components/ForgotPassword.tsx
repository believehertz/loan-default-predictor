import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Hardcoded Railway URL - replace with yours
      const response = await axios.post(
        'https://loan-default-predictor-production-a3ad.up.railway.app/api/auth/forgot-password',
        { email }
      );
      setMessage('Reset link sent! Check console.');
      console.log(response.data.reset_link);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: darkMode ? 'linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #2d1b4e 100%)' : '#ffffff', 
      p: 2
    }}>
      <Paper sx={{ 
        p: 4, 
        maxWidth: 400, 
        width: '100%',
        borderRadius: 0,
        backdropFilter: 'blur(20px)',
        backgroundColor: darkMode ? 'rgba(26, 26, 46, 0.7)' : 'rgba(255, 255, 255, 0.95)',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        color: darkMode ? '#ffffff' : '#000000'
      }}>
        <Typography variant="h4" align="center" mb={3} sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
          Reset Password
        </Typography>
        
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField 
            fullWidth 
            label="Email" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
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
          <Button fullWidth variant="contained" type="submit" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Send Reset Link'}
          </Button>
          <Button fullWidth variant="text" onClick={() => navigate('/')} sx={{ mt: 1, color: darkMode ? '#ffffff' : '#000000' }}>
            Back to Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
