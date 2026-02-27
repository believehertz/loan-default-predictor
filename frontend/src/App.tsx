// src/App.tsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard/Dashboard';
import LoanForm from './components/LoanForm';
import ResultCard from './components/ResultCard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

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

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
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

// Separate component to use auth context inside router
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
      
      {/* Protected Dashboard Route */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard onLogout={logout} />
          </ProtectedRoute>
        } 
      />
      
      {/* Legacy Prediction Route - redirect to dashboard or keep separate */}
      <Route 
        path="/predict" 
        element={
          <ProtectedRoute>
            <div style={{ padding: '20px' }}>
              <LoanForm onResult={(data) => console.log(data)} />
              <ResultCard data={null} />
            </div>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default App;
