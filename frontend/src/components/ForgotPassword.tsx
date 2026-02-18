import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

// DEBUG: Log the API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
console.log('ForgotPassword API_URL:', API_URL); // Check browser console for this!

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // DEBUG: Show what URL we're calling
    const fullUrl = `${API_URL}/auth/forgot-password`;
    console.log('Calling URL:', fullUrl);

    try {
      const response = await axios.post(fullUrl, { email }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setMessage('Check your email for reset instructions');
      console.log('Reset link:', response.data.reset_link);
    } catch (err: any) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      console.error('Error request:', err.request);
      
      if (err.response?.status === 404) {
        setError('API endpoint not found. Please try again later.');
      } else {
        setError(err.response?.data?.detail || 'Failed to send reset email');
      }
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      px: 2
    }}>
      <Paper elevation={24} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Reset Password
        </Typography>
        
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* DEBUG: Show API URL (remove after fixing) */}
        <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block', textAlign: 'center' }}>
          API: {API_URL}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField 
            fullWidth 
            label="Email Address" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
            sx={{ mb: 3 }} 
          />

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large" 
            disabled={loading} 
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>

          <Button component={Link} to="/" fullWidth variant="outlined">
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
