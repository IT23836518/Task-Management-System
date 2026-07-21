import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      errors.email = 'Email address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background blobs for premium glassmorphic depth */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      <div className="login-card">
        {/* Brand/Logo Header */}
        <div className="login-header">
          <div className="brand-logo-container">
            {/* Hexagon bee emblem */}
            <svg viewBox="0 0 100 100" className="brand-logo-svg">
              <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" fill="#FFB300" opacity="0.1" stroke="#FFB300" strokeWidth="2" />
              <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="none" stroke="#FFC107" strokeWidth="3" />
              <path d="M40,45 Q45,35 50,45 Q55,35 60,45 Q50,60 40,45 Z" fill="#FFC107" />
              <line x1="50" y1="45" x2="50" y2="70" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
              <circle cx="45" cy="40" r="3" fill="#1E293B" />
              <circle cx="55" cy="40" r="3" fill="#1E293B" />
            </svg>
          </div>
          <h2>Koncepthive Tasks</h2>
          <p>Sign in to manage your daily workspace</p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="error-banner">
            <ShieldAlert size={18} className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Input Group */}
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className={`input-wrapper ${validationErrors.email ? 'input-error' : ''}`}>
              <Mail size={18} className="field-icon" />
              <input
                id="email"
                type="email"
                placeholder="admin@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {validationErrors.email && (
              <span className="validation-error-msg">{validationErrors.email}</span>
            )}
          </div>

          {/* Password Input Group */}
          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
            </div>
            <div className={`input-wrapper ${validationErrors.password ? 'input-error' : ''}`}>
              <Lock size={18} className="field-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validationErrors.password && (
              <span className="validation-error-msg">{validationErrors.password}</span>
            )}
          </div>

          {/* Helper credentials note */}
          <div className="credentials-tip">
            <span><strong>Tip:</strong> Email: <code>admin@test.com</code> | Password: <code>123456</code></span>
          </div>

          {/* Submit Button */}
          <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Signing you in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
