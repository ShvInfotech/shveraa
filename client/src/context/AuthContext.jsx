import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiUserLogin,
  apiUserRegister,
  apiUserLogout,
  apiUserForgotPassword,
} from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('shveraa_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('shveraa_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('shveraa_user');
    }
  }, [user]);

  // Listen for 401 unauthorized auto-logout event
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setAuthError('Your session has expired. Please sign in again.');
    };
    window.addEventListener('shveraa_user_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('shveraa_user_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    if (!email || !password) {
      setAuthError('Please provide both email and password.');
      return { success: false, message: 'Please provide both email and password.' };
    }
    try {
      const response = await apiUserLogin({ email, password });
      if (response?.user) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response?.message || 'Login failed.' };
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const register = async (fullName, email, phone, password) => {
    setAuthError(null);
    if (!fullName || !email || !password) {
      setAuthError('Please fill in all required fields.');
      return { success: false, message: 'Please fill in all required fields.' };
    }
    try {
      const response = await apiUserRegister({ name: fullName, email, phone, password });
      if (response?.user) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response?.message || 'Registration failed.' };
    } catch (err) {
      const errorMsg = err.message || 'Registration failed.';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const forgotPassword = async (email) => {
    setAuthError(null);
    if (!email) {
      setAuthError('Please enter your registered email address.');
      return { success: false, message: 'Please enter your registered email address.' };
    }
    try {
      const response = await apiUserForgotPassword(email);
      return { success: true, message: response?.message || 'Reset password link sent to your email.' };
    } catch (err) {
      const errorMsg = err.message || 'Failed to send reset link.';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    await apiUserLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        forgotPassword,
        logout,
        authError,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

