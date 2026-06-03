import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Tabs, 
  Tab,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { 
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
  
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (tab === 0) {
      if (!username.trim()) newErrors.username = 'Username is required';
      if (!password) newErrors.password = 'Password is required';
    } else {
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email address';
      
      if (!username.trim()) newErrors.username = 'Username is required';
      else if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
      
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (field === 'email') setEmail(value);
    else if (field === 'username') setUsername(value);
    else if (field === 'password') setPassword(value);

    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Please fix the errors above and try again');
      return;
    }

    setLoading(true);
    
    try {
      if (tab === 0) {
        await login(username, password);
        navigate('/dashboard');
      } else {
        await signup(email, username, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <TrendingUp fontSize="large" />, title: "90%+ Accuracy", desc: "Advanced XGBoost predictions" },
    { icon: <Security fontSize="large" />, title: "Bank-Grade Security", desc: "End-to-end encrypted profiles" },
    { icon: <Assessment fontSize="large" />, title: "594K+ Records", desc: "Trained on massive datasets" }
  ];

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Branding Panel (Left Side) */}
      <Grid item xs={false} sm={4} md={5} sx={{ 
        display: { xs: 'none', sm: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: 'primary.main',
        color: 'white',
        p: 6,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background shapes */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            LoanGuard
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, mb: 6 }}>
            Enterprise risk assessment platform powered by machine learning.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {features.map((f, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  {f.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{f.title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>{f.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>

      {/* Form Panel (Right Side) */}
      <Grid item xs={12} sm={8} md={7} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 450 }}>
          <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
            {tab === 0 ? 'Sign In' : 'Create Account'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {tab === 0 ? 'Welcome back! Please enter your details.' : 'Join the platform to access risk predictions.'}
          </Typography>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Sign In" sx={{ fontWeight: 600, px: 4 }} />
            <Tab label="Create Account" sx={{ fontWeight: 600, px: 4 }} />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {tab === 1 && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                value={email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              value={username}
              onChange={handleInputChange('username')}
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {tab === 0 && (
              <Box textAlign="right" sx={{ mt: 1 }}>
                <Button 
                  size="small" 
                  onClick={() => navigate('/forgot-password')}
                  sx={{ p: 0 }}
                >
                  Forgot Password?
                </Button>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || Object.keys(errors).some(key => errors[key])}
              sx={{ mt: 4, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : (tab === 0 ? 'Sign In' : 'Create Account')}
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default AuthForm;
