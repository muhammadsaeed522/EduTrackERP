import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('edutrack_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading] = useState(false);

  const persist = (userData, token) => {
    localStorage.setItem('edutrack_token', token);
    localStorage.setItem('edutrack_user', JSON.stringify(userData));
    setUser(userData);
  };

  const teacherLogin = async (email, password) => {
    const { data } = await api.post('/auth/teacher/login', { email, password });
    persist(data.data.user, data.data.token);
    return data.data.user;
  };

  const studentLogin = async (rollNumber, password) => {
    const { data } = await api.post('/auth/student/login', { rollNumber, password });
    persist(data.data.user, data.data.token);
    return data.data.user;
  };

  const signup = async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    persist(data.data.user, data.data.token);
    return data.data.user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('edutrack_token');
    localStorage.removeItem('edutrack_user');
    setUser(null);
  }, []);

  const isStaff = user?.role === ROLES.ADMIN || user?.role === ROLES.TEACHER;
  const isStudent = user?.role === ROLES.STUDENT;

  return (
    <AuthContext.Provider
      value={{ user, loading, teacherLogin, studentLogin, signup, logout, isStaff, isStudent }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
