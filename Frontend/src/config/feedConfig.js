// Feed configuration options
export const FEED_CONFIG = {
   // Whether to preload comments with posts
   PRELOAD_COMMENTS: true,

   // Cache duration in milliseconds (5 minutes)
   CACHE_DURATION: 5 * 60 * 1000,

   // Maximum pages to cache
   MAX_CACHED_PAGES: 10,

   // Posts per page
   POSTS_PER_PAGE: 10,

   // Comment loading strategy
   COMMENT_STRATEGY: {
      PRELOAD: 'preload',     // Load comments with posts
      LAZY: 'lazy',           // Load comments on demand
      HYBRID: 'hybrid'        // Preload first few, lazy load rest
   }
};

// Current comment strategy
export const CURRENT_COMMENT_STRATEGY = FEED_CONFIG.COMMENT_STRATEGY.PRELOAD;