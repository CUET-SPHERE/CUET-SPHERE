import React from 'react';
import PostFeed from '../components/PostFeed';

function FeedPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8">
      <div className="w-full max-w-3xl">
        <PostFeed />
      </div>
    </div>
  );
}

export default FeedPage; 