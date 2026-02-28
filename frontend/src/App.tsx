// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import Dashboard from './components/dashboard/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Users from './components/dashboard/Users';
import Settings from './components/dashboard/Settings';
import Reports from './components/dashboard/Reports';
import RiskAnalysis from './components/dashboard/RiskAnalysis';
// IMPORTANT: Update this path to match where you saved PredictionPage
import PredictionPage from './components/dashboard/PredictionPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8b5cf6',
      dark: '#5a67d8',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f3f4f6',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

const AppRoutes: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthForm />
        } 
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard onLogout={logout} />
          </ProtectedRoute>
        } 
      />
      
      {/* Prediction Route - Uses PredictionPage component */}
      <Route 
        path="/predict" 
        element={
          <ProtectedRoute>
            <PredictionPage />
          </ProtectedRoute>
        } 
      />
      
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/risk-analysis" element={<ProtectedRoute><RiskAnalysis /></ProtectedRoute>} />
    </Routes>
  );
};

export default App;