import React, { useState, useRef } from 'react';
import { Camera, Edit3, Lock, Unlock, Settings, Key, Mail, User, MapPin, Calendar, FileText, Users, Heart, Eye, EyeOff, Bookmark } from 'lucide-react';
import { getInitials, getAvatarColor, formatTimeAgo } from '../utils/formatters';
import { mockUser } from '../mock/mockUser';
import { mockPosts } from '../mock/mockPosts';
import PostCard from '../components/PostCard';

// Profile Avatar Component
function ProfileAvatar({ src, name, size = 'xl', editable = false, onEdit }) {
  const sizeClasses = {
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
    '2xl': 'w-40 h-40 text-5xl'
  };

  if (src) {
    return (
      <div className="relative">
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border-8 border-white dark:border-gray-800 shadow-lg`}
        />
        {editable && (
          <button
            onClick={onEdit}
            className="absolute bottom-2 right-2 p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Camera className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }

  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-bold shadow-lg border-8 border-white dark:border-gray-800`}>
        {initials}
      </div>
      {editable && (
        <button
          onClick={onEdit}
          className="absolute bottom-2 right-2 p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Camera className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// Edit Profile Modal
function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    bio: user.bio || '',
    hall: user.hall,
    interests: user.interests || [],
    profilePicture: user.profilePicture || '',
    backgroundImage: user.backgroundImage || '',
    isPublic: user.isPublic !== false // Default to public
  });

  const [newInterest, setNewInterest] = useState('');
  const [profilePreview, setProfilePreview] = useState(user.profilePicture || '');
  const [backgroundPreview, setBackgroundPreview] = useState(user.backgroundImage || '');
  const profileFileRef = useRef(null);
  const backgroundFileRef = useRef(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      profilePicture: profilePreview,
      backgroundImage: backgroundPreview
    });
    onClose();
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hall
                </label>
                <input
                  type="text"
                  value={formData.hall}
                  onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Tell others about yourself..."
              />
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                  />
                )}
                <div className="flex-1">
                  <input
                    ref={profileFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => profileFileRef.current.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choose Image
                  </button>
                  {profilePreview && (
                    <button
                      type="button"
                      onClick={() => setProfilePreview('')}
                      className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Background Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background Image
              </label>
              <div className="space-y-3">
                {backgroundPreview && (
                  <img
                    src={backgroundPreview}
                    alt="Background Preview"
                    className="w-full h-32 rounded-lg object-cover border-2 border-gray-300"
                  />
                )}
                <div>
                  <input
                    ref={backgroundFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => backgroundFileRef.current.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choose Background
                  </button>
                  {backgroundPreview && (
                    <button
                      type="button"
                      onClick={() => setBackgroundPreview('')}
                      className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interests
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add an interest..."
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-2"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Public Profile
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Allow others to view your profile and posts
                  </div>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Change Password Modal
function ChangePasswordModal({ isOpen, onClose }) {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Mock password change
    alert('Password changed successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const [user, setUser] = useState({
    ...mockUser,
    bio: 'Class Representative for CSE 22 batch. Passionate about software development and competitive programming. Love helping fellow students with their academic journey.',
    interests: ['Programming', 'Algorithms', 'Web Development', 'Teaching'],
    profilePicture: null,
    backgroundImage: 'https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isPublic: true,
    postsCount: 25,
    followersCount: 150,
    followingCount: 89
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  // Get user's posts
  const userPosts = mockPosts.filter(post => post.authorEmail === user.email);
  // Get user's saved posts
  const savedPosts = mockPosts.filter(post => post.bookmarked);

  const handleSaveProfile = (newData) => {
    setUser({ ...user, ...newData });
  };

  const handleProfilePictureEdit = () => {
    setShowEditModal(true);
  };

  const tabs = [
    { id: 'about', label: 'About', count: null, icon: User },
    { id: 'posts', label: 'Posts', count: userPosts.length, icon: FileText },
    { id: 'saved', label: 'Saved', count: savedPosts.length, icon: Bookmark },
    { id: 'settings', label: 'Settings', count: null, icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Full Width Cover Photo */}
      <div className="relative h-72 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        {user.backgroundImage ? (
          <img
            src={user.backgroundImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header Section */}
        <div className="relative">
          {/* Profile Info Card */}
          <div className="relative text-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 -mt-20">
              {/* Avatar */}
              <div className="flex justify-center -mt-24">
                <ProfileAvatar
                  src={user.profilePicture}
                  name={user.full_name}
                  size="2xl"
                  editable
                  onEdit={handleProfilePictureEdit}
                />
              </div>

              {/* User Details */}
              <div className="mt-4">
                <div className="flex items-center justify-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    {user.full_name}
                    {user.isPublic ? (
                      <Unlock className="h-5 w-5 text-green-500" title="Public Profile" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-500" title="Private Profile" />
                    )}
                  </h1>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    title="Edit Profile"
                  >
                    <Edit3 className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {user.student_id} • {user.department} Batch {user.batch}
                </p>
                {user.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== null && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 gap-8">
            {/* Main Content */}
            <div>
              {activeTab === 'posts' && (
                <div className="space-y-6">
                  {userPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
                      <p className="text-gray-500 dark:text-gray-400">Start sharing your thoughts with the community!</p>
                    </div>
                  ) : (
                    userPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="space-y-6">
                  {savedPosts.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Saved Posts</h3>
                      <p className="text-gray-500 dark:text-gray-400">You haven't saved any posts yet. Click the bookmark icon on a post to save it for later.</p>
                    </div>
                  ) : (
                    savedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{user.department} - Batch {user.batch}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{user.hall}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Joined {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </span>
                    </div>
                  </div>

                  {user.interests && user.interests.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content & Privacy</h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => setActiveTab('saved')}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Bookmark className="h-5 w-5 text-gray-500" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900 dark:text-white">View Saved Posts</div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Review posts you've bookmarked.</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                          {savedPosts.length}
                        </span>
                      </button>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Profile Visibility</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Control who can see your profile and posts
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.isPublic ? (
                            <Eye className="h-5 w-5 text-green-500" />
                          ) : (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Key className="h-5 w-5 text-gray-500" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900 dark:text-white">Change Password</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Update your account password</div>
                          </div>
                        </div>
                        <Edit3 className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={handleSaveProfile}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}

export default ProfilePage;
