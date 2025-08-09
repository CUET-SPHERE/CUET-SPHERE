import React from 'react';
import { X, Mail, MapPin, Calendar, Users, FileText, Heart, Badge, Lock } from 'lucide-react';
import { getInitials, getAvatarColor, formatTimeAgo } from '../utils/formatters';

// Avatar component (reusing from PostCard)
function Avatar({ src, name, size = 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  if (src) {
    return (
      <img 
        src={src} 
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-4 border-white shadow-lg`}
      />
    );
  }

  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 border-white`}>
      {initials}
    </div>
  );
}

function UserProfile({ user, isOpen, onClose }) {
  if (!isOpen || !user) return null;

  // Check if profile is public or if this is the user's own profile
  const isOwnProfile = user.email === 'rony@student.cuet.ac.bd'; // Mock current user check
  const canViewProfile = user.isPublic !== false || isOwnProfile;

  // If profile is private and not own profile, show restricted view
  if (!canViewProfile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Private Profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This user has set their profile to private. You can only see limited information.
            </p>
            <div className="text-left space-y-2 mb-6">
              <p className="text-sm"><strong>Name:</strong> {user.full_name}</p>
              <p className="text-sm"><strong>Department:</strong> {user.department} - Batch {user.batch}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getRoleColor = (role) => {
    if (role === 'CR') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  const getOnlineStatus = (isOnline) => {
    return isOnline ? 'text-green-500' : 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with cover area */}
        <div className="relative">
          {/* Cover Photo Placeholder */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-200 bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Profile Picture */}
          <div className="absolute -bottom-12 left-6">
            <Avatar src={user.profilePicture} name={user.full_name} size="xl" />
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-16 p-6">
          {/* Basic Info */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.full_name}</h1>
                <div className={`w-3 h-3 rounded-full ${getOnlineStatus(user.isOnline)}`}></div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-600 dark:text-gray-400">ID: {user.student_id}</span>
                <span className="text-gray-400">•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role === 'CR' ? 'Class Representative' : 'Student'}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
            </div>
          </div>

          {/* Contact & Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Badge className="h-4 w-4" />
                <span className="text-sm">{user.department} - Batch {user.batch}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{user.hall}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Joined {new Date(user.joinDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{user.postsCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{user.followersCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Heart className="h-4 w-4 text-red-500" />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{user.followingCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
              </div>
            </div>
          </div>

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Send Message
            </button>
            <button className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors">
              Follow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
