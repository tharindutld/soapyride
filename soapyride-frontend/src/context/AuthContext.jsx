// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

const formatEmailToName = (email) => {
  if (!email || !email.includes('@')) return '';
  const prefix = email.split('@')[0].replace(/[0-9_.-]+/g, ' ').trim();
  if (!prefix) return 'Member';
  return prefix
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

export const sanitizeCustomerSession = () => {
  try {
    const customerToken = localStorage.getItem('jwtToken');
    const storedName = localStorage.getItem('userName') || '';
    const storedEmail = (localStorage.getItem('userEmail') || '').toLowerCase();

    // Clean up adminUserName if it has legacy default string
    const adminUserName = localStorage.getItem('adminUserName') || '';
    if (adminUserName.toLowerCase().includes('tharindu')) {
      localStorage.setItem('adminUserName', 'System Administrator');
    }

    // If customer token is actually an old admin offline token, clear it
    if (customerToken === 'offline-admin-session-token') {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userName');
      return { token: null, name: '', role: 'user' };
    }

    // Resolve the correct customer display name
    let cleanName = storedName;
    if (cleanName.toLowerCase().includes('tharindu')) {
      const localCustomers = JSON.parse(localStorage.getItem('sr_registered_customers') || '[]');
      const lastReg = JSON.parse(localStorage.getItem('sr_last_registered_customer') || 'null');
      const byEmail = storedEmail
        ? localCustomers.find((c) => (c.email || '').toLowerCase() === storedEmail)
        : null;

      if (byEmail && byEmail.fullname && !byEmail.fullname.toLowerCase().includes('tharindu')) {
        cleanName = byEmail.fullname;
      } else if (lastReg && lastReg.fullname && !lastReg.fullname.toLowerCase().includes('tharindu')) {
        cleanName = lastReg.fullname;
      } else if (localCustomers.length > 0) {
        const latest = localCustomers[localCustomers.length - 1];
        cleanName = latest.fullname || formatEmailToName(storedEmail) || 'Member';
      } else if (storedEmail) {
        cleanName = formatEmailToName(storedEmail);
      } else {
        cleanName = '';
      }

      if (customerToken && cleanName) {
        localStorage.setItem('userName', cleanName);
      } else {
        localStorage.removeItem('userName');
      }
    }

    return {
      token: customerToken,
      name: cleanName,
      role: localStorage.getItem('userRole') || 'user'
    };
  } catch {
    return {
      token: localStorage.getItem('jwtToken'),
      name: localStorage.getItem('userName') || '',
      role: 'user'
    };
  }
};

export const AuthProvider = ({ children }) => {
  const initial = sanitizeCustomerSession();
  const [isLoggedIn, setIsLoggedIn] = useState(!!initial.token);
  const [userName, setUserName] = useState(initial.name);
  const [userRole, setUserRole] = useState(initial.role);

  const refreshAuth = useCallback(() => {
    const current = sanitizeCustomerSession();
    setIsLoggedIn(!!current.token);
    setUserName(current.name || '');
    setUserRole(current.role || 'user');
  }, []);

  useEffect(() => {
    refreshAuth();

    const syncAuthAcrossTabs = () => refreshAuth();
    window.addEventListener('storage', syncAuthAcrossTabs);

    return () => {
      window.removeEventListener('storage', syncAuthAcrossTabs);
    };
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, userRole, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
