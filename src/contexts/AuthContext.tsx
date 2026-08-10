// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, setSessionExpiredHandler } from '../lib/apiClient';
import { securityTokenStorage } from '../lib/tokenStorage';

type AuthContextType = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    setSessionExpiredHandler(() => setIsAuthenticated(false));
    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await securityTokenStorage.getAccessToken();
        if (token) setIsAuthenticated(true);
      } finally {
        setIsAuthLoading(false);
      }
    })();
  }, []);

  const login = async (token: string, refreshToken: string) => {
    await securityTokenStorage.setTokens({ accessToken: token, refreshToken });
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Could not clear backend session on logout:', error);
    }
    await securityTokenStorage.clear();
    setIsAuthenticated(false);
  };

  const getToken = () => securityTokenStorage.getAccessToken();

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthLoading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
