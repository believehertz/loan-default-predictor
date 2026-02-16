import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, Tabs, Tab, Avatar, 
  Fade, Slide, IconButton, InputAdornment 
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface AuthFormProps {
  onForgotPassword: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onForgotPassword }) => {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

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
    { icon: '📈', text: "90%+ Accuracy" },
    { icon: '🔒', text: "Bank-Grade Security" },
    { icon: '📊', text: "594K+ Records" }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      overflow: 'auto',
      px: 2
    }}>
      <Box sx={{ width: '100%', maxWidth: '500px', position: 'relative', zIndex: 1 }}>
        <Slide direction="up" in={true} timeout={800}>
          <Paper elevation={24} sx={{
            p: 4, borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                <LockOutlined sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography component="h1" variant="h4" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                {tab === 0 ? 'Welcome Back!' : 'Join Us!'}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="center" gap={1} mb={3} flexWrap="wrap">
              {features.map((f, i) => (
                <Fade key={i} in={true} timeout={1000 + i * 200}>
                  <Box display="flex" alignItems="center" gap={0.5} px={2} py={0.5} 
                    bgcolor="primary.light" borderRadius={10} color="white" fontSize="0.75rem">
                    {f.icon} {f.text}
                  </Box>
                </Fade>
              ))}
            </Box>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
              <Tab label="Login" sx={{ fontWeight: 600 }} />
              <Tab label="Sign Up" sx={{ fontWeight: 600 }} />
            </Tabs>

            <Box component="form" onSubmit={handleSubmit}>
              {tab === 1 && (
                <TextField margin="normal" required fullWidth label="Email" type="email"
                  value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
              )}
              
              <TextField margin="normal" required fullWidth label="Username"
                value={username} onChange={(e) => setUsername(e.target.value)} sx={{ mb: 2 }} />
              
              <TextField margin="normal" required fullWidth label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 1 }}
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
              
              {/* FORGOT PASSWORD LINK */}
              <Box textAlign="right" sx={{ mb: 2 }}>
                <Button size="small" onClick={onForgotPassword} 
                  sx={{ textTransform: 'none', color: 'primary.main' }}>
                  Forgot Password?
                </Button>
              </Box>

              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  {error}
                </Typography>
              )}

              <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
                sx={{
                  mt: 2, py: 1.5, borderRadius: 2, fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}>
                {loading ? 'Processing...' : (tab === 0 ? 'Sign In' : 'Create Account')}
              </Button>
            </Box>
          </Paper>
        </Slide>
      </Box>
    </Box>
  );
};

export default AuthForm;
