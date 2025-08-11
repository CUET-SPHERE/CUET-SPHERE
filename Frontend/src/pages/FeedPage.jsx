import React from 'react';
import PostFeed from '../components/PostFeed';

function FeedPage() {
  // The main container's height is calculated to be the full viewport height minus the navbar's height (4rem or 64px).
  // This creates a dedicated scrollable area for the feed content, preventing the main page from scrolling.
  // The `no-scrollbar` class is used to hide the scrollbar while keeping the scroll functionality.
  return (
    <div className="flex justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
        <PostFeed />
      </div>
    </div>
  );
}

export default FeedPage;
