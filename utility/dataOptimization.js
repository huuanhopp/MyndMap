// dataOptimization.js - Utilities for optimizing data handling and memory usage
import AsyncStorage from '@react-native-async-storage/async-storage';

// LRU Cache for large data objects
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.accessOrder = [];
  }
  
  /**
   * Get a value from the cache
   * 
   * @param {string} key - The cache key
   * @returns {any|null} - The cached value or null if not found
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }
    
    // Move this key to the end of access order (most recently used)
    this.updateAccessOrder(key);
    
    return this.cache.get(key);
  }
  
  /**
   * Set a value in the cache
   * 
   * @param {string} key - The cache key 
   * @param {any} value - The value to cache
   */
  set(key, value) {
    // If already at max size and the key doesn't exist, evict LRU
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const lruKey = this.accessOrder[0];
      this.cache.delete(lruKey);
      this.accessOrder.shift();
    }
    
    // Add or update the item
    this.cache.set(key, value);
    this.updateAccessOrder(key);
  }
  
  /**
   * Update the access order for a key
   * 
   * @param {string} key - The cache key
   */
  updateAccessOrder(key) {
    // Remove key from its current position
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    
    // Add key to end of order
    this.accessOrder.push(key);
  }
  
  /**
   * Remove a value from the cache
   * 
   * @param {string} key - The cache key
   * @returns {boolean} - Whether the key was removed
   */
  delete(key) {
    if (!this.cache.has(key)) {
      return false;
    }
    
    // Remove from cache
    this.cache.delete(key);
    
    // Remove from access order
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    
    return true;
  }
  
  /**
   * Clear the cache
   */
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }
  
  /**
   * Get the size of the cache
   * 
   * @returns {number} - The number of items in the cache
   */
  get size() {
    return this.cache.size;
  }
  
  /**
   * Get all keys in the cache
   * 
   * @returns {Array<string>} - All cache keys
   */
  keys() {
    return [...this.cache.keys()];
  }
}

// Global cache instance
const dataCache = new LRUCache(50);

/**
 * Cache data with optional expiration
 * 
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} expirationMinutes - Cache expiration in minutes (0 = never expire)
 * @returns {Promise<boolean>} - Whether caching succeeded
 */
export const cacheData = async (key, data, expirationMinutes = 60) => {
  try {
    // Create cache object with expiration timestamp
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiration: expirationMinutes > 0 ? Date.now() + (expirationMinutes * 60 * 1000) : 0,
    };
    
    // Update memory cache
    dataCache.set(key, cacheItem);
    
    // Store in AsyncStorage
    await AsyncStorage.setItem(`data_cache_${key}`, JSON.stringify(cacheItem));
    
    return true;
  } catch (error) {
    console.error('Error caching data:', error);
    return false;
  }
};

/**
 * Get data from cache
 * 
 * @param {string} key - Cache key
 * @returns {Promise<object>} - Object with data and cache status
 */
export const getCachedData = async (key) => {
  try {
    // Check memory cache first
    const memoryCache = dataCache.get(key);
    
    if (memoryCache) {
      // Check expiration
      if (memoryCache.expiration > 0 && Date.now() > memoryCache.expiration) {
        // Expired cache
        dataCache.delete(key);
        await AsyncStorage.removeItem(`data_cache_${key}`);
        return { data: null, expired: true, cached: true };
      }
      
      return { 
        data: memoryCache.data, 
        cached: true, 
        timestamp: memoryCache.timestamp,
        source: 'memory',
      };
    }
    
    // Check persistent storage
    const storedCache = await AsyncStorage.getItem(`data_cache_${key}`);
    if (storedCache) {
      const cacheItem = JSON.parse(storedCache);
      
      // Check expiration
      if (cacheItem.expiration > 0 && Date.now() > cacheItem.expiration) {
        // Expired cache
        await AsyncStorage.removeItem(`data_cache_${key}`);
        return { data: null, expired: true, cached: true };
      }
      
      // Update memory cache with fetched data
      dataCache.set(key, cacheItem);
      
      return {
        data: cacheItem.data,
        cached: true,
        timestamp: cacheItem.timestamp,
        source: 'storage',
      };
    }
    
    // No cache found
    return { data: null, cached: false };
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return { data: null, cached: false, error };
  }
};

/**
 * Clear data cache
 * 
 * @param {string} key - Specific key to clear, or all if undefined
 * @returns {Promise<boolean>} - Whether clearing succeeded
 */
