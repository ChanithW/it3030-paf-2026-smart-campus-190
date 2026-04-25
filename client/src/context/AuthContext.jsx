import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.get('/api/auth/me')
      setUser(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const login = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const logout = () => {
    window.location.href = 'http://localhost:8080/logout';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);