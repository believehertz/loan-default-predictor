// src/components/AuthForm.tsx
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Tabs, 
  Tab,
  Avatar,
  Fade,
  Slide,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  LockOutlined, 
  Visibility,
  VisibilityOff,
  TrendingUp,
  Security,
  Assessment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { darkMode } = useTheme();
  
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (tab === 0) {
      // Login validation
      if (!username.trim()) {
        newErrors.username = 'Username is required';
      }
      if (!password) {
        newErrors.password = 'Password is required';
      }
    } else {
      // Sign up validation
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!username.trim()) {
        newErrors.username = 'Username is required';
      } else if (username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (username.length > 20) {
        newErrors.username = 'Username must be 20 characters or less';
      }
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (field === 'email') setEmail(value);
    else if (field === 'username') setUsername(value);
    else if (field === 'password') setPassword(value);

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form before submission
    if (!validateForm()) {
      setError('Please fix the errors above and try again');
      return;
    }

    setLoading(true);
    
    try {
      if (tab === 0) {
        await login(username, password);
        navigate('/dashboard'); // Redirect to dashboard after login
      } else {
        await signup(email, username, password);
        navigate('/dashboard'); // Redirect to dashboard after signup
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Authentication failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Compute theme-aware styles for TextFields
  const getAuthTextFieldSx = (hasError: boolean) => ({
    mb: 0.5,
    '& .MuiOutlinedInput-root': {
      color: darkMode ? '#ffffff' : '#000000',
      backdropFilter: 'blur(10px)',
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      border: hasError ? 'rgba(244, 67, 54, 0.5)' : (darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)')
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .MuiInputBase-input::placeholder': { color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)' },
    '& .MuiInputLabel-root': { color: darkMode ? '#ffffff' : '#000000' },
    '& .MuiFormHelperText-root': { color: hasError ? (darkMode ? '#ffcdd2' : '#d32f2f') : (darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)') }
  });

  const features = [
    { icon: <TrendingUp />, text: "90%+ Accuracy" },
    { icon: <Security />, text: "Bank-Grade Security" },
    { icon: <Assessment />, text: "594K+ Records" }
  ];

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode ? 'linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #2d1b4e 100%)' : '#ffffff',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        px: 1,
        py: 1
      }}
    >
      <Box sx={{ 
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        my: 'auto'
      }}>
        <Slide direction="up" in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: 1,
              width: '100%',
              maxWidth: '420px',
              borderRadius: 0,
              backdropFilter: 'blur(20px)',
              backgroundColor: darkMode ? 'rgba(26, 26, 46, 0.7)' : 'rgba(255, 255, 255, 0.95)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              mx: 'auto',
              color: darkMode ? '#ffffff' : '#000000'
            }}
          >
            <Box display="flex" flexDirection="column" alignItems="center" mb={1}>
              <Avatar
                sx={{
                  m: 0.5,
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(102, 126, 234, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  width: 44,
                  height: 44,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                <LockOutlined sx={{ fontSize: 24, color: '#ffffff' }} />
              </Avatar>
              <Typography component="h1" variant="h6" gutterBottom 
                sx={{ fontWeight: 700, textAlign: 'center', color: darkMode ? '#ffffff' : '#000000', textShadow: darkMode ? '0 0 12px rgba(255, 255, 255, 0.3)' : 'none', mb: 0 }}>
                {tab === 0 ? 'Welcome Back!' : 'Create Account'}
              </Typography>
            </Box>

            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              centered
              sx={{ mb: 1, '& .MuiTab-root': { color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)', fontWeight: 600, py: 0.5 }, '& .Mui-selected': { color: darkMode ? '#ffffff' : '#000000' } }}
              textColor="inherit"
              indicatorColor="primary"
            >
              <Tab label="Login" sx={{ fontWeight: 600 }} />
              <Tab label="Sign Up" sx={{ fontWeight: 600 }} />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 1, backgroundColor: 'rgba(211, 47, 47, 0.2)', border: '1px solid rgba(229, 57, 53, 0.5)', color: '#ffcdd2' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {tab === 1 && (
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={getAuthTextFieldSx(!!errors.email)}
                />
              )}
              <TextField
                margin="dense"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={handleInputChange('username')}
                error={!!errors.username}
                helperText={errors.username}
                sx={getAuthTextFieldSx(!!errors.username)}
              />
              <TextField
                margin="dense"
                required
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handleInputChange('password')}
                error={!!errors.password}
                helperText={errors.password}
                sx={getAuthTextFieldSx(!!errors.password)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)', p: 0.5 }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box textAlign="right" sx={{ mb: 0.5 }}>
                <Button 
                  size="small" 
                  onClick={() => navigate('/forgot-password')}
                  sx={{ textTransform: 'none', color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)', py: 0 }}
                >
                  Forgot Password?
                </Button>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="medium"
                disabled={loading || Object.keys(errors).some(key => errors[key])}
                sx={{
                  mt: 0.5,
                  py: 0.8,
                  borderRadius: 20,
                  fontWeight: 700,
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(102, 126, 234, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  textShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  }
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : (tab === 0 ? 'Sign In' : 'Create Account')}
              </Button>
            </Box>
          </Paper>
        </Slide>
      </Box>
    </Box>
  );
};

export default AuthForm;
