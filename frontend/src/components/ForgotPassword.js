import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

/**
 * ForgotPassword Component
 * Handles password reset functionality
 */
function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Handle password reset request submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('If an account with that email exists, a password reset link has been sent');
    } catch (err) {
      // Handle validation errors
      if (err.data && err.data.errors && Array.isArray(err.data.errors)) {
        const errorMessages = err.data.errors.map(err => err.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(err.message || 'Failed to send reset email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message after submission
  if (isSubmitted) {
    return (
      <div className="auth-container">
        {/* Success Content */}
        <div className="auth-content">
          {/* Logo/Brand Section */}
          <div className="brand-section">
            <div className="brand-icon">
              <span className="brand-text">T</span>
            </div>
            <h1 className="brand-title">TrackIt</h1>
            <p className="brand-subtitle">Password Reset Sent</p>
          </div>

          {/* Success Form Card */}
          <div className="auth-form-card">
            <div className="form-header">
              <div className="form-icon">
                <span className="icon-text">✓</span>
              </div>
              <h2 className="form-title">Check Your Email</h2>
              <p className="form-subtitle">
                We've sent a password reset link to{' '}
                <span className="font-semibold text-primary-600">{email}</span>
              </p>
            </div>

            <div className="auth-form">
              <p className="text-gray-600 mb-6 text-center">
                Please check your email and click the link to reset your password.
              </p>
              
              <Link 
                to="/" 
                className="btn-modern btn-primary auth-submit-btn"
              >
                Back to Login
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <p className="footer-text">
              Secure • Fast • Reliable
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {/* Main Content */}
      <div className="auth-content">
        {/* Logo/Brand Section */}
        <div className="brand-section">
          <div className="brand-icon">
            <span className="brand-text">T</span>
          </div>
          <h1 className="brand-title">TrackIt</h1>
          <p className="brand-subtitle">Reset Your Password</p>
        </div>

        {/* Forgot Password Form Card */}
        <div className="auth-form-card">
          <div className="form-header">
            <h2 className="form-title">Forgot Password?</h2>
            <p className="form-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                Email Address
              </label>
              <input
                type="email"
                className="form-control-modern"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={isLoading}
                placeholder="Enter your email address"
              />
            </div>
            
            <button 
              className="btn-modern btn-primary auth-submit-btn"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
            <div className="divider-line"></div>
          </div>

          {/* Back to Login Link */}
          <div className="auth-link">
            <Link 
              to="/" 
              className="link-action"
            >
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p className="footer-text">
            Secure • Fast • Reliable
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword; 