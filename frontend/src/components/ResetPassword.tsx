import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// API URL - production only (reset doesn't work locally anyway)
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
    console.log('Token from URL:', token); // DEBUG
    
    if (!token) {
      setError('No reset token found in URL');
      setVerifying(false);
      return;
    }

    // Token exists, mark as valid (backend will verify on submit)
    setIsValid(true);
    setVerifying(false);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted'); // DEBUG
    
    // Validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    
    console.log('Sending request to:', `${API_URL}/auth/reset-password`); // DEBUG
    console.log('Token:', token); // DEBUG

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token: token,
        new_password: newPassword
      });
      
      console.log('Success response:', response.data); // DEBUG
      setMessage('Password reset successful! Redirecting to login...');
      
      // Clear form
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error:', err); // DEBUG
      console.error('Response:', err.response); // DEBUG
      
      if (err.response?.status === 400) {
        setError('Invalid or expired reset token. Please request a new reset link.');
      } else {
        setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
      }
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
      <Paper elevation={24} sx={{ p: 4, maxWidth: 450, width: '100%', borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ fontWeight: 700 }}>
          Set New Password
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        {isValid && !message ? (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
              helperText="Minimum 6 characters"
            />
            
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              error={confirmPassword !== '' && newPassword !== confirmPassword}
              helperText={confirmPassword !== '' && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
            />

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large"
              disabled={loading || !newPassword || !confirmPassword}
              sx={{
                py: 1.5,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                fontWeight: 700
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>

            <Button 
              variant="text" 
              fullWidth 
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Back to Login
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
