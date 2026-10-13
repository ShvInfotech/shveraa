import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiUserLogin,
  apiUserSendLoginOtp,
  apiUserVerifyOtpLogin,
  apiUserRegister,
  apiUserLogout,
  apiUserForgotPassword,
  apiUserGoogleLogin,
} from '../services/api';
import { getDeviceToken, signInWithGooglePopup } from '../services/firebase';

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
      let deviceToken = null;
      try {
        deviceToken = await getDeviceToken();
      } catch (tokenErr) {
        console.warn('Failed to retrieve deviceToken for login:', tokenErr);
      }

      const response = await apiUserLogin({ email, password, deviceToken });
      if (response?.user) {
        setUser(response.user);
        // Notify CartContext to reload from DB
        window.dispatchEvent(new Event('shveraa_user_logged_in'));
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
      let deviceToken = null;
      try {
        deviceToken = await getDeviceToken();
      } catch (tokenErr) {
        console.warn('Failed to retrieve deviceToken for register:', tokenErr);
      }

      const response = await apiUserRegister({ name: fullName, email, phone, password, deviceToken });
      if (response?.user) {
        setUser(response.user);
        // Notify CartContext to reload from DB
        window.dispatchEvent(new Event('shveraa_user_logged_in'));
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

  const sendLoginOtp = async (phone) => {
    setAuthError(null);
    const cleanedPhone = phone ? String(phone).replace(/\s+/g, '').replace(/^\+91/, '').trim() : '';
    if (!cleanedPhone || cleanedPhone.length < 10) {
      const msg = 'Please enter a valid 10-digit mobile number.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
    try {
      const response = await apiUserSendLoginOtp(cleanedPhone);
      if (response?.success && response?.userId) {
        return {
          success: true,
          userId: response.userId,
          message: response.message || 'OTP sent successfully to your WhatsApp number',
        };
      }
      const msg = response?.message || 'Failed to send OTP.';
      setAuthError(msg);
      return { success: false, message: msg };
    } catch (err) {
      const errorMsg = err.message || 'Failed to send WhatsApp OTP. Please try again.';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const verifyOtpLogin = async (userId, otp) => {
    setAuthError(null);
    if (!userId) {
      const msg = 'Session expired. Please request a new OTP.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
    const cleanOtp = String(otp || '').trim();
    if (!cleanOtp || cleanOtp.length !== 4) {
      const msg = 'Please enter the 4-digit OTP sent to your WhatsApp.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
    try {
      let deviceToken = null;
      try {
        deviceToken = await getDeviceToken();
      } catch (tokenErr) {
        console.warn('Failed to retrieve deviceToken for OTP login:', tokenErr);
      }

      const response = await apiUserVerifyOtpLogin({
        userId,
        otp: Number(cleanOtp),
        deviceToken,
      });

      if (response?.user) {
        setUser(response.user);
        window.dispatchEvent(new Event('shveraa_user_logged_in'));
        return { success: true, user: response.user };
      }
      const msg = response?.message || 'OTP verification failed.';
      setAuthError(msg);
      return { success: false, message: msg };
    } catch (err) {
      const errorMsg = err.message || 'Invalid or expired OTP. Please try again.';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const { idToken } = await signInWithGooglePopup();
      if (!idToken) {
        throw new Error('Google token could not be obtained.');
      }

      let deviceToken = null;
      try {
        deviceToken = await getDeviceToken();
      } catch (tokenErr) {
        console.warn('Failed to retrieve deviceToken for Google login:', tokenErr);
      }

      const response = await apiUserGoogleLogin({
        GoogleIdToken: idToken,
        deviceToken,
      });

      if (response?.user) {
        setUser(response.user);
        window.dispatchEvent(new Event('shveraa_user_logged_in'));
        return { success: true, user: response.user };
      }
      const msg = response?.message || 'Google sign-in failed.';
      setAuthError(msg);
      return { success: false, message: msg };
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return { success: false, message: 'Google sign-in popup was closed.' };
      }
      const errorMsg = err?.message || 'Google sign-in failed. Please try again.';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    await apiUserLogout();
    setUser(null);
    window.dispatchEvent(new Event('shveraa_user_logged_out'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        sendLoginOtp,
        verifyOtpLogin,
        loginWithGoogle,
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

