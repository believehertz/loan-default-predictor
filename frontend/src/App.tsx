import { useState } from 'react';
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

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
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
      
      <Box sx={{ width: '100%' }}>
        <LoanForm onResult={setPrediction} />
        <ResultCard data={prediction} />
      </Box>
    </Box>
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