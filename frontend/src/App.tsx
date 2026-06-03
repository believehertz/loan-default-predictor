import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './context/ThemeContext';

// Components
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import Dashboard from './components/dashboard/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Users from './components/dashboard/Users';
import Settings from './components/dashboard/Settings';
import Reports from './components/dashboard/Reports';
import RiskAnalysis from './components/dashboard/RiskAnalysis';
import PredictionPage from './components/dashboard/PredictionPage';

// New Role-Based Components
import BorrowersLoanForm from './components/BorrowersLoanForm';
import BorrowersLoanStatus from './components/BorrowersLoanStatus';
import EmployeeLoanReview from './components/EmployeeLoanReview';
import AdminSystemDashboard from './components/AdminSystemDashboard';
import InterestRateManagement from './components/dashboard/InterestRateManagement';
import EmployeePerformance from './components/dashboard/EmployeePerformance';

const createAppTheme = (darkMode: boolean) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#0f2b46', // Bank-grade Navy
      light: '#1e3a8a',
      dark: '#0a1a2b',
    },
    secondary: {
      main: '#475569', // Slate
    },
    background: {
      default: darkMode ? '#0f172a' : '#f8fafc',
      paper: darkMode ? '#1e293b' : '#ffffff',
    },
    text: {
      primary: darkMode ? '#f8fafc' : '#0f172a',
      secondary: darkMode ? '#cbd5e1' : '#475569',
    },
    success: {
      main: '#10b981',
      light: '#d1fae5',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2',
    },
    info: {
      main: '#3b82f6',
    }
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
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode, allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Handle role-based access if roles are specified
  if (allowedRoles && user && !allowedRoles.includes(user.role || 'USER')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <CustomThemeProvider>
      <AppWithTheme />
    </CustomThemeProvider>
  );
}

const AppWithTheme: React.FC = () => {
  const { darkMode } = useTheme();
  const theme = createAppTheme(darkMode);

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
  const { darkMode } = useTheme();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
        } 
      />
      <Route 
        path="/login" 
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
      
      <Route 
        path="/predict" 
        element={
          <ProtectedRoute>
            <PredictionPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin / Employee specific routes */}
      <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}><Users /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}><Reports /></ProtectedRoute>} />
      <Route path="/risk-analysis" element={<ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}><RiskAnalysis /></ProtectedRoute>} />
      <Route path="/employee-performance" element={<ProtectedRoute allowedRoles={['ADMIN']}><EmployeePerformance /></ProtectedRoute>} />
      
      {/* Borrower (User) Routes */}
      <Route 
        path="/apply-loan" 
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <BorrowersLoanForm darkMode={darkMode} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-loans" 
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <BorrowersLoanStatus darkMode={darkMode} />
          </ProtectedRoute>
        } 
      />
      
      {/* Employee Routes */}
      <Route 
        path="/employee-review" 
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']}>
            <EmployeeLoanReview darkMode={darkMode} />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminSystemDashboard darkMode={darkMode} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interest-rates"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <InterestRateManagement darkMode={darkMode} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;