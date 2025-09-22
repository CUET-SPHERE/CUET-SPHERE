import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Tag, Loader, RefreshCw } from 'lucide-react';
import PostCard from './PostCard';
import PostCreateModal from './PostCreateModal';
import PostSkeleton from './PostSkeleton';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { postService } from '../services/postService';
import { useDebounce } from '../hooks/useDebounce';
import { useFeedData } from '../hooks/useFeedData';

function PostFeed({ isManageMode = false }) {
  const [selectedTag, setSelectedTag] = useState('All');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300); // 300ms delay
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { incrementPostDeleteCount, user, isAuthenticated } = useUser();
  const { colors, buttonClasses } = useTheme();

  // Use the feed data hook with caching
  const {
    posts,
    currentPage,
    totalPages,
    hasMore,
    isInitialized,
    loading,
    loadingMore,
    error,
    loadInitialPosts,
    loadMorePosts,
    addPost,
    removePost,
    refresh,
    getStats,
    lastPostElementCallback,
  } = useFeedData();

  // Debug logging
  console.log('PostFeed - User:', user);
  console.log('PostFeed - IsAuthenticated:', isAuthenticated);
  console.log('PostFeed - Cache Stats:', getStats());

  useEffect(() => {
    // Only load if not initialized or posts are empty
    if (!isInitialized || posts.length === 0) {
      loadInitialPosts();
    }
  }, [isInitialized, posts.length, loadInitialPosts]);





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
  const filteredPosts = useMemo(() => {
    return posts.filter(
      (post) =>
        (selectedTag === 'All' || (post.tags && post.tags.includes(selectedTag))) &&
        (debouncedSearch === '' ||
          post.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          post.content?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          post.tags?.some(tag => tag?.toLowerCase().includes(debouncedSearch.toLowerCase())))
    );
  }, [posts, selectedTag, debouncedSearch]);  // Handle new post creation
  const handleCreatePost = async (newPost) => {
    try {
      const createdPost = await postService.createPost(newPost);
      // Add new post to cache and display
      addPost(createdPost);
    } catch (err) {
      // Re-throw the error so the modal can handle it
      throw err;
    }
  };

  // Handle post deletion from admin
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      try {
        await postService.deletePost(postId);
        removePost(postId);
        incrementPostDeleteCount();
      } catch (err) {
        console.error('Error deleting post:', err);
        // You might want to show an error toast or message here
      }
    }
  };

  // Refresh feed data
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refresh();
    } catch (err) {
      console.error('Error refreshing feed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-full">
      {/* Sticky Header */}
      <div className={`${colors?.surface || 'bg-white dark:bg-gray-800'} ${colors?.border || 'border-gray-200 dark:border-gray-700'} border-b shadow-sm ${!isManageMode ? 'sticky top-0 z-10' : ''} backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95`}>
        <div className="px-4 pt-4 pb-2">
          {/* Header Title and Create Button */}
          {!isManageMode && (
            <div className="flex items-center justify-between mb-4 gap-4">
              <h1 className={`text-2xl font-bold ${colors?.text || 'text-gray-900 dark:text-white'}`}>Post Feed</h1>
              <button
                className={`${buttonClasses?.primary || "bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"} flex items-center justify-center gap-2 px-8 py-3 whitespace-nowrap min-w-[160px] flex-shrink-0`}
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-5 w-5" />
                <span>Create Post</span>
              </button>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors?.textMuted || 'text-gray-400'}`} />
            <input
              type="text"
              className={`w-full pl-10 pr-4 py-2 ${colors?.border || 'border-gray-300 dark:border-gray-600'} border rounded-lg ${colors?.inputBackground || 'bg-white dark:bg-gray-700'} ${colors?.text || 'text-gray-900 dark:text-white'} ${colors?.placeholder || 'placeholder-gray-500 dark:placeholder-gray-400'} focus:ring-2 ${colors?.focusRing || 'focus:ring-blue-500'} focus:border-transparent`}
              placeholder="Search posts by title, content, or #tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tags Filter */}
        <div className={`px-4 pb-4 border-t ${colors?.borderLight || 'border-gray-100 dark:border-gray-700/50'}`}>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
            <Tag className={`h-4 w-4 ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} flex-shrink-0`} />
            <button
              className={`px-4 py-1.5 rounded-lg font-medium transition-all flex-shrink-0 ${selectedTag === 'All'
                ? colors?.tagSelected || 'bg-blue-600 text-white'
                : colors?.tagDefault || 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              onClick={() => setSelectedTag('All')}
            >
              All Posts
            </button>
            <div className={`h-6 w-px ${colors?.borderLight || 'bg-gray-200 dark:bg-gray-600'}`}></div>
            <button
              className={`px-4 py-1.5 rounded-lg font-medium transition-all flex-shrink-0 ${selectedTag === 'Trending'
                ? colors?.tagSelected || 'bg-blue-600 text-white'
                : colors?.tagDefault || 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              onClick={() => setSelectedTag('Trending')}
            >
              Trending Posts
            </button>
            {allTags.slice(0, 10).map((tag) => ( // Show top 10 tags
              <button
                key={tag}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all flex-shrink-0 ${selectedTag === tag
                  ? colors?.tagHighlighted || 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-300 dark:ring-blue-700'
                  : colors?.tagDefault || 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
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
            // Show skeleton loading for initial load
            Array.from({ length: 3 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))
          ) : error ? (
            <div className="text-center py-12">
              <div className={`${colors?.textMuted || 'text-red-500'} text-6xl mb-4`}>⚠️</div>
              <h3 className={`text-lg font-medium ${colors?.text || 'text-gray-900 dark:text-white'} mb-2`}>Error loading posts</h3>
              <p className={`${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} mb-4`}>{error}</p>
              <button
                onClick={handleRefresh}
                className={buttonClasses?.primary || "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"}
              >
                Try Again
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className={`${colors?.textMuted || 'text-gray-400 dark:text-gray-500'} text-6xl mb-4`}>📝</div>
              <h3 className={`text-lg font-medium ${colors?.text || 'text-gray-900 dark:text-white'} mb-2`}>No posts found</h3>
              <p className={colors?.textMuted || 'text-gray-500 dark:text-gray-400'}>
                {debouncedSearch ? 'Try adjusting your search terms' : 'No posts available for this tag.'}
              </p>
            </div>
          ) : (
            filteredPosts.map((post, index) => {
              // Add ref to the last post for infinite scroll
              const isLastPost = filteredPosts.length === index + 1;
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  isManageMode={isManageMode}
                  onDelete={handleDeletePost}
                  onSelectTag={setSelectedTag}
                  ref={isLastPost ? lastPostElementCallback : null}
                />
              );
            })
          )}

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="text-center py-6">
              <Loader className={`h-6 w-6 animate-spin mx-auto ${colors?.primary || 'text-blue-600'} mb-2`} />
              <p className={colors?.textMuted || 'text-gray-500 dark:text-gray-400'}>Loading more posts...</p>
            </div>
          )}

          {/* End of posts indicator */}
          {!hasMore && posts.length > 0 && !loading && (
            <div className="text-center py-6">
              <p className={colors?.textMuted || 'text-gray-500 dark:text-gray-400'}>
                You've reached the end! 🎉
              </p>
            </div>
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
