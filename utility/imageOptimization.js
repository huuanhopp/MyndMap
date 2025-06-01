// imageOptimization.js - Utilities for optimized image loading and caching
import { Image } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

// In-memory LRU cache to avoid reloading images
const imageCache = new Map();
const MAX_CACHE_SIZE = 50; // Maximum number of cached images
const cacheOrder = []; // Track access order for LRU eviction

// Root directory for image caches
const IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory}optimized_images/`;

/**
 * Ensure the image cache directory exists
 * 
 * @returns {Promise<boolean>} - Whether the directory was created or already exists
 */
const ensureCacheDirectory = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, { intermediates: true });
    }
    return true;
  } catch (error) {
    console.error('Error creating cache directory:', error);
    return false;
  }
};

/**
 * Add an image to the in-memory cache
 * 
 * @param {string} key - The cache key
 * @param {any} value - The cached value
 */
const addToCache = (key, value) => {
  // If cache is full, remove least recently used item
  if (imageCache.size >= MAX_CACHE_SIZE && !imageCache.has(key)) {
    const oldest = cacheOrder.shift();
    imageCache.delete(oldest);
  }
  
  // Add or update item in cache
  imageCache.set(key, value);
  
  // Remove key from cache order if it exists
  const existingIndex = cacheOrder.indexOf(key);
  if (existingIndex !== -1) {
    cacheOrder.splice(existingIndex, 1);
  }
  
  // Add key to end of cache order (most recently used)
  cacheOrder.push(key);
};

/**
 * Retrieves an image from the in-memory cache
 * 
 * @param {string} key - The cache key
 * @returns {any|null} - The cached value or null if not found
 */
const getFromCache = (key) => {
  const value = imageCache.get(key);
  
  if (value) {
    // Move to end of cache order (most recently used)
    const existingIndex = cacheOrder.indexOf(key);
    if (existingIndex !== -1) {
      cacheOrder.splice(existingIndex, 1);
      cacheOrder.push(key);
    }
    
    return value;
  }
  
  return null;
};

/**
 * Generate a cache key for an image
 * 
 * @param {string|number} source - The image source
 * @param {object} options - Image options
 * @returns {string} - The cache key
 */
const generateCacheKey = (source, options = {}) => {
  if (typeof source === 'number') {
    // Resource ID for require('./image.png')
    return `resource_${source}`;
  }
  
  if (typeof source === 'string') {
    // URL with potential options
    const optionsKey = options ? 
      `_${Object.values(options).join('_')}` : '';
    return `url_${source}${optionsKey}`;
  }
  
  if (source && source.uri) {
    // URI object
    const optionsKey = options ? 
      `_${Object.values(options).join('_')}` : '';
    return `uri_${source.uri}${optionsKey}`;
  }
  
  // Fallback
  return `image_${Date.now()}`;
};

/**
 * Preload an image into memory
 * 
 * @param {string|number|object} source - The image source
 * @param {object} options - Image loading options
 * @returns {Promise<boolean>} - Whether preloading succeeded
 */
export const preloadImage = async (source, options = {}) => {
  try {
    const cacheKey = generateCacheKey(source, options);
    
    // Check if already in memory cache
    if (getFromCache(cacheKey)) {
      return true;
    }
    
    // Handle different source types
    if (typeof source === 'number') {
      // Local require'd image
      await Asset.fromModule(source).downloadAsync();
      addToCache(cacheKey, { source, isLoaded: true });
      return true;
    } else if (typeof source === 'string' || (source && source.uri)) {
      // Remote URL or URI object
      const uri = typeof source === 'string' ? source : source.uri;
      
      // Use Image.prefetch for remote images
      await Image.prefetch(uri);
      addToCache(cacheKey, { uri, isLoaded: true });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error preloading image:', error);
    return false;
  }
};

/**
 * Optimize an image by resizing and compressing it
 * 
 * @param {string} uri - The image URI
 * @param {object} options - Optimization options
 * @returns {Promise<string>} - The optimized image URI
 */
export const optimizeImage = async (uri, options = {}) => {
  try {
    // Default optimization options
    const {
      width,
      height,
      quality = 0.8,
      format = 'jpeg',
      resize = true,
    } = options;
    
    if (!uri) return null;
    
    // Create a cache key based on URI and options
    const cacheKey = `${uri}_${width || 'auto'}_${height || 'auto'}_${quality}`;
    const cacheFile = `${IMAGE_CACHE_DIR}${cacheKey.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
    
    // Check if optimized image exists in file cache
    const cacheInfo = await FileSystem.getInfoAsync(cacheFile);
    if (cacheInfo.exists) {
      return cacheFile;
    }
    
    // Ensure cache directory exists
    await ensureCacheDirectory();
    
    // Prepare manipulation actions
    const actions = [];
    
    // Add resize action if needed
    if (resize && (width || height)) {
      actions.push({
        resize: {
          width,
          height,
        },
      });
    }
    
    // Manipulate the image
    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: quality,
        format: ImageManipulator.SaveFormat[format.toUpperCase()],
      }
    );
    
    // Save to cache
    if (result.uri) {
      await FileSystem.copyAsync({
        from: result.uri,
        to: cacheFile,
      });
      
      return cacheFile;
    }
    
    return uri; // Return original if optimization failed
  } catch (error) {
    console.error('Error optimizing image:', error);
    return uri; // Return original on error
  }
};

