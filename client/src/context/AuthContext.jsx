import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const login = (email, password) => {
    setAuthError(null);
    // Simple authentication simulation with persistent local profile
    if (!email || !password) {
      setAuthError('Please provide both email and password.');
      return false;
    }
    const namePart = email.split('@')[0];
    const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const loggedUser = {
      name: capitalizedName,
      email,
      memberSince: '2026',
      membershipTier: 'Silver Atelier Muse',
    };
    setUser(loggedUser);
    return true;
  };

  const register = (fullName, email, phone, password) => {
    setAuthError(null);
    if (!fullName || !email || !password) {
      setAuthError('Please fill in all required fields.');
      return false;
    }
    const newUser = {
      name: fullName,
      email,
      phone: phone || '',
      memberSince: '2026',
      membershipTier: 'Silver Atelier Muse',
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
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
