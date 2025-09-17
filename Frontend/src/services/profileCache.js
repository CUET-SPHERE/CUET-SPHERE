// Profile cache service to prevent repeated API calls
class ProfileCacheService {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.cacheExpiry = 15 * 60 * 1000; // 15 minutes
  }

  // Generate cache key
  getCacheKey(userEmail) {
    return `profile_${userEmail}`;
  }

  // Check if cache entry is valid
  isCacheValid(entry) {
    return entry && (Date.now() - entry.timestamp) < this.cacheExpiry;
  }

  // Get profile data from cache
  getFromCache(userEmail) {
    const key = this.getCacheKey(userEmail);
    const entry = this.cache.get(key);
    
    if (this.isCacheValid(entry)) {
      console.log('Profile cache HIT for:', userEmail);
      return entry.data;
    }
    
    console.log('Profile cache MISS for:', userEmail);
    return null;
  }

  // Store profile data in cache
  setCache(userEmail, data) {
    const key = this.getCacheKey(userEmail);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log('Profile cached for:', userEmail);
  }

  // Get or fetch profile data (with deduplication)
  async getOrFetchProfile(userEmail, fetchFunction) {
    // Check cache first
    const cachedData = this.getFromCache(userEmail);
    if (cachedData) {
      return cachedData;
    }

    // Check if already loading
    const key = this.getCacheKey(userEmail);
    if (this.loadingPromises.has(key)) {
      console.log('Profile already loading for:', userEmail);
      return this.loadingPromises.get(key);
    }

    // Start loading
    console.log('Starting profile fetch for:', userEmail);
    const loadingPromise = fetchFunction(userEmail)
      .then(data => {
        this.setCache(userEmail, data);
        this.loadingPromises.delete(key);
        return data;
      })
      .catch(error => {
        this.loadingPromises.delete(key);
        throw error;
      });

    this.loadingPromises.set(key, loadingPromise);
    return loadingPromise;
  }

  // Clear cache for a specific user
  clearUserCache(userEmail) {
    const key = this.getCacheKey(userEmail);
    this.cache.delete(key);
    this.loadingPromises.delete(key);
  }

  // Clear all cache
  clearAllCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      loading: this.loadingPromises.size
    };
  }
}

// Create singleton instance
const profileCache = new ProfileCacheService();

export default profileCache;