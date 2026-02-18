import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      p: 2
    }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" align="center" mb={3}>
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
            sx={{ mb: 2 }}
          />
          <Button fullWidth variant="contained" type="submit" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Send Reset Link'}
          </Button>
          <Button fullWidth variant="text" onClick={() => navigate('/')} sx={{ mt: 1 }}>
            Back to Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
