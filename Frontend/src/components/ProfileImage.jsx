import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api';

const ProfileImage = ({ 
  userEmail, 
  userName, 
  size = 'md', 
  className = '',
  showOnlineStatus = false,
  isOnline = false 
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const fetchAttemptedRef = useRef(false);

  // Size configurations
  const sizeConfig = {
    xs: { width: 'w-6 h-6', text: 'text-xs' },
    sm: { width: 'w-8 h-8', text: 'text-sm' },
    md: { width: 'w-10 h-10', text: 'text-sm' },
    lg: { width: 'w-12 h-12', text: 'text-base' },
    xl: { width: 'w-16 h-16', text: 'text-lg' },
    '2xl': { width: 'w-20 h-20', text: 'text-xl' }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Generate a consistent color based on the user's name or email
  const getAvatarColor = (identifier) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Reset fetch state when userEmail changes
  useEffect(() => {
    fetchAttemptedRef.current = false;
    setImageUrl(null);
    setImageError(false);
    setLoading(true);
  }, [userEmail]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch profile image with caching and deduplication
  useEffect(() => {
    // Prevent multiple fetches for the same component
    if (!userEmail || fetchAttemptedRef.current) {
      if (!userEmail) setLoading(false);
      return;
    }

    fetchAttemptedRef.current = true;

    const fetchProfileImage = async () => {
      try {
        console.log('Fetching profile image for:', userEmail);
        
        // Try to get profile image with caching
        const imageUrl = await ApiService.getProfileImageUrl(userEmail);
        
        // Check if component is still mounted
        if (!mountedRef.current) return;
        
        if (imageUrl) {
          console.log('Profile image URL found:', imageUrl);
          setImageUrl(imageUrl);
        } else {
          console.log('No profile image found, using UI Avatars fallback');
          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=random&color=ffffff&size=200&rounded=true`;
          setImageUrl(avatarUrl);
        }
      } catch (error) {
        if (!mountedRef.current) return;
        console.error('Failed to fetch profile image:', error);
        // Even on error, try to generate an avatar
        if (userName) {
          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=ffffff&size=200&rounded=true`;
          setImageUrl(avatarUrl);
        } else {
          setImageError(true);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchProfileImage();
  }, [userEmail]); // Depend on userEmail to fetch when it changes

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(null);
  };

  if (loading) {
    return (
      <div className={`${config.width} ${className} rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse`} />
    );
  }

  const shouldShowImage = imageUrl && !imageError;
  const initials = getInitials(userName);
  const avatarColor = getAvatarColor(userEmail || userName || 'default');

  return (
    <div className={`relative ${config.width} ${className}`}>
      {shouldShowImage ? (
        <img
          src={imageUrl}
          alt={userName}
          className={`${config.width} rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm`}
          onError={handleImageError}
        />
      ) : (
        <div className={`${config.width} ${avatarColor} rounded-full flex items-center justify-center text-white font-semibold ${config.text} border-2 border-white dark:border-gray-700 shadow-sm`}>
          {initials}
        </div>
      )}
      
      {/* Online status indicator */}
      {showOnlineStatus && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-700 ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      )}
    </div>
  );
};

export default ProfileImage;