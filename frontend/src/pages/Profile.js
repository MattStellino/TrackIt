import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, tokenUtils } from '../utils/api';

/**
 * Profile Page Component
 * Manages user profile information and password changes
 */
function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  /**
   * Initialize component and check authentication
   */
  useEffect(() => {
    const token = tokenUtils.getToken();
    if (!token) {
      navigate('/');
      return;
    }
    fetchProfile();
  }, [navigate]);

  /**
   * Fetch user profile data
   */
  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfileData({
        name: data.user.name || '',
        email: data.user.email || ''
      });
    } catch (err) {
      if (err.response && err.response.status === 401) {
        tokenUtils.clearAuth();
        navigate('/');
        return;
      }
      toast.error('Failed to fetch profile');
    }
  };

  /**
   * Handle profile information update
   */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await api.updateProfile(profileData);
      toast.success('Profile updated successfully!');
      
      // Update stored user data
      if (data.user) {
        tokenUtils.setUser(data.user);
      }
    } catch (err) {
      // Handle validation errors
      if (err.data && err.data.errors && Array.isArray(err.data.errors)) {
        const errorMessages = err.data.errors.map(err => err.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(err.message || 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setIsPasswordLoading(true);

    try {
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      // Handle validation errors
      if (err.data && err.data.errors && Array.isArray(err.data.errors)) {
        const errorMessages = err.data.errors.map(err => err.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(err.message || 'Failed to change password');
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  /**
   * Handle user logout
   */
  const logout = () => {
    tokenUtils.clearAuth();
    navigate('/');
  };

  return (
    <div className="profile-container">
      <div className="profile-main">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your account information and security</p>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-container">
          <div className="tabs-wrapper">
            <button
              onClick={() => setActiveTab('profile')}
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Profile Info Tab */}
        {activeTab === 'profile' && (
          <div className="card-modern profile-form">
            <div className="form-header">
              <h2 className="form-title">Personal Information</h2>
              <p className="form-subtitle">Update your name and email address</p>
            </div>

            <form onSubmit={handleProfileUpdate} className="profile-form-content">
              <div className="form-group">
                <label className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-control-modern"
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
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="form-control-modern"
                  required
                  disabled={isLoading}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-modern btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loading-content">
                      <div className="loading-spinner"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="card-modern profile-form">
            <div className="form-header">
              <h2 className="form-title">Change Password</h2>
              <p className="form-subtitle">Update your password to keep your account secure</p>
            </div>

            <form onSubmit={handlePasswordChange} className="profile-form-content">
              <div className="form-group">
                <label className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="form-control-modern"
                  required
                  disabled={isPasswordLoading}
                  placeholder="Enter your current password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="form-control-modern"
                  required
                  disabled={isPasswordLoading}
                  placeholder="Enter your new password"
                />
                <div className="form-hint">
                  Password must be at least 6 characters long
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="form-control-modern"
                  required
                  disabled={isPasswordLoading}
                  placeholder="Confirm your new password"
                />
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <div className="form-error">
                    Passwords do not match
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-modern btn-primary"
                  disabled={isPasswordLoading}
                >
                  {isPasswordLoading ? (
                    <div className="loading-content">
                      <div className="loading-spinner"></div>
                      Changing Password...
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Actions */}
        <div className="profile-actions">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-modern btn-outline"
          >
            Back to Dashboard
          </button>
          
          <button
            onClick={logout}
            className="btn-modern btn-danger"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile; 