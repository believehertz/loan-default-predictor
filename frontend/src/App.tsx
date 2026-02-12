import { useState } from 'react';
import { 
  Container, 
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

const theme = createTheme({
  palette: { 
    primary: { main: '#1976d2' }, 
    secondary: { main: '#dc004e' } 
  },
});

const AuthWrapper: React.FC = () => {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [prediction, setPrediction] = useState<{
    loan_paid_back_probability: number;
    loan_will_be_paid_back: boolean;
    risk_level: string;
    confidence: string;
  } | null>(null);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            💰 Loan Default Predictor
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.username}!
          </Typography>
          <Button color="inherit" onClick={logout} variant="outlined" size="small" sx={{ borderColor: 'white' }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}>
        <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <LoanForm onResult={setPrediction} />
          <ResultCard data={prediction} />
        </Container>
      </Box>
    </>
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