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
import AuthForm from './components/AuthForm';  // Removed { } - default import

const theme = createTheme({
  palette: { 
    primary: { main: '#1976d2' }, 
    secondary: { main: '#dc004e' } 
  },
});

// Auth wrapper component
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
    return <AuthForm />;  // This will show your sexy centered design!
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
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LoanForm onResult={setPrediction} />
        <ResultCard data={prediction} />
      </Container>
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
