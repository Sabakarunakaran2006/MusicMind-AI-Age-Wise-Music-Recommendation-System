import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('musicmind_token'));
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid token', err);
          logout(false);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem('musicmind_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return data.user;
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const register = async (payload) => {
    try {
      const data = await api.register(payload);
      localStorage.setItem('musicmind_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      showToast(`Account created! Welcome to MusicMind AI, ${data.user.name}!`, 'success');
      return data.user;
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logout = (notify = true) => {
    localStorage.removeItem('musicmind_token');
    setToken(null);
    setUser(null);
    if (notify) {
      showToast('Logged out successfully', 'info');
    }
  };

  const refreshUser = async () => {
    try {
      const updated = await api.getMe();
      setUser(updated);
      return updated;
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
