import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('autocare_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('autocare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token with backend
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('autocare_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { user: loggedInUser, token: authToken } = res.data;
      localStorage.setItem('autocare_token', authToken);
      localStorage.setItem('autocare_user', JSON.stringify(loggedInUser));
      setToken(authToken);
      setUser(loggedInUser);
      return loggedInUser;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.data) {
      const { user: registeredUser, token: authToken } = res.data;
      localStorage.setItem('autocare_token', authToken);
      localStorage.setItem('autocare_user', JSON.stringify(registeredUser));
      setToken(authToken);
      setUser(registeredUser);
      return registeredUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('autocare_token');
    localStorage.removeItem('autocare_user');
    setToken(null);
    setUser(null);
  };

  const updateUserData = (updatedFields) => {
    setUser(prev => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('autocare_user', JSON.stringify(next));
      return next;
    });
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isStaff = user?.role === 'STAFF';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUserData,
      isCustomer,
      isStaff,
      isAdmin,
      role: user?.role
    }}>
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
