import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Box
} from '@mui/material';
import LoanForm from './components/LoanForm';
import ResultCard from './components/ResultCard';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './pages/Dashboard';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  },
});

// Separate component to use hooks inside Router
const AppContent: React.FC = () => {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [prediction, setPrediction] = useState<any>(null);
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={
        isAuthenticated ? <Dashboard /> : <Navigate to="/" />
      } />
      <Route path="/forgot-password" element={
        isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />
      } />
      <Route path="/reset-password" element={
        isAuthenticated ? <Navigate to="/" /> : <ResetPassword />
      } />
      <Route path="/" element={
        !isAuthenticated ? <AuthForm onForgotPassword={() => navigate('/forgot-password')} /> : (
          <Box sx={{
            width: '100vw',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
          }}>
            <AppBar position="static" elevation={0} sx={{
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
            }}>
              <Toolbar>
                {/* LEFT SIDE: Logo + Navigation */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mr: 4 }}>
                    💰 Loan Default Predictor
                  </Typography>
                  
                  {/* HOME button (active since we're on home page) */}
                  <Button 
                    color="inherit" 
                    sx={{ 
                      mr: 1,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      fontWeight: 'bold'
                    }}
                  >
                    HOME
                  </Button>
                  
                  {/* DASHBOARD button - now on LEFT */}
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/dashboard')}
                    sx={{ mr: 2 }}
                  >
                    DASHBOARD
                  </Button>
                </Box>

                {/* RIGHT SIDE: User + Logout */}
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Welcome, {user?.username}!
                </Typography>
                <Button 
                  color="inherit" 
                  onClick={logout} 
                  variant="outlined" 
                  size="small"
                  sx={{ borderColor: 'white' }}
                >
                  Logout
                </Button>
              </Toolbar>
            </AppBar>

            <Box sx={{ width: '100%', flex: 1 }}>
              <LoanForm onResult={setPrediction} />
              <Box sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
                <ResultCard data={prediction} />
              </Box>
            </Box>
          </Box>
        )
      } />
    </Routes>
  );
};

const AuthWrapper: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthWrapper />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;