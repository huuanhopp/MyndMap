// firebase-services.js - Consolidated Firebase services for the application
// Using Firebase v9+ Web SDK (compatible with Expo)
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as AppleAuthentication from 'expo-apple-authentication';

// Import Firebase v9+ web SDK modules
import { auth, db } from '../firebase/config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  OAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  getIdToken,
  onAuthStateChanged
} from 'firebase/auth';

// Use serverTimestamp for backward compatibility
const FieldValue = { serverTimestamp };

// ================ Authentication Services ================

/**
 * Handles authentication errors and returns user-friendly error messages
 */
const handleAuthError = (error) => {
  console.error('Authentication error:', error.code, error.message);
  
  let errorCode = 'auth/unknown';
  let errorMessage = 'An unknown error occurred. Please try again.';
  
  if (error.code) {
    errorCode = error.code;
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      default:
        errorMessage = error.message || 'An unknown error occurred.';
    }
  }
  
  return { code: errorCode, message: errorMessage };
};

/**
 * Creates a new user account with email and password
 */
const signUpWithEmail = async (email, password, userData = {}) => {
  try {
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user data in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email,
      createdAt: serverTimestamp(),
      ...userData
    });
    
    // Store auth token for persistence
    const token = await getIdToken(user);
    await AsyncStorage.setItem('userToken', token);
    
    return user;
  } catch (error) {
    const handledError = handleAuthError(error);
    throw handledError;
  }
};

/**
 * Signs in a user with email and password
 */
const signInWithEmail = async (email, password) => {
  try {
    console.log('Attempting sign in with email:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Sign in successful, user ID:', user.uid);
    
    // Store auth token for persistence
    const token = await getIdToken(user);
    await AsyncStorage.setItem('userToken', token);
    
    // Check if we need to create/update the user document in Firestore
    try {
      console.log('Checking for user document in Firestore');
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log('No user document found, creating one');
        // Create a basic user document if it doesn't exist
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          role: 'user', // Explicitly set role to regular user, not admin
          completedOnboarding: false
        });
      } else {
        console.log('User document exists, updating last login');
        // Update last login time
        await updateDoc(userRef, {
          lastLogin: serverTimestamp()
        });
      }
    } catch (firestoreError) {
      // Log but don't fail authentication if Firestore operations fail
      console.error('Error with Firestore operations:', firestoreError);
    }
    
    return user;
  } catch (error) {
    console.error('Sign in error:', error);
    const handledError = handleAuthError(error);
    throw handledError;
  }
};

/**
 * Sign in with Apple
 */
