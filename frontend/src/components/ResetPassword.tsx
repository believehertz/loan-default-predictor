import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// HARDCODED API URL - Replace with your Railway URL
const API_URL = 'https://loan-default-predictor-production-a3ad.up.railway.app/api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Verify token on load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No reset token provided');
        setVerifying(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/auth/verify-reset-token`, {
          params: { token }
        });
        
        if (response.data.valid) {
          setIsValid(true);
        } else {
          setError('Invalid or expired reset link');
        }
      } catch (err: any) {
        setError('Invalid reset link');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('Submitting reset with token:', token); // DEBUG
      
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token: token,
        new_password: newPassword
      });
      
      setMessage('Password reset successful! Redirecting to login...');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (err: any) {
      console.error('Reset error:', err);
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
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
      p: 2
    }}>
      <Paper elevation={24} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Set New Password
        </Typography>

        {/* DEBUG: Show token */}
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
          Token: {token ? token.substring(0, 8) + '...' : 'None'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        {isValid ? (
          <form onSubmit={handleSubmit}>
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
              variant="contained" 
              fullWidth 
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </form>
        ) : (
          <Button variant="outlined" fullWidth onClick={() => navigate('/')}>
            Back to Login
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;
