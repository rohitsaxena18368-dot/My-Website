
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('rd_lab_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = async (username, password) => {
    if (!username || !password) {
      throw new Error('Username aur password dono bharein.');
    }

    // Existing storage API ko bina verify kiye login credentials
    // assume nahi kiye ja sakte.
    if (typeof storage?.login !== 'function') {
      throw new Error(
        'Login service configure nahi hai. Original storage.js check karna zaroori hai.'
      );
    }

    const loggedInUser = await storage.login(username, password);

    if (!loggedInUser) {
      throw new Error('Login failed. Details check karein.');
    }

    setUser(loggedInUser);
    localStorage.setItem('rd_lab_user', JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rd_lab_user');
  };

  const value = { user, login, logout, setUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
