// appInitialization.js - Optimized for Expo SDK 52
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, InteractionManager } from 'react-native';
import { testFirestoreConnection } from '../firebase/init';

// Critical assets that should be loaded during app initialization
const criticalAssets = [
  require('../assets/splash.png'),
  require('../assets/favicon.png'),
  require('../assets/Main_Options.png'),
];

// SDK 52 compatible asset caching
const cacheAssets = async (assets) => {
  const promises = assets.map(module => {
    if (typeof module === 'string') {
      return Asset.fromURI(module).downloadAsync();
    } else {
      return Asset.loadAsync(module);
    }
  });
  
  return Promise.all(promises);
};

// Preload assets efficiently to avoid UI jank
export const preloadAssets = async () => {
  try {
    console.log('Preloading assets...');
    
    // Keep splash screen visible while we load assets
    await SplashScreen.preventAutoHideAsync().catch(() => {
      // Ignore errors, as the splash screen might already be hidden
      console.log('SplashScreen.preventAutoHideAsync() failed, continuing...');
    });
    
    // Use SDK 52 compatible caching method
    await cacheAssets(criticalAssets);
    
    console.log('Assets preloaded successfully');
    
    // Return success
    return { success: true };
  } catch (e) {
    console.warn('Error preloading assets:', e);
    return { success: false, error: e };
  }
};

// Setup notification handler with optimized configuration
export const setupNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: Platform.OS === 'ios', // Only use badges on iOS
        priority: Notifications.AndroidNotificationPriority.HIGH
      }),
    });

    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
};

// Setup app with optimized initialization flow
export const setupApp = async (navigationRef) => {
  try {
    console.log('Starting app setup...');
    
    // Initialize critical app features in parallel
    const setupPromises = [
      // Preload assets in the background
      preloadAssets(),
      
      // Setup notifications
      setupNotifications(),
      
      // Test Firestore connection
      testFirestoreConnection(),
      
      // Register optimized background tasks
      registerBackgroundTasks(),
    ];
    
    // Start all setup tasks in parallel
    const results = await Promise.allSettled(setupPromises);
    
    // Check if any critical setup failed
    const criticalFailure = results.some(
      (result, index) => index < 2 && result.status === 'rejected'
    );
    
    if (criticalFailure) {
      console.error('Critical setup task failed:', results);
    }
    
    // Add interaction-based cleanup when setup is completed
    InteractionManager.runAfterInteractions(() => {
      cleanupAfterInitialization();
    });
    
    console.log('App setup completed');
    
    return { success: true, results };
  } catch (error) {
    console.error('Error during app initialization:', error);
    return { success: false, error };
  }
};

// Explicitly hide splash screen - should be called after app is fully ready
export const hideSplashScreen = async () => {
  try {
    console.log('Hiding splash screen...');
    await SplashScreen.hideAsync();
    console.log('Splash screen hidden successfully');
    return true;
  } catch (error) {
    console.log('Error hiding splash screen:', error);
    return false;
  }
};

// Register background tasks with optimized intervals
const registerBackgroundTasks = async () => {
  if (!BackgroundFetch) return false;
  
  try {
    // Register background fetch with battery-friendly config
    await BackgroundFetch.registerTaskAsync('background-fetch-task', {
      minimumInterval: 900, // 15 minutes minimum to save battery
      stopOnTerminate: false,
      startOnBoot: true,
    });
    
    console.log('Background fetch registered successfully');
    return true;
  } catch (err) {
    console.log("Background fetch registration error:", err);
    return false;
  }
};

// Load cached data to improve startup performance
const loadCachedData = async () => {
  try {
    // Get cached tasks
    const cachedTasks = await AsyncStorage.getItem('cachedTasks');
    
    // Return cached data if available
    if (cachedTasks) {
      return { success: true, data: JSON.parse(cachedTasks) };
    }
    
    return { success: true, data: null };
  } catch (error) {
    console.error('Error loading cached data:', error);
    return { success: false, error };
  }
};

// Cleanup resources when app finishes initialization
export const cleanupApp = async () => {
  try {
    // Cancel all scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Unregister background tasks
    if (BackgroundFetch) {
      try {
        await BackgroundFetch.unregisterTaskAsync('background-fetch-task');
      } catch (err) {
        console.log("Background fetch unregister error:", err);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error during app cleanup:', error);
    return { success: false, error };
  }
};

// Memory cleanup after initialization
const cleanupAfterInitialization = () => {
  try {
    // Force GC if available
    if (global.gc) {
      global.gc();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error during post-initialization cleanup:', error);
    return { success: false, error };
  }
};