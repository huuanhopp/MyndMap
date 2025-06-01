// statusBarUtils.js
// Provides consistent StatusBar configuration across the app
import { StatusBar, Platform } from 'react-native';

/**
 * Sets the status bar appearance consistently based on light/dark mode
 * @param {string} mode - 'dark' for light text on dark background, 'light' for dark text on light background
 */
export const setAppStatusBar = (mode = 'dark') => {
  try {
    if (mode === 'dark') {
      // Dark mode (light text on dark background)
      if (Platform.OS === 'ios') {
        StatusBar.setBarStyle('light-content');
      } else {
        StatusBar.setBarStyle('light-content');
        StatusBar.setBackgroundColor('#1a1a1a');
      }
    } else {
      // Light mode (dark text on light background)
      if (Platform.OS === 'ios') {
        StatusBar.setBarStyle('dark-content');
      } else {
        StatusBar.setBarStyle('dark-content');
        StatusBar.setBackgroundColor('#f7e8d3');
      }
    }
  } catch (error) {
    console.error('Error setting status bar:', error);
  }
};

/**
 * Makes the Android status bar translucent
 * This is useful for full-screen activities to avoid layout shifts
 * @param {boolean} translucent - Whether to enable translucent mode
 */
export const setStatusBarTranslucent = (translucent = true) => {
  if (Platform.OS === 'android') {
    try {
      StatusBar.setTranslucent(translucent);
    } catch (error) {
      console.error('Error setting status bar translucency:', error);
    }
  }
};