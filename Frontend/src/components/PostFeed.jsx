import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { mockPosts as initialMockPosts } from '../mock/mockPosts';
import PostCard from './PostCard';
import PostCreateModal from './PostCreateModal';
import { mockUser } from '../mock/mockUser';
import { useUser } from '../contexts/UserContext';

const categories = ['All', 'Help', 'Resource', 'Question', 'Announcement'];

function PostFeed({ isManageMode = false }) {
  const [posts, setPosts] = useState(initialMockPosts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { incrementPostDeleteCount } = useUser();

  // Filtered posts
  const filteredPosts = posts.filter(
    (post) =>
      (selectedCategory === 'All' || post.category === selectedCategory) &&
      (search === '' || post.title.toLowerCase().includes(search.toLowerCase()) || post.content.toLowerCase().includes(search.toLowerCase()))
  );

  // Handle new post creation
  const handleCreatePost = (newPost) => {
    setPosts([
      {
        id: posts.length + 1,
        author: mockUser.full_name,
        authorEmail: mockUser.email,
        studentId: mockUser.student_id,
        profilePicture: null,
        timestamp: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        commentsCount: 0,
        bookmarked: false,
        comments: [],
        image: null,
        ...newPost,
      },
      ...posts,
    ]);
  };

  // Handle post deletion from admin
  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      setPosts(posts.filter(p => p.id !== postId));
      incrementPostDeleteCount();
    }
  };

  return (
    <div className="min-h-full">
      {/* Conditionally Sticky Header */}
      <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm ${!isManageMode ? 'sticky top-16 z-10' : ''}`}>
        <div className="px-4 py-4">
          {/* Header Title and Create Button (hidden in manage mode) */}
          {!isManageMode && (
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post Feed</h1>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4" />
                Create Post
              </button>
            </div>
          )}

          {/* Categories and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="px-4 py-6">
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {search ? 'Try adjusting your search terms' : 'No posts available in this category.'}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                isManageMode={isManageMode}
                onDelete={handleDeletePost}
              />
            ))
          )}
        </div>
      </div>

      <PostCreateModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onCreate={handleCreatePost} 
      />
    </div>
  );
}

export default PostFeed;
