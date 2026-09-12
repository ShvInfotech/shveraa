import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Diamond,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, forgotPassword, authError, setAuthError, isAuthenticated, user } = useAuth();
  const { showToast } = useCart();

  // Mode defaults based on pathname: /register or /login
  const isRegisterInitial = location.pathname.includes('register');
  const [isRegister, setIsRegister] = useState(isRegisterInitial);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [joinVault, setJoinVault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Sync mode with route change
  useEffect(() => {
    setIsRegister(location.pathname.includes('register'));
    setAuthError(null);
    setSuccessMessage('');
  }, [location.pathname, setAuthError]);

  // If already authenticated, redirect to home or previous page
  useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';
      navigate(redirectUrl);
    }
  }, [isAuthenticated, navigate, location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    if (isRegister) {
      const res = await register(fullName, email, phone, password);
      setIsSubmitting(false);
      if (res?.success) {
        showToast(`Welcome to the Shveraa Atelier, ${(fullName || 'Muse').split(' ')[0]}!`);
        const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';
        navigate(redirectUrl);
      }
    } else {
      const res = await login(email, password);
      setIsSubmitting(false);
      if (res?.success) {
        showToast('Welcome back to your Shveraa vault!');
        const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';
        navigate(redirectUrl);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setAuthError('Please enter your email address first.');
      return;
    }
    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage('');
    const res = await forgotPassword(email);
    setIsSubmitting(false);
    if (res?.success) {
      setSuccessMessage(res.message || 'Reset password link sent to your registered email.');
      showToast('Reset password link dispatched!');
    }
  };

  return (
    <div className="shv-auth-page">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="shv-shop-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="shv-bc-sep">/</span>
          <span className="shv-bc-current">{isRegister ? 'Create Account' : 'Atelier Access'}</span>
        </nav>

        <div className="shv-auth-card-wrap">
          <div className="shv-auth-card">
            {/* Top Emblem & Brand Header */}
            <div className="shv-auth-header">
              <div className="shv-auth-emblem">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
                </svg>
              </div>
              <span className="shv-script-eyebrow">The Atelier Vault</span>
              <h1 className="shv-auth-title">
                {isRegister ? 'Join the Shveraa Circle' : 'Welcome to Shveraa'}
              </h1>
              <p className="shv-auth-subtitle">
                {isRegister
                  ? 'Create an account to access private silver vault drops and insured order tracking.'
                  : 'Sign in to access your curated silver wishlist and seamless checkout.'}
              </p>

              {/* Mode Switch Tabs */}
              <div className="shv-auth-tabs">
                <button
                  type="button"
                  className={`shv-auth-tab ${!isRegister ? 'active' : ''}`}
                  onClick={() => {
                    setIsRegister(false);
                    setAuthError(null);
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`shv-auth-tab ${isRegister ? 'active' : ''}`}
                  onClick={() => {
                    setIsRegister(true);
                    setAuthError(null);
                  }}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Success & Error Notifications */}
            {authError && <div className="shv-auth-error-banner">{authError}</div>}
            {successMessage && <div className="shv-auth-error-banner" style={{ background: '#F4FBF7', borderColor: '#82C99B', color: '#1B5E20' }}>✓ {successMessage}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="shv-auth-form">
              {isRegister && (
                <>
                  <div className="shv-input-group">
                    <label htmlFor="auth-fullName">Full Name</label>
                    <div className="shv-input-wrapper">
                      <User size={16} className="shv-input-icon" />
                      <input
                        id="auth-fullName"
                        type="text"
                        required
                        placeholder="e.g. Ananya Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="shv-input-group">
                    <label htmlFor="auth-phone">Mobile Phone (For Dispatch Updates)</label>
                    <div className="shv-input-wrapper">
                      <Phone size={16} className="shv-input-icon" />
                      <input
                        id="auth-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="shv-input-group">
                <label htmlFor="auth-email">Email Address</label>
                <div className="shv-input-wrapper">
                  <Mail size={16} className="shv-input-icon" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="shv-input-group">
                <div className="shv-input-label-row">
                  <label htmlFor="auth-password">Password</label>
                  {!isRegister && (
                    <button
                      type="button"
                      className="shv-forgot-link"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="shv-input-wrapper">
                  <Lock size={16} className="shv-input-icon" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="shv-password-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="shv-auth-meta-row">
                {!isRegister ? (
                  <label className="shv-auth-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember this device</span>
                  </label>
                ) : (
                  <label className="shv-auth-checkbox">
                    <input
                      type="checkbox"
                      checked={joinVault}
                      onChange={(e) => setJoinVault(e.target.checked)}
                    />
                    <span>Receive secret vault previews &amp; invitation-only drops</span>
                  </label>
                )}
              </div>

              {/* Submit CTA */}
              <button type="submit" disabled={isSubmitting} className="shv-auth-submit-btn">
                <span>{isRegister ? 'Create Atelier Account' : 'Sign In to Atelier'}</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Bottom Toggle Prompt */}
            <div className="shv-auth-switch-footer">
              {isRegister ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setAuthError(null);
                    }}
                    className="shv-switch-action-btn"
                  >
                    Sign In here
                  </button>
                </p>
              ) : (
                <p>
                  New to Shveraa?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setAuthError(null);
                    }}
                    className="shv-switch-action-btn"
                  >
                    Create an Account
                  </button>
                </p>
              )}
            </div>

            {/* Atelier Member Privileges Strip */}
            <div className="shv-auth-privileges">
              <div className="shv-privilege-item">
                <ShieldCheck size={14} />
                <span>BIS 925 Guaranteed</span>
              </div>
              <div className="shv-privilege-item">
                <Sparkles size={14} />
                <span>Lifetime Ultrasonic Care</span>
              </div>
              <div className="shv-privilege-item">
                <Diamond size={14} />
                <span>Private Vault Drops</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