export const clearDataCache = async (key) => {
  try {
    if (key) {
      // Clear specific key
      dataCache.delete(key);
      await AsyncStorage.removeItem(`data_cache_${key}`);
    } else {
      // Clear all data cache
      dataCache.clear();
      
      // Get all keys and filter data cache keys
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(k => k.startsWith('data_cache_'));
      
      // Clear all cache keys
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing data cache:', error);
    return false;
  }
};

/**
 * Optimize a large dataset for FlatList rendering
 * 
 * @param {Array} data - The original data array
 * @param {object} options - Optimization options
 * @returns {object} - The optimized data and helpers
 */
export const optimizeListData = (data, options = {}) => {
  if (!data || !Array.isArray(data)) {
    return { data: [], idMap: new Map() };
  }
  
  const {
    idField = 'id', 
    limit = 0,
    pageSize = 20,
    essentialFields = [],
  } = options;
  
  // Create ID mapper for quick reference
  const idMap = new Map();
  
  // Create optimized data array
  let optimizedData = data;
  
  // Apply limit if specified
  if (limit > 0 && data.length > limit) {
    optimizedData = data.slice(0, limit);
  }
  
  // Create lightweight copies if essential fields specified
  if (essentialFields.length > 0) {
    optimizedData = optimizedData.map(item => {
      // Always include ID field
      const lightItem = { [idField]: item[idField] };
      
      // Add essential fields
      essentialFields.forEach(field => {
        if (field in item) {
          lightItem[field] = item[field];
        }
      });
      
      // Add original item to ID map for reference
      idMap.set(item[idField], item);
      
      return lightItem;
    });
  } else {
    // Add all items to ID map
    optimizedData.forEach(item => {
      idMap.set(item[idField], item);
    });
  }
  
  // Create paging functionality
  const totalPages = Math.ceil(optimizedData.length / pageSize);
  
  const getPage = (pageNumber) => {
    const start = (pageNumber - 1) * pageSize;
    return optimizedData.slice(start, start + pageSize);
  };
  
  return {
    data: optimizedData,
    idMap,
    pageSize,
    totalPages,
    getPage,
    getFullItem: (id) => idMap.get(id),
  };
};

/**
 * Create a windowed dataset for efficient rendering of large lists
 * 
 * @param {Array} data - The original data array
 * @param {number} windowSize - The window size (visible items)
 * @returns {Function} - A function that returns the windowed data
 */
export const createWindowedData = (data, windowSize = 20) => {
  // Enforce minimum window size
  const effectiveWindowSize = Math.max(10, windowSize);
  
  return (currentIndex, buffer = 10) => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    // Calculate the start and end indices with buffer
    const start = Math.max(0, currentIndex - buffer);
    const end = Math.min(data.length, currentIndex + effectiveWindowSize + buffer);
    
    return data.slice(start, end);
  };
};

/**
 * Batch multiple requests to minimize bridge traffic
 * 
 * @param {Array<Function>} operations - Array of functions to batch
 * @returns {Promise<Array>} - Results of all operations
 */
export const batchOperations = async (operations) => {
  if (!operations || !Array.isArray(operations)) {
    return [];
  }
  
  // Execute all operations in parallel
  return Promise.all(operations.map(op => 
    typeof op === 'function' ? op() : Promise.resolve(op)
  ));
};

/**
 * Create an optimized collection observer that minimizes updates
 * 
 * @param {Function} queryFn - Function that returns a Firestore query
 * @param {Function} onChange - Callback for data changes
 * @param {object} options - Observer options
 * @returns {Function} - Unsubscribe function
 */
export const createOptimizedObserver = (queryFn, onChange, options = {}) => {
  if (!queryFn || typeof queryFn !== 'function' || !onChange) {
    return () => {};
  }
  
  const {
    debounceMs = 250,
    cacheKey = null,
    enableCache = true,
    compareFunction = null,
  } = options;
  
  // Last data state for comparison
  let lastData = null;
  let debounceTimeout = null;
  let unsubscribe = null;
  
  // Setup observer
  try {
    const query = queryFn();
    
    // Check cache first if enabled
    if (enableCache && cacheKey) {
      getCachedData(cacheKey).then(({ data, cached }) => {
        if (cached && data) {
          // Use cached data for initial render
          onChange(data);
          lastData = data;
        }
      });
    }
    
    unsubscribe = query.onSnapshot(snapshot => {
      // Convert to array of document data with IDs
      const newData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Skip update if data hasn't changed
      if (compareFunction && lastData && compareFunction(lastData, newData)) {
        return;
      }
      
      // Standard equality check as fallback
      if (!compareFunction && 
          lastData && 
          JSON.stringify(lastData) === JSON.stringify(newData)) {
        return;
      }
      
      // Debounce updates to prevent rapid UI refreshes
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      debounceTimeout = setTimeout(() => {
        onChange(newData);
        lastData = newData;
        
        // Update cache if enabled
        if (enableCache && cacheKey) {
          cacheData(cacheKey, newData);
        }
      }, debounceMs);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error creating optimized observer:', error);
    return () => {};
  }
};