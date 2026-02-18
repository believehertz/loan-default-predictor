import React, { useState, useEffect, lazy, Suspense, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, 
  Typography, Button, CircularProgress, Box, Alert
} from '@mui/material';
const LoanForm = lazy(() => import('./components/LoanForm'));
const ResultCard = lazy(() => import('./components/ResultCard'));
import AuthForm from './components/AuthForm';
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
import { AuthProvider, useAuth } from './context/AuthContext';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#fff' }}>
          <Alert severity="error">
            <strong>App Error:</strong> {this.state.error?.message}
          </Alert>
          <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {this.state.error?.stack}
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

const theme = createTheme({
  palette: { primary: { main: '#1976d2' }, secondary: { main: '#dc004e' } },
});

const LoadingSpinner = () => {
  const [isLong, setIsLong] = useState(false);
  
  console.log('[LoadingSpinner] Rendering...');

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[LoadingSpinner] Still loading after 3 seconds!');
      setIsLong(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" gap={2} bgcolor="#fff">
      <CircularProgress size={60} />
      {isLong && <Typography color="textSecondary">Loading... (backend may not be available)</Typography>}
    </Box>
  );
};

const TestComponent = () => (
  <Box sx={{ p: 4, bgcolor: '#fff', minHeight: '100vh' }}>
    <Typography variant="h3" color="error">DEBUG: App is rendering</Typography>
    <Typography>Check console for logs</Typography>
  </Box>
);

const AuthWrapper: React.FC = () => {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<any>(null);

  console.log('[AuthWrapper] loading:', loading, 'isAuthenticated:', isAuthenticated);

  if (loading) {
    console.log('[AuthWrapper] Still loading...');
    return <LoadingSpinner />;
  }

  console.log('[AuthWrapper] Render ready, isAuthenticated:', isAuthenticated);

  return (
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
          <AuthForm onForgotPassword={() => navigate('/forgot-password')} />
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
  );
};

function App() {
  console.log('[App] Rendering...');
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthWrapper />
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
