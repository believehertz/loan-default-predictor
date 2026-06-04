import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:8000';

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
      const response = await axios.post(
        `${API_URL}/auth/forgot-password`,
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
      background: 'transparent', 
      p: 2
    }}>
      <Paper sx={{ 
        p: 4, 
        maxWidth: 400, 
        width: '100%',
        borderRadius: 2,
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
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
