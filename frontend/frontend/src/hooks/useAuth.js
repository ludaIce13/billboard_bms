import { useState, useEffect } from 'react';
import client from '../api/client';

export default function useAuth() {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token') || '';
    // Set axios header immediately on init if token exists
    if (storedToken) {
      client.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
    }
    return storedToken;
  });
  
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    try {
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      client.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete client.defaults.headers.common.Authorization;
    }
  }, [token]);

  const saveAuth = (t, u) => {
    setToken(t);
    setUser(u);
    // set immediately to avoid race on first navigation after login
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    client.defaults.headers.common.Authorization = `Bearer ${t}`;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('user');
  };

  return { token, user, saveAuth, logout };
}
