import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeft,
  CheckCircle2,
  Diamond,
  Edit2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    login,
    sendLoginOtp,
    verifyOtpLogin,
    loginWithGoogle,
    register,
    forgotPassword,
    authError,
    setAuthError,
    isAuthenticated,
  } = useAuth();
  const { showToast } = useCart();

  // Mode defaults based on pathname: /register or /login
  const isRegisterInitial = location.pathname.includes('register');
  const [isRegister, setIsRegister] = useState(isRegisterInitial);

  // Login flow state ('otp' mode is default for modern luxury login)
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' | 'password'
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'verify'
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // References for 4-digit OTP input boxes
  const otpRefs = useRef([]);

  // Traditional Form Fields (for register or password fallback)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [joinVault, setJoinVault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasPendingItem, setHasPendingItem] = useState(false);
  const [pendingItemName, setPendingItemName] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('shveraa_pending_cart_item');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.product?.name) {
          setHasPendingItem(true);
          setPendingItemName(parsed.product.name);
        }
      }
    } catch {}
  }, []);

  // Sync mode with route change
  useEffect(() => {
    const isReg = location.pathname.includes('register');
    setIsRegister(isReg);
    setAuthError(null);
    setSuccessMessage('');
    if (isReg) {
      setOtpStep('phone');
    }
  }, [location.pathname, setAuthError]);

  // If already authenticated, redirect to home or previous page
  useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';
      navigate(redirectUrl);
    }
  }, [isAuthenticated, navigate, location.search]);

  // Handle OTP Resend Countdown
  useEffect(() => {
    let timer = null;
    if (otpStep === 'verify' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpStep, otpCountdown]);

  // Auto-focus first OTP digit when entering verification step
  useEffect(() => {
    if (otpStep === 'verify') {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 150);
    }
  }, [otpStep]);

  // ─── STEP 1: Send Login OTP ──────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setSuccessMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    setIsSubmitting(true);
    const res = await sendLoginOtp(cleanPhone);
    setIsSubmitting(false);

    if (res?.success && res?.userId) {
      setUserId(res.userId);
      setOtpStep('verify');
      setOtpDigits(['', '', '', '']);
      setOtpCountdown(30); // 30-second cooldown
      setSuccessMessage(res.message || 'OTP sent to your WhatsApp number!');
      showToast('OTP sent to your WhatsApp number!');
    }
  };

  // ─── STEP 2: Verify Login OTP ────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setSuccessMessage('');

    const enteredCode = otpDigits.join('').trim();
    if (enteredCode.length !== 4) {
      setAuthError('Please enter the complete 4-digit OTP.');
      return;
    }

    if (!userId) {
      setAuthError('Session expired. Please request a new OTP.');
      setOtpStep('phone');
      return;
    }

    setIsSubmitting(true);
    const res = await verifyOtpLogin(userId, Number(enteredCode));
    setIsSubmitting(false);

    if (res?.success) {
      showToast('Welcome back to your Shveraa vault!');
      const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';
      navigate(redirectUrl);
    }
  };

  // Handle 4-Digit Input interactions
  const handleDigitChange = (index, val) => {
    const clean = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (!clean) {
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Take the last entered character
    const char = clean.slice(-1);
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted) {
      const newDigits = ['', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      const targetIndex = Math.min(pasted.length, 3);
      otpRefs.current[targetIndex]?.focus();
    }
  };

  // ─── Password / Register Submit ──────────────────────────────────────────
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

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage('');
    try {
      const res = await loginWithGoogle();
      setIsSubmitting(false);
      if (res?.success) {
        const displayName = res.user?.name ? res.user.name.split(' ')[0] : 'Muse';
        showToast(`Welcome to Shveraa, ${displayName}!`);
        const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';
        navigate(redirectUrl);
      } else if (res?.message && res.message !== 'Google sign-in popup was closed.') {
        showToast(res.message);
      }
    } catch (err) {
      setIsSubmitting(false);
      showToast(err?.message || 'Google login failed.');
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
                {isRegister
                  ? 'Join the Shveraa Circle'
                  : otpStep === 'verify'
                  ? 'Verify WhatsApp OTP'
                  : 'Welcome to Shveraa'}
              </h1>
              <p className="shv-auth-subtitle">
                {isRegister
                  ? 'Create an account to access private silver vault drops and insured order tracking.'
                  : otpStep === 'verify'
                  ? `Enter the 4-digit verification code sent to your WhatsApp number`
                  : 'Sign in instantly with your mobile number via WhatsApp OTP.'}
              </p>

              {/* Notice for pending cart item */}
              {hasPendingItem && (
                <div className="shv-auth-pending-alert">
                  <Sparkles size={16} />
                  <span>
                    Sign in or create an account to automatically add <strong>{pendingItemName || 'your selected piece'}</strong> to your shopping bag.
                  </span>
                </div>
              )}

              {/* Mode Switch Tabs */}
              <div className="shv-auth-tabs">
                <button
                  type="button"
                  className={`shv-auth-tab ${!isRegister ? 'active' : ''}`}
                  onClick={() => {
                    setIsRegister(false);
                    setAuthError(null);
                    setSuccessMessage('');
                    setOtpStep('phone');
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
                    setSuccessMessage('');
                  }}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Success & Error Notifications */}
            {authError && <div className="shv-auth-error-banner">{authError}</div>}
            {successMessage && (
              <div
                className="shv-auth-error-banner"
                style={{ background: '#F4FBF7', borderColor: '#82C99B', color: '#1B5E20' }}
              >
                ✓ {successMessage}
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════
                SIGN IN FLOW: MOBILE OTP (PRIMARY)
                ═════════════════════════════════════════════════════════════════ */}
            {!isRegister && loginMethod === 'otp' && (
              <>
                {/* STEP 1: Enter Mobile Number */}
                {otpStep === 'phone' ? (
                  <form onSubmit={handleSendOtp} className="shv-auth-form">
                    <div className="shv-input-group">
                      <label htmlFor="auth-login-phone">Mobile Phone Number</label>
                      <div className="shv-phone-input-group">
                        <div className="shv-country-code-pill">
                          <span className="shv-country-flag">🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          id="auth-login-phone"
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          required
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          autoFocus
                        />
                      </div>
                      <div className="shv-whatsapp-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.16-.174.347-.217.462-.217l.332.007c.109.005.253-.042.39.292.145.348.491 1.2.535 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.356.101.174.453.746.971 1.208.667.594 1.229.779 1.403.866.173.086.275.072.376-.044.102-.116.433-.506.549-.68.116-.174.231-.145.39-.087.159.058 1.011.477 1.184.564.173.087.289.13.332.203.044.072.044.42-.1.825z" />
                        </svg>
                        <span>4-digit OTP will be sent to your WhatsApp</span>
                      </div>
                    </div>

                    <div className="shv-auth-meta-row">
                      <label className="shv-auth-checkbox">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span>Remember this device</span>
                      </label>
                      <button
                        type="button"
                        className="shv-forgot-link"
                        onClick={() => {
                          setLoginMethod('password');
                          setAuthError(null);
                        }}
                      >
                        Use password
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || phone.replace(/\D/g, '').length < 10}
                      className="shv-auth-submit-btn"
                    >
                      <span>{isSubmitting ? 'Sending OTP...' : 'Send WhatsApp OTP'}</span>
                      <ArrowRight size={15} />
                    </button>
                  </form>
                ) : (
                  /* STEP 2: Enter 4-Digit OTP */
                  <form onSubmit={handleVerifyOtp} className="shv-auth-form">
                    <div className="shv-otp-sent-info">
                      <div>
                        Sent to <strong>+91 {phone}</strong>
                      </div>
                      <button
                        type="button"
                        className="shv-otp-edit-btn"
                        onClick={() => {
                          setOtpStep('phone');
                          setOtpDigits(['', '', '', '']);
                          setAuthError(null);
                          setSuccessMessage('');
                        }}
                      >
                        Edit Number
                      </button>
                    </div>

                    <div className="shv-otp-container">
                      <div className="shv-otp-boxes">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (otpRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                            onPaste={handleDigitPaste}
                            className={`shv-otp-box ${digit ? 'filled' : ''}`}
                            autoComplete="one-time-code"
                          />
                        ))}
                      </div>

                      <div className="shv-otp-timer-row">
                        <span>Didn't receive the OTP?</span>
                        {otpCountdown > 0 ? (
                          <span>Resend in {otpCountdown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSubmitting}
                            className="shv-resend-btn"
                          >
                            Resend OTP via WhatsApp
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || otpDigits.join('').trim().length !== 4}
                      className="shv-auth-submit-btn"
                    >
                      <span>{isSubmitting ? 'Verifying...' : 'Verify & Access Vault'}</span>
                      <ArrowRight size={15} />
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep('phone');
                          setAuthError(null);
                        }}
                        className="shv-forgot-link"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ArrowLeft size={13} />
                        <span>Back to mobile number</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Divider & Google Login Button */}
                <div className="shv-auth-divider">
                  <span>or continue with</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="shv-google-btn"
                  title="Sign in with Google"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12c0 2.03.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </>
            )}

            {/* ═════════════════════════════════════════════════════════════════
                FALLBACK: EMAIL & PASSWORD LOGIN OR REGISTER
                ═════════════════════════════════════════════════════════════════ */}
            {(isRegister || loginMethod === 'password') && (
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
                      <label htmlFor="auth-phone">Mobile Phone (WhatsApp Enabled)</label>
                      <div className="shv-input-wrapper">
                        <Phone size={16} className="shv-input-icon" />
                        <input
                          id="auth-phone"
                          type="tel"
                          placeholder="+91 99980 46559"
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

                {/* Checkboxes / Meta */}
                <div className="shv-auth-meta-row">
                  {!isRegister ? (
                    <button
                      type="button"
                      className="shv-forgot-link"
                      onClick={() => {
                        setLoginMethod('otp');
                        setOtpStep('phone');
                        setAuthError(null);
                      }}
                    >
                      ← Sign in with WhatsApp OTP instead
                    </button>
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
                  <span>{isRegister ? 'Create Atelier Account' : 'Sign In with Password'}</span>
                  <ArrowRight size={15} />
                </button>

                {/* Google Sign In option also on Register */}
                <div className="shv-auth-divider">
                  <span>or continue with</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="shv-google-btn"
                  title="Sign in with Google"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12c0 2.03.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>
            )}

            {/* Bottom Toggle Prompt */}
            <div className="shv-auth-switch-footer">
              {isRegister ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setLoginMethod('otp');
                      setOtpStep('phone');
                      setAuthError(null);
                    }}
                    className="shv-switch-action-btn"
                  >
                    Sign In with WhatsApp OTP
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
