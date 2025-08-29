

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, Role } from '../types';
// FIX: Added mockLogout to the import from authService.
import { mockLogin, mockLogout } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (credentials: { email?: string, name?: string }, role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (credentials: { email?: string, name?: string }, role: Role) => {
    const loggedInUser = await mockLogin(credentials, role);
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
        throw new Error("Login failed: User not found");
    }
  }, []);

  const logout = useCallback(() => {
    mockLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
