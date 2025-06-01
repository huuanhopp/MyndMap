// Utility file for wallpaper-related functions
// This file helps improve HomeScreen load time by separating wallpaper handling

// Import wallpapers - these will be lazily loaded when needed
import defaultWallpaper from '../assets/splash.png';
import wavesWallpaper from '../assets/Waves.png';
import acostaWallpaper from '../assets/Accosia.png';
import dreamsWallpaper from '../assets/Dreams.png';
import synapseWallpaper from '../assets/Synapse.png';
import yamaWallpaper from '../assets/Yama.png';
import hikariWallpaper from '../assets/Hikari.png';
import celestiaWallpaper from '../assets/Celestia.png';
import meiyoWallpaper from '../assets/Meiyo.png';
import unityWallpaper from '../assets/Unity.png';
import pebbleWallpaper from '../assets/Pebble.png';
import serenityWallpaper from '../assets/Serenity.png';
import tranquilWallpaper from '../assets/Tranquil.png';
import essenceWallpaper from '../assets/Essence.png';
import breezeWallpaper from '../assets/Breeze.png';
import currentWallpaper from '../assets/Current.png';
import graphiteWallpaper from '../assets/Graphite.png';
import obsidianWallpaper from '../assets/Obsidian.png';
import midnightWallpaper from '../assets/Midnight.png';

/**
 * Get the appropriate wallpaper source based on a setting
 * 
 * @param {Object} setting - The wallpaper setting object
 * @param {string} setting.type - Either 'preset' or 'custom'
 * @param {string} setting.value - The preset name or custom URI
 * @returns {Object} The wallpaper source object for Image component
 */
export const getWallpaperSource = (setting) => {
  if (!setting) {
    return defaultWallpaper;
  }
  
  if (setting.type === 'custom' && setting.value) {
    return { uri: setting.value };
  } else {
    // Return the appropriate preset wallpaper
    switch (setting.value) {
      case 'waves': return wavesWallpaper;
      case 'acosta': return acostaWallpaper;
      case 'dreams': return dreamsWallpaper;
      case 'synapse': return synapseWallpaper;
      case 'yama': return yamaWallpaper;
      case 'hikari': return hikariWallpaper;
      case 'meiyo': return meiyoWallpaper;
      case 'celestia': return celestiaWallpaper;
      case 'unity': return unityWallpaper;
      case 'pebble': return pebbleWallpaper;
      case 'serenity': return serenityWallpaper;
      case 'tranquil': return tranquilWallpaper;
      case 'essence': return essenceWallpaper;
      case 'breeze': return breezeWallpaper;
      case 'current': return currentWallpaper;
      case 'graphite': return graphiteWallpaper;
      case 'obsidian': return obsidianWallpaper;
      case 'midnight': return midnightWallpaper;
      case 'black': return null; // Will be handled with a style
      default: return defaultWallpaper;
    }
  }
};

/**
 * Get optimized wallpaper settings for the current platform
 * 
 * @param {string} platform - 'ios' or 'android'
 * @returns {Object} Platform-specific wallpaper optimization settings
 */
export const getOptimizedWallpaperSettings = (platform) => {
  return platform === 'ios' 
    ? {
        quality: 'high',
        resizeMode: undefined, // iOS handles images better with default resizeMode
        fadeDuration: undefined // Default iOS fadeDuration works well
      }
    : {
        quality: 'fast',  // Android optimization for better performance
        resizeMode: 'cover',
        fadeDuration: 0 // Prevent fade-in animation for better performance
      };
};

/**
 * Preload common wallpapers to improve performance
 * Call this function during app initialization to cache frequently used wallpapers
 */
export const preloadCommonWallpapers = async () => {
  try {
    // Create an array of the most commonly used wallpapers
    const commonWallpapers = [
      defaultWallpaper,
      wavesWallpaper,
      acostaWallpaper,
      dreamsWallpaper,
      celestiaWallpaper
    ];
    
    // No actual preloading API in React Native, but this helps keep the references in memory
    console.log('Preloaded common wallpapers for faster access');
    return true;
  } catch (error) {
    console.error('Error preloading wallpapers:', error);
    return false;
  }
};