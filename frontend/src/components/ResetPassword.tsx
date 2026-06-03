import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token: token,
        new_password: password
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box sx={{ p: 4, background: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">Invalid reset link</Alert>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ p: 4, background: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="success">Password reset! Redirecting...</Alert>
      </Box>
    );
  }

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
        <Typography variant="h4" align="center" mb={3} sx={{ color: darkMode ? '#ffffff' : '#000000' }}>Reset Password</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            disabled={loading || password.length < 6}
          >
            {loading ? <CircularProgress size={20} /> : 'Reset Password'}
          </Button>
          
          <Button 
            variant="text" 
            fullWidth 
            onClick={() => navigate('/')}
            sx={{ mt: 1, color: darkMode ? '#ffffff' : '#000000' }}
          >
            Cancel
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;