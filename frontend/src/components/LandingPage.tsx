import React from 'react';
import { Box, Button, Typography, Container, Grid, Paper, Stack } from '@mui/material';
import { Security, Speed, Analytics, ArrowForward, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box component="header" sx={{ 
        py: 2, 
        px: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        background: darkMode ? '#0f172a' : '#ffffff'
      }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          LoanGuard
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="text" onClick={() => navigate('/login')}>Sign In</Button>
          <Button variant="contained" onClick={() => navigate('/login')} endIcon={<ArrowForward />}>
            Get Started
          </Button>
        </Stack>
      </Box>

      {/* Hero Section */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" fontWeight="800" gutterBottom sx={{ lineHeight: 1.2 }}>
                Intelligent Loan <br />
                <span className="text-gradient">Default Prediction</span>
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4, fontWeight: 400 }}>
                Empower your financial decisions with our bank-grade XGBoost model, 
                trained on over 594,000 real-world records to deliver 90.13% accuracy.
              </Typography>
              
              <Stack direction="row" spacing={2} sx={{ mb: 6 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/login')}
                  endIcon={<ArrowForward />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Start Predicting
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={() => navigate('/login')}
                  startIcon={<Login />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Access Portal
                </Button>
              </Stack>
              
              {/* Trust Badges */}
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', opacity: 0.8 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">90%+</Typography>
                  <Typography variant="caption" color="text.secondary">Accuracy Rate</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">594K</Typography>
                  <Typography variant="caption" color="text.secondary">Records Trained</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">0.2s</Typography>
                  <Typography variant="caption" color="text.secondary">Inference Time</Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Abstract Graphic / Dashboard Mockup */}
            <Grid item xs={12} md={6}>
              <Box className="glass-panel" sx={{ p: 4, position: 'relative', overflow: 'hidden', height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'var(--info-main)', opacity: 0.2, filter: 'blur(50px)' }} />
                <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, borderRadius: '50%', background: 'var(--accent-primary)', opacity: 0.2, filter: 'blur(60px)' }} />
                
                <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
                    <Speed color="primary" fontSize="large" />
                    <Box>
                      <Typography variant="subtitle2">Processing Speed</Typography>
                      <Typography variant="body2" color="text.secondary">Real-time risk assessment</Typography>
                    </Box>
                  </Paper>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
                    <Analytics color="info" fontSize="large" />
                    <Box>
                      <Typography variant="subtitle2">XGBoost Engine</Typography>
                      <Typography variant="body2" color="text.secondary">Advanced gradient boosting</Typography>
                    </Box>
                  </Paper>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
                    <Security color="success" fontSize="large" />
                    <Box>
                      <Typography variant="subtitle2">Enterprise Security</Typography>
                      <Typography variant="body2" color="text.secondary">Bank-grade data encryption</Typography>
                    </Box>
                  </Paper>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ 
        py: 3, 
        textAlign: 'center', 
        borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        color: 'text.secondary'
      }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} #BoyAlone🎯 Developers.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
