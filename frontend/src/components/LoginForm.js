import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, tokenUtils } from '../utils/api';

/**
 * LoginForm Component
 * Handles user authentication and login functionality
 */
function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Handle form submission and login
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await api.login(formData);

      // Store authentication data
      tokenUtils.setTokens(data.token, data.refreshToken);
      tokenUtils.setUser(data.user);
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      // Handle validation errors
      if (err.data && err.data.errors && Array.isArray(err.data.errors)) {
        const errorMessages = err.data.errors.map(err => err.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(err.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Pattern */}
      <div className="background-pattern">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Main Content */}
      <div className="auth-content">
        {/* Logo/Brand Section */}
        <div className="brand-section">
          <div className="brand-icon">
            <span className="brand-text">T</span>
          </div>
          <h1 className="brand-title">TrackIt</h1>
          <p className="brand-subtitle">Your Financial Journey Starts Here</p>
        </div>

        {/* Login Form Card */}
        <div className="auth-form-card">
          <div className="form-header">
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Sign in to continue tracking your finances</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="form-control-modern"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control-modern"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="btn-modern btn-primary auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="forgot-password">
            <Link 
              to="/forgot-password" 
              className="forgot-link"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
            <div className="divider-line"></div>
          </div>

          {/* Register Link */}
          <div className="auth-link">
            <p className="link-text">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="link-action"
              >
                Create one here
              </Link>
            </p>
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

export default LoginForm;
