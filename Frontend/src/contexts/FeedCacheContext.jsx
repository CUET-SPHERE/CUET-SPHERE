import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { postService } from '../services/postService';

const FeedCacheContext = createContext();

export const useFeedCache = () => {
  const context = useContext(FeedCacheContext);
  if (!context) {
    throw new Error('useFeedCache must be used within a FeedCacheProvider');
  }
  return context;
};

export const FeedCacheProvider = ({ children }) => {
  const [cache, setCache] = useState({
    posts: [],
    currentPage: 0,
    totalPages: 0,
    hasMore: true,
    lastFetchTime: null,
    isInitialized: false,
    searchCache: new Map(), // Cache for search results
    tagCache: new Map(), // Cache for tag filters
  });

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Cache configuration
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const MAX_CACHED_PAGES = 10; // Maximum pages to keep in memory

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    if (!cache.lastFetchTime || !cache.isInitialized) return false;
    const now = Date.now();
    return (now - cache.lastFetchTime) < CACHE_DURATION;
  }, [cache.lastFetchTime, cache.isInitialized]);

  // Fetch posts from API
  const fetchPostsFromAPI = useCallback(async (page = 0, append = false) => {
    try {
      if (page === 0) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      console.log(`FeedCache: Fetching page ${page} from API...`);
      const data = await postService.getAllPosts(page, 10);
      console.log('FeedCache: Posts received from API:', data);

      const newPosts = data.content || [];
      const now = Date.now();

      setCache(prevCache => {
        let updatedPosts;
        
        if (append) {
          // Create a Set of existing post IDs to avoid duplicates
          const existingIds = new Set(prevCache.posts.map(post => post.id));
          const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
          updatedPosts = [...prevCache.posts, ...uniqueNewPosts];
        } else {
          updatedPosts = newPosts;
        }

        // Limit cached posts to prevent memory issues
        const maxPosts = MAX_CACHED_PAGES * 10;
        const trimmedPosts = updatedPosts.slice(0, maxPosts);

        return {
          ...prevCache,
          posts: trimmedPosts,
          currentPage: page,
          totalPages: data.totalPages || 0,
          hasMore: !data.last && newPosts.length > 0,
          lastFetchTime: now,
          isInitialized: true,
        };
      });

      return { content: newPosts, ...data };
    } catch (err) {
      console.error('FeedCache: Error fetching posts:', err);
      setError(err.message || 'Failed to fetch posts');
      throw err;
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Get posts (from cache or API)
  const getPosts = useCallback(async (page = 0, append = false, forceRefresh = false) => {
    // If requesting page 0 and cache is valid and not forcing refresh, return cached data
    if (page === 0 && !append && isCacheValid() && !forceRefresh && cache.posts.length > 0) {
      console.log('FeedCache: Returning cached posts');
      return {
        content: cache.posts,
        totalPages: cache.totalPages,
        last: !cache.hasMore,
        fromCache: true
      };
    }

    // If requesting a page we already have in cache
    const startIndex = page * 10;
    const endIndex = startIndex + 10;
    const hasRequestedPage = cache.posts.length > startIndex;

    if (hasRequestedPage && !forceRefresh && isCacheValid()) {
      console.log(`FeedCache: Returning cached page ${page}`);
      const cachedPagePosts = cache.posts.slice(startIndex, endIndex);
      return {
        content: cachedPagePosts,
        totalPages: cache.totalPages,
        last: !cache.hasMore || endIndex >= cache.posts.length,
        fromCache: true
      };
    }

    // Fetch from API
    return await fetchPostsFromAPI(page, append);
  }, [cache, isCacheValid, fetchPostsFromAPI]);

  // Add new post to cache
  const addPostToCache = useCallback((newPost) => {
    setCache(prevCache => {
      // Check if post already exists to avoid duplicates
      const existingPostIndex = prevCache.posts.findIndex(post => post.id === newPost.id);
      
      let updatedPosts;
      if (existingPostIndex >= 0) {
        // Update existing post
        updatedPosts = prevCache.posts.map((post, index) =>
          index === existingPostIndex ? newPost : post
        );
      } else {
        // Add new post to the beginning
        updatedPosts = [newPost, ...prevCache.posts];
      }
      
      return {
        ...prevCache,
        posts: updatedPosts,
        lastFetchTime: Date.now(), // Update cache time
      };
    });
  }, []);

  // Remove post from cache
  const removePostFromCache = useCallback((postId) => {
    setCache(prevCache => ({
      ...prevCache,
      posts: prevCache.posts.filter(post => post.id !== postId),
      lastFetchTime: Date.now(), // Update cache time
    }));
  }, []);

  // Update post in cache
  const updatePostInCache = useCallback((updatedPost) => {
    setCache(prevCache => ({
      ...prevCache,
      posts: prevCache.posts.map(post =>
        post.id === updatedPost.id ? updatedPost : post
      ),
      lastFetchTime: Date.now(), // Update cache time
    }));
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache({
      posts: [],
      currentPage: 0,
      totalPages: 0,
      hasMore: true,
      lastFetchTime: null,
      isInitialized: false,
      searchCache: new Map(),
      tagCache: new Map(),
    });
    setError(null);
  }, []);

  // Refresh cache
  const refreshCache = useCallback(async () => {
    console.log('FeedCache: Refreshing cache...');
    clearCache();
    return await fetchPostsFromAPI(0, false);
  }, [clearCache, fetchPostsFromAPI]);

  // Get cached search results
  const getCachedSearch = useCallback((searchTerm) => {
    return cache.searchCache.get(searchTerm);
  }, [cache.searchCache]);

  // Cache search results
  const cacheSearchResults = useCallback((searchTerm, results) => {
    setCache(prevCache => {
      const newSearchCache = new Map(prevCache.searchCache);
      newSearchCache.set(searchTerm, {
        results,
        timestamp: Date.now()
      });

      // Limit search cache size
      if (newSearchCache.size > 50) {
        const firstKey = newSearchCache.keys().next().value;
        newSearchCache.delete(firstKey);
      }

      return {
        ...prevCache,
        searchCache: newSearchCache
      };
    });
  }, []);

  // Get cache stats for debugging
  const getCacheStats = useCallback(() => {
    return {
      postsCount: cache.posts.length,
      currentPage: cache.currentPage,
      totalPages: cache.totalPages,
      hasMore: cache.hasMore,
      isValid: isCacheValid(),
      lastFetchTime: cache.lastFetchTime,
      isInitialized: cache.isInitialized,
      searchCacheSize: cache.searchCache.size,
      tagCacheSize: cache.tagCache.size,
    };
  }, [cache, isCacheValid]);

  const value = {
    // Data
    posts: cache.posts,
    currentPage: cache.currentPage,
    totalPages: cache.totalPages,
    hasMore: cache.hasMore,
    isInitialized: cache.isInitialized,

    // Loading states
    loading,
    loadingMore,
    error,

    // Methods
    getPosts,
    addPostToCache,
    removePostFromCache,
    updatePostInCache,
    clearCache,
    refreshCache,
    getCachedSearch,
    cacheSearchResults,
    getCacheStats,
    isCacheValid,
  };

  return (
    <FeedCacheContext.Provider value={value}>
      {children}
    </FeedCacheContext.Provider>
  );
};