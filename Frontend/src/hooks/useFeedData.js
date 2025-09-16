import { useState, useEffect, useCallback, useRef } from 'react';
import { useFeedCache } from '../contexts/FeedCacheContext';

export const useFeedData = () => {
  const {
    posts: cachedPosts,
    currentPage: cachedCurrentPage,
    totalPages,
    hasMore: cachedHasMore,
    isInitialized,
    loading,
    loadingMore,
    error,
    getPosts,
    addPostToCache,
    removePostFromCache,
    updatePostInCache,
    refreshCache,
    getCacheStats,
  } = useFeedCache();

  const [displayPosts, setDisplayPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const lastPostElementRef = useRef();

  // Initialize display posts from cache
  useEffect(() => {
    if (isInitialized && cachedPosts.length > 0) {
      setDisplayPosts(cachedPosts);
      setCurrentPage(cachedCurrentPage);
      setHasMore(cachedHasMore);
    }
  }, [isInitialized, cachedPosts, cachedCurrentPage, cachedHasMore]);

  // Load initial posts
  const loadInitialPosts = useCallback(async (forceRefresh = false) => {
    try {
      const data = await getPosts(0, false, forceRefresh);

      if (!data.fromCache) {
        setDisplayPosts(data.content || []);
        setCurrentPage(0);
        setHasMore(!data.last && (data.content?.length > 0));
      }

      return data;
    } catch (err) {
      console.error('useFeedData: Error loading initial posts:', err);
      setDisplayPosts([]);
      throw err;
    }
  }, [getPosts]);

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    try {
      const nextPage = currentPage + 1;
      const data = await getPosts(nextPage, true);

      if (!data.fromCache) {
        setDisplayPosts(prevPosts => [...prevPosts, ...(data.content || [])]);
        setCurrentPage(nextPage);
        setHasMore(!data.last && (data.content?.length > 0));
      }

      return data;
    } catch (err) {
      console.error('useFeedData: Error loading more posts:', err);
      throw err;
    }
  }, [loading, loadingMore, hasMore, currentPage, getPosts]);

  // Intersection observer callback for infinite scroll
  const lastPostElementCallback = useCallback(node => {
    if (loading || loadingMore) return;
    if (lastPostElementRef.current) lastPostElementRef.current.disconnect();

    lastPostElementRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('useFeedData: Loading more posts via intersection observer...');
        loadMorePosts();
      }
    });

    if (node) lastPostElementRef.current.observe(node);
  }, [loading, loadingMore, hasMore, loadMorePosts]);

  // Add new post
  const addPost = useCallback((newPost) => {
    addPostToCache(newPost);
    setDisplayPosts(prevPosts => [newPost, ...prevPosts]);
  }, [addPostToCache]);

  // Remove post
  const removePost = useCallback((postId) => {
    removePostFromCache(postId);
    setDisplayPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, [removePostFromCache]);

  // Update post
  const updatePost = useCallback((updatedPost) => {
    updatePostInCache(updatedPost);
    setDisplayPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  }, [updatePostInCache]);

  // Refresh all data
  const refresh = useCallback(async () => {
    try {
      const data = await refreshCache();
      setDisplayPosts(data.content || []);
      setCurrentPage(0);
      setHasMore(!data.last && (data.content?.length > 0));
      return data;
    } catch (err) {
      console.error('useFeedData: Error refreshing data:', err);
      throw err;
    }
  }, [refreshCache]);

  // Get cache statistics
  const getStats = useCallback(() => {
    const cacheStats = getCacheStats();
    return {
      ...cacheStats,
      displayPostsCount: displayPosts.length,
      currentDisplayPage: currentPage,
      hasMoreToDisplay: hasMore,
    };
  }, [getCacheStats, displayPosts.length, currentPage, hasMore]);

  return {
    // Data
    posts: displayPosts,
    currentPage,
    totalPages,
    hasMore,
    isInitialized,

    // Loading states
    loading,
    loadingMore,
    error,

    // Methods
    loadInitialPosts,
    loadMorePosts,
    addPost,
    removePost,
    updatePost,
    refresh,
    getStats,
    lastPostElementCallback,
  };
};