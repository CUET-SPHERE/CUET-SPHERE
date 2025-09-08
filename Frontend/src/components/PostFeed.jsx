import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Tag, Loader } from 'lucide-react';
import PostCard from './PostCard';
import PostCreateModal from './PostCreateModal';
import { useUser } from '../contexts/UserContext';
import { postService } from '../services/postService';

function PostFeed({ isManageMode = false }) {
  const [posts, setPosts] = useState([]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { incrementPostDeleteCount } = useUser();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postService.getAllPosts();
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags and their counts
  const allTags = useMemo(() => {
    const tagCounts = posts.reduce((acc, post) => {
      post.tags?.forEach(tag => {
        if (tag) {
          acc[tag] = (acc[tag] || 0) + 1;
        }
      });
      return acc;
    }, {});
    // Sort by count descending, then alphabetically
    return Object.entries(tagCounts)
      .sort(([tagA, countA], [tagB, countB]) => {
        if (countB !== countA) {
          return countB - countA;
        }
        return tagA.localeCompare(tagB);
      })
      .map(([tag]) => tag);
  }, [posts]);

  // Filtered posts based on selected tag and search term
  const filteredPosts = posts.filter(
    (post) =>
      (selectedTag === 'All' || (post.tags && post.tags.includes(selectedTag))) &&
        (search === '' ||
        post.title?.toLowerCase().includes(search.toLowerCase()) ||
        post.content?.toLowerCase().includes(search.toLowerCase()) ||
        post.tags?.some(tag => tag?.toLowerCase().includes(search.toLowerCase())))
  );  // Handle new post creation
  const handleCreatePost = async (newPost) => {
    try {
      console.log('PostFeed: Creating post with data:', newPost);
      const createdPost = await postService.createPost(newPost);
      console.log('PostFeed: Post created successfully:', createdPost);
      setPosts([createdPost, ...posts]);
    } catch (err) {
      console.error('PostFeed: Error creating post:', err);
      // Re-throw the error so the modal can handle it
      throw err;
    }
  };

  // Handle post deletion from admin
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      try {
        await postService.deletePost(postId);
        setPosts(posts.filter(p => p.id !== postId));
        incrementPostDeleteCount();
      } catch (err) {
        console.error('Error deleting post:', err);
        // You might want to show an error toast or message here
      }
    }
  };

  return (
    <div className="min-h-full">
      {/* Sticky Header */}
      <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm ${!isManageMode ? 'sticky top-0 z-10' : ''}`}>
        <div className="px-4 pt-4 pb-2">
          {/* Header Title and Create Button */}
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

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search posts by title, content, or #tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tags Filter */}
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
            <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <button
              className={`px-4 py-1.5 rounded-lg font-medium transition-all flex-shrink-0 ${selectedTag === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              onClick={() => setSelectedTag('All')}
            >
              All Posts
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-600"></div>
            <button
              className={`px-4 py-1.5 rounded-lg font-medium transition-all flex-shrink-0 ${selectedTag === 'Trending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              onClick={() => setSelectedTag('Trending')}
            >
              Trending Posts
            </button>
            {allTags.slice(0, 10).map((tag) => ( // Show top 10 tags
              <button
                key={tag}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all flex-shrink-0 ${selectedTag === tag
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-300 dark:ring-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                onClick={() => setSelectedTag(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="px-4 py-6">
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading posts</h3>
              <p className="text-gray-500 dark:text-gray-400">{error}</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {search ? 'Try adjusting your search terms' : 'No posts available for this tag.'}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isManageMode={isManageMode}
                onDelete={handleDeletePost}
                onSelectTag={setSelectedTag}
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
