import React from 'react';
import PostFeed from '../components/PostFeed';
import { useTheme } from '../contexts/ThemeContext';

function FeedPage() {
  const { colors, isDark } = useTheme();

  // The main container's height is calculated to be the full viewport height minus the navbar's height (4rem or 64px).
  // This creates a dedicated scrollable area for the feed content, preventing the main page from scrolling.
  // The `no-scrollbar` class is used to hide the scrollbar while keeping the scroll functionality.
  return (
    <div
      className="flex justify-center"
      style={{ backgroundColor: isDark ? colors.background?.main || '#111827' : colors.background?.main || '#f9fafb' }}
    >
      <div className="w-full max-w-4xl h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
        <PostFeed />
      </div>
    </div>
  );
}

export default FeedPage;