/**
 * Load an image with memory-optimized caching
 * 
 * @param {string|object} source - The image source
 * @param {object} options - Loading options
 * @returns {Promise<object>} - The loaded image details
 */
export const loadOptimizedImage = async (source, options = {}) => {
  try {
    const cacheKey = generateCacheKey(source, options);
    
    // Check memory cache first
    const cachedImage = getFromCache(cacheKey);
    if (cachedImage) {
      return cachedImage;
    }
    
    // For remote images, preload and maybe optimize
    if (typeof source === 'string' || (source && source.uri)) {
      const uri = typeof source === 'string' ? source : source.uri;
      
      // Skip optimization for data URIs
      if (uri.startsWith('data:')) {
        await Image.prefetch(uri);
        const result = { uri, isLoaded: true };
        addToCache(cacheKey, result);
        return result;
      }
      
      // For remote HTTP images, optimize if requested
      if (uri.startsWith('http') && options.optimize) {
        // Preload original image
        await Image.prefetch(uri);
        
        // Optimize the image
        const optimizedUri = await optimizeImage(uri, options);
        const result = { 
          uri: optimizedUri, 
          originalUri: uri,
          isLoaded: true,
          width: options.width,
          height: options.height,
        };
        
        addToCache(cacheKey, result);
        return result;
      }
      
      // Standard preload for other URIs
      await Image.prefetch(uri);
      const result = { uri, isLoaded: true };
      addToCache(cacheKey, result);
      return result;
    }
    
    // For local require'd images
    if (typeof source === 'number') {
      const asset = Asset.fromModule(source);
      await asset.downloadAsync();
      
      const result = {
        source,
        uri: asset.localUri || asset.uri,
        width: asset.width,
        height: asset.height,
        isLoaded: true,
      };
      
      addToCache(cacheKey, result);
      return result;
    }
    
    // Default fallback
    return { source, isLoaded: false };
  } catch (error) {
    console.error('Error loading optimized image:', error);
    return { source, isLoaded: false, error };
  }
};

/**
 * Clear the image cache
 * 
 * @param {boolean} clearMemory - Whether to clear the memory cache
 * @param {boolean} clearDisk - Whether to clear the disk cache
 * @returns {Promise<boolean>} - Whether the operation succeeded
 */
export const clearImageCache = async (clearMemory = true, clearDisk = true) => {
  try {
    // Clear memory cache
    if (clearMemory) {
      imageCache.clear();
      cacheOrder.length = 0;
    }
    
    // Clear disk cache
    if (clearDisk) {
      const cacheExists = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
      if (cacheExists.exists) {
        await FileSystem.deleteAsync(IMAGE_CACHE_DIR, { idempotent: true });
        await ensureCacheDirectory();
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing image cache:', error);
    return false;
  }
};

/**
 * Get memory cache statistics
 * 
 * @returns {object} - Cache statistics
 */
export const getImageCacheStats = async () => {
  try {
    const diskCacheInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
    const diskCacheExists = diskCacheInfo.exists;
    
    let diskCacheSize = 0;
    let fileCount = 0;
    
    if (diskCacheExists) {
      // Get all files in cache directory
      const files = await FileSystem.readDirectoryAsync(IMAGE_CACHE_DIR);
      fileCount = files.length;
      
      // Calculate total size
      let totalSize = 0;
      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${IMAGE_CACHE_DIR}${file}`);
        if (fileInfo.exists && fileInfo.size) {
          totalSize += fileInfo.size;
        }
      }
      
      diskCacheSize = totalSize;
    }
    
    return {
      memoryCacheSize: imageCache.size,
      memoryCacheKeys: [...imageCache.keys()],
      diskCacheExists,
      diskCacheSize,
      fileCount,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      memoryCacheSize: imageCache.size,
      error: error.message,
    };
  }
};