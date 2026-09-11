import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { loginAdmin } from '../services/storeService';

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@shveraa.luxury');
  const [password, setPassword] = useState('shveraa2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const result = loginAdmin(email, password);
      if (result.success) {
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        } else {
          window.location.href = '/admin';
        }
      } else {
        setError(result.message || 'Invalid credentials.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleDemoFill = () => {
    setEmail('admin@shveraa.luxury');
    setPassword('shveraa2026');
    setError('');
  };

  return (
    <div className="shv-admin-login-screen">
      {/* Subtle Luxury Ambient Background */}
      <div className="shv-login-bg-glow" />

      <div className="shv-login-card">
        {/* Atelier Logo Header */}
        <div className="shv-login-header">
          <div className="shv-login-brand-icon">
            <Shield size={24} />
          </div>
          <img src="/logo.png" alt="SHVÈRAA Fine Jewellery" className="shv-login-brand-logo" />
          <h1 className="shv-login-title">Atelier Master Portal</h1>
          <p className="shv-login-subtitle">
            Restricted access for certified silversmiths, administrators &amp; store curators.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="shv-login-error-alert" role="alert">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="shv-login-form">
          <div className="shv-login-field">
            <label htmlFor="admin-email">Administrator Email</label>
            <div className="shv-login-input-wrap">
              <Mail size={16} className="shv-login-input-icon" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shveraa.luxury"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="shv-login-field">
            <div className="shv-login-field-row">
              <label htmlFor="admin-password">Master Passphrase</label>
            </div>
            <div className="shv-login-input-wrap">
              <Lock size={16} className="shv-login-input-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="shv-login-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="shv-login-options">
            <label className="shv-login-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember atelier session</span>
            </label>

            <button
              type="button"
              onClick={handleDemoFill}
              className="shv-login-demofill-btn"
              title="Autofill master admin credentials for testing"
            >
              <KeyRound size={13} />
              <span>Autofill Demo</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="shv-login-submit-btn"
          >
            {isLoading ? (
              <span>Authenticating Atelier Access...</span>
            ) : (
              <>
                <span>Enter Administration Suite</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Security Hallmark Footer */}
        <div className="shv-login-footer">
          <div className="shv-login-hallmark">
            <Sparkles size={14} />
            <span>BIS Certified 925 Pure Silver Store Cryptography</span>
          </div>
          <Link to="/" className="shv-login-backlink">
            <ArrowLeft size={14} />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
