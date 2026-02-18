import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (token: string) => {
    try {
      console.log('[AuthProvider] Fetching user with token...');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      console.log('[AuthProvider] User fetched successfully:', response.data.username);
      setUser(response.data);
    } catch (error) {
      console.log('[AuthProvider] Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      console.log('[AuthProvider] Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[AuthProvider] useEffect running...');
    const token = localStorage.getItem('token');
    console.log('[AuthProvider] token from localStorage:', token ? '***' : 'none');
    
    if (token) {
      console.log('[AuthProvider] Found token, fetching user...');
      fetchUser(token);
    } else {
      console.log('[AuthProvider] No token, setting loading to false immediately');
      setLoading(false);
    }
    
    // Safety timeout - force loading to false after 10 seconds
    const timeout = setTimeout(() => {
      console.log('[AuthProvider] Safety timeout - forcing loading to false');
      setLoading(false);
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, []);

  const login = async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axios.post(`${API_URL}/auth/login`, formData);
    const { access_token, user } = response.data;
    localStorage.setItem('token', access_token);
    setUser(user);
  };

  const signup = async (email: string, username: string, password: string) => {
    await axios.post(`${API_URL}/auth/signup`, {
      email, username, password
    });
    // Auto login after signup
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, login, signup, logout,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
