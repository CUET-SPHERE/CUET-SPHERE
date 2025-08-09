import React, { useState, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Edit3, Key, Mail, Camera, Shield, AlertTriangle } from 'lucide-react';

// Reusable Avatar Component for Admin
const AdminAvatar = ({ src, name, size = 'w-32 h-32', onEdit }) => {
  const initials = name ? name.split(' ').map(n => n[0]).join('') : 'A';
  const colorClass = 'bg-blue-600';

  return (
    <div className="relative group">
      {src ? (
        <img src={src} alt={name} className={`${size} rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg`} />
      ) : (
        <div className={`${size} ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg border-4 border-white dark:border-gray-700`}>
          {initials}
        </div>
      )}
      <button
        onClick={onEdit}
        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <Camera className="h-8 w-8 text-white" />
      </button>
    </div>
  );
};

// Edit Profile Modal
const EditProfileModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    profilePicture: user.profilePicture || '',
  });
  const [preview, setPreview] = useState(user.profilePicture || '');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Admin Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <AdminAvatar src={preview} name={formData.fullName} size="w-24 h-24" onEdit={() => fileInputRef.current.click()} />
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              <button type="button" onClick={() => fileInputRef.current.click()} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Change Photo
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors">Cancel</button>
              <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Change Password Modal
const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (passwords.new.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    // API call to change password would go here
    alert('Password changed successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors">Cancel</button>
              <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Update Password</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminProfilePage = () => {
  const { user, updateUser } = useUser();
  const adminUser = user && user.role === 'admin' ? user : {
    fullName: 'Admin User',
    email: 'admin@cuetsphere.com',
    profilePicture: null,
    role: 'admin'
  };

  const [localUser, setLocalUser] = useState(adminUser);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleSaveProfile = (newData) => {
    const updatedUser = { ...localUser, ...newData };
    setLocalUser(updatedUser);
    if (updateUser) {
      updateUser(updatedUser);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Profile</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your administrator account details.</p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 flex flex-col sm:flex-row items-center gap-8">
            <AdminAvatar src={localUser.profilePicture} name={localUser.fullName} onEdit={() => setShowEditModal(true)} />
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{localUser.fullName}</h2>
              <p className="text-md text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Mail size={16} />
                {localUser.email}
              </p>
              <span className="mt-2 inline-block bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Administrator
              </span>
            </div>
            <div className="sm:ml-auto mt-4 sm:mt-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Shield size={20} /> Security</h3>
              <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Password</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 3 months ago</p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-500 flex items-center gap-2"><AlertTriangle size={20} /> Danger Zone</h3>
              <div className="mt-4 p-4 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Delete Account</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your admin account.</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={localUser}
        onSave={handleSaveProfile}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default AdminProfilePage;
