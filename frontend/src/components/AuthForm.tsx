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
  Slide
} from '@mui/material';
import { 
  LockOutlined, 
  AccountBalance, 
  TrendingUp,
  Security
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const AuthForm: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (tab === 0) {
        await login(username, password);
      } else {
        await signup(email, username, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <TrendingUp />, text: "90%+ Accuracy" },
    { icon: <Security />, text: "Bank-Grade Security" },
    { icon: <AccountBalance />, text: "594K+ Records Trained" }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',  // FORCE FULL VIEWPORT WIDTH
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'fixed',  // FIXED POSITION TO COVER EVERYTHING
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        px: 2
      }}
    >
      {/* Animated Background Pattern - Full coverage */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
          zIndex: 0
        }}
      />

      {/* Centered Content - Takes full width but centers children */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '500px',
        position: 'relative', 
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4
      }}>
        <Slide direction="up" in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, sm: 4 },
              width: '100%',
              maxWidth: '450px',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              mx: 'auto'
            }}
          >
            {/* Header */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  m: 1,
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
                }}
              >
                <LockOutlined sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography component="h1" variant="h4" color="primary" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
                {tab === 0 ? 'Welcome Back!' : 'Join Us!'}
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                {tab === 0 
                  ? 'Sign in to access your loan predictions' 
                  : 'Start predicting loan defaults with 90%+ accuracy'}
              </Typography>
            </Box>

            {/* Feature Pills */}
            <Box display="flex" justifyContent="center" gap={1} mb={3} flexWrap="wrap">
              {features.map((feature, idx) => (
                <Fade in={true} timeout={1000 + idx * 200} key={idx}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                    px={2}
                    py={0.5}
                    bgcolor="primary.light"
                    borderRadius={10}
                    color="white"
                    fontSize="0.75rem"
                  >
                    {feature.icon}
                    {feature.text}
                  </Box>
                </Fade>
              ))}
            </Box>

            {/* Tabs */}
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              centered
              sx={{ mb: 3 }}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Login" sx={{ fontWeight: 600 }} />
              <Tab label="Sign Up" sx={{ fontWeight: 600 }} />
            </Tabs>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {tab === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                />
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                {loading ? 'Processing...' : (tab === 0 ? 'Sign In' : 'Create Account')}
              </Button>
            </Box>

            {/* Footer */}
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              🔒 Secured with JWT & Argon2 Encryption
            </Typography>
          </Paper>
        </Slide>
      </Box>

      {/* Floating Circles - Full width spread */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: 40 + i * 10,
            height: 40 + i * 10,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 80}%`,
            animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-30px)' }
            },
            zIndex: 0
          }}
        />
      ))}
    </Box>
  );
};

export default AuthForm;
