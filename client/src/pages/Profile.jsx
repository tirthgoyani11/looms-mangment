import React, { useState, useEffect } from 'react';
import {  
  FiUser, FiMail, FiPhone, FiLock, FiSave, FiEdit2, FiShield, 
  FiCalendar, FiCheckCircle, FiDownload, FiRefreshCw
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/auth/update-profile', {
        name: formData.name,
        phone: formData.phone
      });

      updateUser(response.data.data);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportProfileData = () => {
    const profileData = {
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      role: user?.role,
      memberSince: user?.createdAt,
      accountStatus: user?.isActive ? 'Active' : 'Inactive',
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(profileData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile_${user?.name}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Profile data exported successfully!');
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Weak', color: 'bg-red-500' },
      { strength: 2, label: 'Fair', color: 'bg-orange-500' },
      { strength: 3, label: 'Good', color: 'bg-yellow-500' },
      { strength: 4, label: 'Strong', color: 'bg-green-500' },
      { strength: 5, label: 'Very Strong', color: 'bg-green-600' }
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-blue-100 text-lg">Manage your account settings and preferences</p>
          </div>
          <button
            onClick={exportProfileData}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 flex items-center gap-2 transition-all shadow-md font-semibold"
          >
            <FiDownload />
            Export Data
          </button>
        </div>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 h-32 relative">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-900 opacity-20"></div>
        </div>
        <div className="px-8 pb-8">
          <div className="flex items-end -mt-16 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <div className="ml-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <FiShield className="text-blue-600" />
                <span className="text-gray-600 font-medium">{user?.role}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <FiCalendar size={14} />
                <span>
                  Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details Form */}
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-gray-500" />
                    Full Name
                  </div>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                  }`}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FiMail className="text-gray-500" />
                    Email Address
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-gray-500" />
                    Phone Number
                  </div>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FiShield className="text-gray-500" />
                    Role
                  </div>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Role is assigned by administrator</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md font-semibold"
                >
                  <FiEdit2 />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-md font-semibold disabled:opacity-50"
                  >
                    <FiSave />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        role: user?.role || ''
                      });
                    }}
                    disabled={loading}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiLock className="text-blue-600" />
              Change Password
            </h3>
            <p className="text-gray-600 text-sm mt-1">Keep your account secure with a strong password</p>
          </div>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-5 py-2.5 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-sm"
            >
              Change Password
            </button>
          )}
        </div>

        {isChangingPassword && (
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password Strength:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.strength >= 4 ? 'text-green-600' : 
                        passwordStrength.strength >= 3 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
                {/* Match Indicator */}
                {passwordData.confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    {passwordData.newPassword === passwordData.confirmPassword ? (
                      <>
                        <FiCheckCircle className="text-green-600" />
                        <span className="text-xs text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="text-red-600" />
                        <span className="text-xs text-red-600">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md font-semibold disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                disabled={loading}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <FiUser className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Member Since</p>
              <p className="font-bold text-gray-900 text-lg">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-green-100 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <FiShield className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Account Status</p>
              <p className="font-bold text-green-600 text-lg flex items-center gap-2">
                {user?.isActive ? (
                  <>
                    <FiCheckCircle className="text-green-500" />
                    Active
                  </>
                ) : (
                  'Inactive'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
