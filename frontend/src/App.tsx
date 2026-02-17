import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, 
  Typography, Button, CircularProgress, Box 
} from '@mui/material';
const LoanForm = lazy(() => import('./components/LoanForm'));
const ResultCard = lazy(() => import('./components/ResultCard'));
const AuthForm = lazy(() => import('./components/AuthForm'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: { primary: { main: '#1976d2' }, secondary: { main: '#dc004e' } },
});

const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress size={60} />
  </Box>
);

const AuthWrapper: React.FC = () => {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<any>(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/forgot-password" element={
          isAuthenticated ? <Navigate to="/" /> : (
            <Suspense fallback={<LoadingSpinner />}>
              <ForgotPassword onBack={() => navigate('/')} />
            </Suspense>
          )
        } />
        <Route path="/reset-password" element={
          isAuthenticated ? <Navigate to="/" /> : (
            <Suspense fallback={<LoadingSpinner />}>
              <ResetPassword />
            </Suspense>
          )
        } />
        
        {/* Main route */}
        <Route path="/" element={
          !isAuthenticated ? (
            <Suspense fallback={<LoadingSpinner />}>
              <AuthForm onForgotPassword={() => window.location.href = '/forgot-password'} />
            </Suspense>
          ) : (
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
                <Suspense fallback={<LoadingSpinner />}>
                  <LoanForm onResult={setPrediction} />
                </Suspense>
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ResultCard data={prediction} />
                  </Suspense>
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
