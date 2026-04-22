import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = 'http://localhost:8000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('edusense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('edusense_token') || null);

  // Set axios header automatically
  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/login`, { name:'', email, password });
    localStorage.setItem('edusense_token', res.data.token);
    localStorage.setItem('edusense_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API}/register`, { name, email, password });
    localStorage.setItem('edusense_token', res.data.token);
    localStorage.setItem('edusense_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('edusense_token');
    localStorage.removeItem('edusense_user');
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);