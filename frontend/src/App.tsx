import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, 
  Typography, Button, CircularProgress, Box 
} from '@mui/material';
import LoanForm from './components/LoanForm';
import ResultCard from './components/ResultCard';
import AuthForm from './components/AuthForm';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: { primary: { main: '#1976d2' }, secondary: { main: '#dc004e' } },
});

const AuthWrapper: React.FC = () => {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [prediction, setPrediction] = useState<any>(null);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/forgot-password" element={
          isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />
        } />
        <Route path="/reset-password" element={
          isAuthenticated ? <Navigate to="/" /> : <ResetPassword />
        } />
        
        {/* Main route */}
        <Route path="/" element={
          !isAuthenticated ? <AuthForm onForgotPassword={() => window.location.href = '/forgot-password'} /> : (
            <Box sx={{ width: '100%', minHeight: '100vh' }}>
              <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)' }}>
                <Toolbar>
                  <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
                    💰 Loan Default Predictor
                  </Typography>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    Welcome, {user?.username}!
                  </Typography>
                  <Button color="inherit" onClick={logout} variant="outlined" size="small">
                    Logout
                  </Button>
                </Toolbar>
              </AppBar>
              
              <Box sx={{ width: '100%' }}>
                <LoanForm onResult={setPrediction} />
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
                  <ResultCard data={prediction} />
                </Box>
              </Box>
            </Box>
          )
        } />
      </Routes>
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
