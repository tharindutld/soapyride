// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('user');

  const refreshAuth = () => {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('adminToken');
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole') || 'user';
    setIsLoggedIn(!!token);
    setUserName(name || '');
    setUserRole(role);
  };

  useEffect(() => {
    refreshAuth();

    const syncAuthAcrossTabs = () => refreshAuth();
    window.addEventListener('storage', syncAuthAcrossTabs);

    return () => {
      window.removeEventListener('storage', syncAuthAcrossTabs);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, userRole, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
