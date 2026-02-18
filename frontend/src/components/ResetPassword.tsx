import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValid(false);
      setError('Invalid reset link');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token: token,
        new_password: newPassword
      });
      
      setMessage('Password reset successful! Redirecting...');
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!isValid) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 2 
      }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6">Invalid Reset Link</Typography>
          <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      px: 2
    }}>
      <Paper elevation={24} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          New Password
        </Typography>
        
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!message && (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField 
              fullWidth 
              label="New Password" 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              sx={{ mb: 2 }} 
            />
            
            <TextField 
              fullWidth 
              label="Confirm Password" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              sx={{ mb: 3 }} 
            />

            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;