const signInWithApple = async () => {
  try {
    // Check if Apple Authentication is available on the device
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple Authentication is not available on this device');
    }
    
    // First, perform the Apple Sign-In through Expo
    const appleAuthCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    
    console.log('Apple credential obtained');
    
    // Get Apple identity token
    const { fullName, identityToken, nonce, email, user: appleUserId } = appleAuthCredential;
    
    if (!identityToken) {
      throw new Error('No identity token returned from Apple');
    }
    
    // Create Apple credential for Firebase v9+
    const provider = new OAuthProvider('apple.com');
    const appleCredential = provider.credential({
      idToken: identityToken,
      rawNonce: nonce,
    });
    
    // Sign in to Firebase with the Apple credential
    console.log('Signing in to Firebase with Apple credential');
    const userCredential = await signInWithCredential(auth, appleCredential);
    const user = userCredential.user;
    
    console.log('Apple Sign-In with Firebase successful, user:', user.uid);
    
    // Check if the user already has a document in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.log('New Apple user, creating profile');
      // Name will only be provided on first sign-in, so store it
      const displayName = fullName ? 
        `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : 
        email?.split('@')[0] || 'Apple User';
      
      // Save user profile data to Firestore
      await setDoc(userRef, {
        email: email || `${appleUserId}@apple.com`, // Apple might not provide email
        displayName,
        createdAt: serverTimestamp(), 
        lastLoggedIn: serverTimestamp(),
        authProvider: 'apple',
        appleUserId,
        completedOnboarding: false
      });
      
      // Update the user's display name in Firebase Auth
      await updateProfile(user, {
        displayName
      });
    } else {
      console.log('Existing Apple user, updating login time');
      // Update last login time for existing users
      await updateDoc(userRef, {
        lastLoggedIn: serverTimestamp()
      }).catch(err => console.log('Error updating last login time:', err));
    }
    
    // Store auth token for persistence
    const token = await getIdToken(user);
    await AsyncStorage.setItem('userToken', token);
    
    return user;
  } catch (error) {
    console.error('Apple Sign-In Error:', error);
    
    // Handle Apple Authentication errors specifically
    if (error.code === 'ERR_CANCELED') {
      throw { code: 'auth/cancelled', message: 'Sign in was cancelled' };
    }
    
    // Handle other errors
    const handledError = handleAuthError(error);
    throw handledError;
  }
};

/**
 * Signs out the currently authenticated user
 */
const signOut = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Sends a password reset email to the user
 */
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const handledError = handleAuthError(error);
    throw handledError;
  }
};

/**
 * Updates a user's profile information
 */
const updateUserProfile = async (profileData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');
    
    if (profileData.displayName || profileData.photoURL) {
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });
    }
    
    // Update additional profile data in Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, profileData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ================ Firestore Database Services ================

/**
 * Creates a new document in a collection
 */
const createDocument = async (collectionPath, docId, data) => {
  try {
    console.log(`Creating document in ${collectionPath}${docId ? ` with ID ${docId}` : ''}`);
    
    // Add timestamps
    const dataWithTimestamps = {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...data
    };
    
    let docRef;
    
    if (docId) {
      // Create document with specific ID
      docRef = doc(db, collectionPath, docId);
      await setDoc(docRef, dataWithTimestamps);
    } else {
      // Create document with auto-generated ID
      docRef = await addDoc(collection(db, collectionPath), dataWithTimestamps);
    }
    
    const resultId = docId || docRef.id;
    console.log(`Successfully created document ${collectionPath}/${resultId}`);
    return resultId;
  } catch (error) {
    console.error(`Error creating document in ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Updates an existing document
 */
const updateDocument = async (collectionPath, docId, data) => {
  try {
    console.log(`Updating document ${collectionPath}/${docId}`);
    
    // Add timestamp to update
    const updateData = {
      updatedAt: serverTimestamp(),
      ...data
    };
    
    const docRef = doc(db, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Document exists, update it
      await updateDoc(docRef, updateData);
    } else {
      // Document doesn't exist, create it
      await setDoc(docRef, {
        createdAt: serverTimestamp(),
        ...updateData
      });
    }
    
    console.log(`Successfully updated document ${collectionPath}/${docId}`);
  } catch (error) {
    console.error(`Error updating document ${collectionPath}/${docId}:`, error);
    throw error;
  }
};

/**
 * Gets a single document by ID
 */
const getDocument = async (collectionPath, docId) => {
  try {
    console.log(`Getting document from ${collectionPath}/${docId}`);
    
    const docRef = doc(db, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`Document ${collectionPath}/${docId} found`);
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.log(`Document ${collectionPath}/${docId} not found`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting document ${collectionPath}/${docId}:`, error);
    throw error;
  }
};

/**
 * Deletes a document by ID
 */
const deleteDocument = async (collectionPath, docId) => {
  try {
    console.log(`Deleting document ${collectionPath}/${docId}`);
    
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
    
    console.log(`Successfully deleted document ${collectionPath}/${docId}`);
  } catch (error) {
    console.error(`Error deleting document ${collectionPath}/${docId}:`, error);
    throw error;
  }
};

/**
 * Queries documents from a collection
 */
const queryDocuments = async (collectionPath, conditions = [], options = {}) => {
  try {
    // Create query
    let q = collection(db, collectionPath);
    
    // Add where conditions
    conditions.forEach(([field, operator, value]) => {
      q = query(q, where(field, operator, value));
    });
    
    // Add ordering
    if (options.orderBy) {
      const [field, direction = 'asc'] = Array.isArray(options.orderBy) 
        ? options.orderBy 
        : [options.orderBy, 'asc'];
      q = query(q, orderBy(field, direction));
    }
    
    // Add limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    // Process results
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return results;
  } catch (error) {
    console.error(`Error querying collection ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Sets up a real-time listener on a document
 */
const listenToDocument = (collectionPath, docId, onUpdate) => {
  try {
    const docRef = doc(db, collectionPath, docId);
    
    return onSnapshot(docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate({
            id: docSnap.id,
            ...docSnap.data()
          });
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.error(`Error in document listener ${collectionPath}/${docId}:`, error);
        onUpdate(null, error);
      }
    );
  } catch (error) {
    console.error(`Error setting up document listener ${collectionPath}/${docId}:`, error);
    return () => {};
  }
};

/**
 * Sets up a real-time listener on a collection query
 */
const listenToQuery = (collectionPath, conditions = [], options = {}, onUpdate) => {
  try {
    // Create query
    let q = collection(db, collectionPath);
    
    // Add where conditions
    conditions.forEach(([field, operator, value]) => {
      q = query(q, where(field, operator, value));
    });
    
    // Add ordering
    if (options.orderBy) {
      const [field, direction = 'asc'] = Array.isArray(options.orderBy) 
        ? options.orderBy 
        : [options.orderBy, 'asc'];
      q = query(q, orderBy(field, direction));
    }
    
    // Add limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    // Set up listener
    return onSnapshot(q,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        onUpdate(docs);
      },
      (error) => {
        console.error(`Error in query listener for ${collectionPath}:`, error);
        onUpdate([], error);
      }
    );
  } catch (error) {
    console.error(`Error setting up query listener for ${collectionPath}:`, error);
    return () => {};
  }
};

// ================ Notification Services ================

/**
 * Check if a notification was recently sent
 */
const wasNotificationRecentlySent = async (taskId) => {
  try {
    const recentNotificationKey = `recent_notification_${taskId}`;
    const recentNotificationData = await AsyncStorage.getItem(recentNotificationKey);
    
    if (recentNotificationData) {
      const { timestamp } = JSON.parse(recentNotificationData);
      // If notification was sent in the last 5 seconds, it's a duplicate
      if (Date.now() - timestamp < 5000) {
        console.log(`Found recent notification for task ${taskId}, age: ${(Date.now() - timestamp)/1000}s`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking recent notifications:', error);
    return false;
  }
};

/**
 * Mark a notification as sent
 */
const markNotificationAsSent = async (taskId) => {
  try {
    const recentNotificationKey = `recent_notification_${taskId}`;
    await AsyncStorage.setItem(recentNotificationKey, JSON.stringify({
      timestamp: Date.now()
    }));
    return true;
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    return false;
  }
};

/**
 * Get all active tasks that have active timers
 */
const getActiveTasks = async () => {
  try {
    const tasksQuery = query(
      collection(db, "reminders"),
      where("completed", "==", false),
      where("timerState.isActive", "==", true)
    );
    
    const taskDocs = await getDocs(tasksQuery);
    return taskDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting active tasks:', error);
    return [];
  }
};

/**
 * Schedule a notification for a task
 */
const scheduleTaskNotification = async (task) => {
  try {
    if (!task?.id) {
      console.error('Invalid task for notification scheduling');
      return null;
    }
    
    // Check if notification was recently sent
    if (await wasNotificationRecentlySent(task.id)) {
      console.log(`Notification recently sent for task ${task.id}. Skipping duplicate.`);
      return null;
    }

    // Cancel any existing notification
    await cancelTaskNotification(task.id);

    // Get interval from task or use default
    const interval = task.intervals?.[0] || 5; // Default to 5 minutes
    
    // Use consistent identifier
    const identifier = `task_${task.id}`;

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: task.rescheduleCount > 0 ? 'Task Rescheduled' : "Time's Up!",
        body: task.rescheduleCount > 0 
          ? `This task has been rescheduled ${task.rescheduleCount} times: ${task.text}`
          : `Time to work on "${task.text}"`,
        data: { 
          taskId: task.id,
          timestamp: Date.now()
        },
        sound: true,
        priority: 'high',
      },
      trigger: { 
        seconds: interval * 60 
      },
    });
    
    // Mark this notification as sent to prevent duplicates
    await markNotificationAsSent(task.id);

    // Update task in database with timer state
    const taskRef = doc(db, "reminders", task.id);
    await updateDoc(taskRef, {
      'timerState': {
        startTime: new Date().toISOString(),
        duration: interval,
        isActive: true,
        notificationId: identifier,
        notificationStatus: 'scheduled'
      }
    });

    console.log(`Scheduled notification for task ${task.id} with interval ${interval} minutes`);
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification for a task
 */
const cancelTaskNotification = async (taskId) => {
  try {
    const identifier = `task_${taskId}`;
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log(`Cancelled notification for task ID: ${taskId}`);
    return true;
  } catch (error) {
    console.error('Error cancelling notification:', error);
    return false;
  }
};

/**
 * Complete a task
 */
const completeTask = async (task) => {
  try {
    // Check if notification was recently sent
    if (await wasNotificationRecentlySent(task.id)) {
      console.log(`Recent notification detected for task ${task.id}, proceeding with caution`);
    }
    
    await cancelTaskNotification(task.id);
    
    const taskRef = doc(db, "reminders", task.id);
    await updateDoc(taskRef, {
      completed: true,
      completedAt: serverTimestamp(),
      'timerState.isActive': false,
      'timerState.notificationStatus': 'completed'
    });
    
    // Mark notification as sent to prevent duplicates
    await markNotificationAsSent(task.id);

    return true;
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
};

/**
 * Reschedule a task notification
 */
const rescheduleTask = async (task) => {
  try {
    const taskRef = doc(db, "reminders", task.id);
    const taskDoc = await getDoc(taskRef);
    
    if (!taskDoc.exists()) return false;
    
    const taskData = taskDoc.data();
    const interval = task.intervals?.[0] || taskData.intervals?.[0] || 5;
    
    // Check if notification was recently sent
    if (await wasNotificationRecentlySent(task.id)) {
      console.log(`Notification recently sent for task ${task.id}. Proceeding with caution.`);
    }
    
    // Update reschedule count
    await updateDoc(taskRef, {
      rescheduleCount: (taskData.rescheduleCount || 0) + 1,
      'timerState.startTime': new Date().toISOString(),
      'timerState.notificationStatus': 'pending'
    });

    // Schedule new notification
    await scheduleTaskNotification({
      ...taskData,
      id: task.id,
      intervals: [interval],
      rescheduleCount: (taskData.rescheduleCount || 0) + 1
    });
    
    // Mark this notification as sent to prevent duplicates
    await markNotificationAsSent(task.id);

    return true;
  } catch (error) {
    console.error("Error rescheduling notification:", error);
    throw error;
  }
};

/**
 * Check if a task timer has expired and update if needed
 */
const checkAndUpdateTaskTimer = async (task) => {
  try {
    if (!task?.id) return false;
    
    const taskRef = doc(db, "reminders", task.id);
    const taskDoc = await getDoc(taskRef);
    
    if (!taskDoc.exists()) return false;
    
    const taskData = taskDoc.data();
    if (!taskData.timerState?.isActive) return false;
    
    // Handle different timestamp formats
    let startTime;
    if (typeof taskData.timerState.startTime === 'string') {
      startTime = new Date(taskData.timerState.startTime);
    } else if (taskData.timerState.startTime && taskData.timerState.startTime.seconds) {
      startTime = new Date(taskData.timerState.startTime.seconds * 1000);
    } else {
      startTime = new Date();
    }
    
    const duration = taskData.timerState.duration || 5; // Default to 5 minutes
    const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));
    
    // Check if timer has completed
    const hasCompleted = new Date() >= endTime;
    
    if (hasCompleted) {
      // Check if we recently processed this task
      if (await wasNotificationRecentlySent(task.id)) {
        console.log(`Task ${task.id} was recently processed, skipping duplicate`);
        return true;
      }
      
      // Mark this task as being processed
      await markNotificationAsSent(task.id);
      
      // Update the task state
      await updateDoc(taskRef, {
        'timerState.isActive': false,
        'timerState.isCompleted': true,
        'timerState.completedAt': serverTimestamp(),
        'timerState.modalShown': false // Set modalShown to false to ensure modal shows on app open
      });
    }
    
    return hasCompleted;
  } catch (error) {
    console.error('Error checking task timer:', error);
    return false;
  }
};

/**
 * Register device token for notifications
 */
const registerDeviceToken = async (userId) => {
  if (!Constants.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }
  
  try {
    // Check notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return null;
    }
    
    // Get the token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo push token:', token);
    
    // Save token to user document if authenticated
    if (userId) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        expoPushToken: token,
        devicePlatform: Platform.OS,
        lastTokenUpdate: serverTimestamp()
      });
    } else {
      // Save to AsyncStorage for later association with user
      await AsyncStorage.setItem('expoPushToken', token);
    }
    
    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

// Background tasks placeholders 
const registerBackgroundTasks = async () => {
  console.log("Background tasks registration placeholder");
  return { success: true };
};

const isBackgroundFetchAvailable = async () => {
  return true;
};

const unregisterBackgroundTasks = async () => {
  console.log("Background tasks unregistration placeholder");
};

const defineBackgroundTasks = () => {
  console.log("Background tasks definition placeholder");
};

// Task name constants
const BACKGROUND_FETCH_TASK = 'background-fetch-task';
const TIMER_CHECK_TASK = 'timer-check-task';
const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';

/**
 * Request permission for notifications and register the device token
 */
const registerForPushNotifications = async () => {
  if (!Constants.isDevice) {
    Alert.alert('Push Notifications', 'Push notifications require a physical device.');
    return null;
  }
  
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Failed to get push notification permissions.');
      return null;
    }
    
    // Get the token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo push token:', token);
    
    // Save token to user document if authenticated
    const currentUser = auth.currentUser;
    if (currentUser) {
      await registerDeviceToken(currentUser.uid);
    } else {
      // Token will be saved to AsyncStorage by registerDeviceToken
      await registerDeviceToken(null);
    }
    
    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

// Test connection function
const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    const testRef = doc(db, '_connection_test', 'test');
    await setDoc(testRef, {
      timestamp: serverTimestamp(),
      testValue: 'Connection successful'
    });
    console.log('Firestore connection test successful');
    return true;
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    return false;
  }
};

// Export all Firebase services
export {
  // Firebase core (removed 'firebase' export since it's not defined)
  auth, db, FieldValue, testFirestoreConnection,
  
  // Auth operations
  signUpWithEmail, signInWithEmail, signInWithApple, signOut,
  resetPassword, updateUserProfile, handleAuthError,
  
  // Database operations
  createDocument, updateDocument, getDocument, deleteDocument,
  queryDocuments, listenToDocument, listenToQuery,
  
  // Background tasks
  registerBackgroundTasks, isBackgroundFetchAvailable, 
  unregisterBackgroundTasks, defineBackgroundTasks,
  BACKGROUND_FETCH_TASK, TIMER_CHECK_TASK, BACKGROUND_NOTIFICATION_TASK,
  checkAndUpdateTaskTimer,
  
  // Notification utilities
  registerDeviceToken, scheduleTaskNotification, cancelTaskNotification,
  completeTask, rescheduleTask, getActiveTasks, wasNotificationRecentlySent,
  markNotificationAsSent,
  
  // Additional utilities
  registerForPushNotifications
};