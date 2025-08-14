import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

/**
 * RegisterForm Component
 * Handles user registration and account creation
 */
function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Handle form submission and user registration
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await api.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      toast.success('Registered successfully! Please login.');
      navigate('/');
    } catch (err) {
      // Handle validation errors
      if (err.data && err.data.errors && Array.isArray(err.data.errors)) {
        const errorMessages = err.data.errors.map(err => err.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(err.message || 'Registration failed.');
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
          <p className="brand-subtitle">Join the Financial Revolution</p>
        </div>

        {/* Register Form Card */}
        <div className="auth-form-card">
          <div className="form-header">
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Start your financial tracking journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className="form-control-modern"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Enter your full name"
              />
            </div>

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
                placeholder="Create a strong password"
              />
              <div className="password-strength">
                <div className="strength-item">
                  <div className={`strength-indicator ${formData.password.length >= 6 ? 'valid' : ''}`}></div>
                  <span>At least 6 characters</span>
                </div>
                <div className="strength-item">
                  <div className={`strength-indicator ${/[A-Z]/.test(formData.password) ? 'valid' : ''}`}></div>
                  <span>One uppercase letter</span>
                </div>
                <div className="strength-item">
                  <div className={`strength-indicator ${/[a-z]/.test(formData.password) ? 'valid' : ''}`}></div>
                  <span>One lowercase letter</span>
                </div>
                <div className="strength-item">
                  <div className={`strength-indicator ${/\d/.test(formData.password) ? 'valid' : ''}`}></div>
                  <span>One number</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control-modern"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Confirm your password"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="password-error">
                  Passwords do not match
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-modern btn-primary auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
            <div className="divider-line"></div>
          </div>

          {/* Login Link */}
          <div className="auth-link">
            <p className="link-text">
              Already have an account?{' '}
              <Link 
                to="/" 
                className="link-action"
              >
                Sign in here
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

export default RegisterForm;
