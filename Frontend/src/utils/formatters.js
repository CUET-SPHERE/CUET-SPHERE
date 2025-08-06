// Time formatting utilities
export function formatTimeAgo(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  if (diffInDays < 30) {
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }
  
  // For older dates, show the actual date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Avatar utilities
export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function getAvatarColor(name) {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];
  
  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charCodeSum % colors.length];
}

// Image utilities
export function isImageUrl(url) {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowercaseUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowercaseUrl.includes(ext)) || 
         lowercaseUrl.includes('placeholder') || 
         lowercaseUrl.includes('image');
}

export function isValidImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}