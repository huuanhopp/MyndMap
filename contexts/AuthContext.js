// contexts/AuthContext.js - Using modular API consistently
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';

// Import all necessary Firebase functions from the modular API
import { 
  getAuth,
  auth,
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  app,
  isExpoGo
} from '../firebase/init';

// Create the auth context
const AuthContext = createContext();

/**
 * Provider component that wraps the app and makes auth object available to any
 * child component that calls useAuth().
 */
export const AuthProvider = ({ children, onLanguageChange }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  // Check if Apple Authentication is available - only on iOS
  useEffect(() => {
    const checkAppleAuthAvailability = async () => {
      try {
        // Only check if we're on iOS
        if (Platform.OS === 'ios') {
          const isAvailable = await AppleAuthentication.isAvailableAsync();
          console.log('Apple Authentication available:', isAvailable);
          setAppleAuthAvailable(isAvailable);
        } else {
          // Not available on non-iOS platforms
          setAppleAuthAvailable(false);
        }
      } catch (error) {
        console.log('Error checking Apple Authentication availability:', error);
        setAppleAuthAvailable(false);
      }
    };

    checkAppleAuthAvailability();
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener...');
    let unsubscribe = () => {};
    
    try {
      if (isExpoGo) {
        // Mock implementation for Expo Go
        setTimeout(() => {
          setCurrentUser(null);
          setLoading(false);
        }, 500);
      } else {
        // React Native Firebase with modular API
        const authInstance = getAuth();
        unsubscribe = onAuthStateChanged(authInstance, handleAuthStateChange);
      }
    } catch (e) {
      console.error('Error setting up auth state listener:', e);
      setLoading(false);
    }

    // Cleanup subscription on unmount
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [onLanguageChange]);

  // Auth state change handler
  const handleAuthStateChange = async (user) => {
    try {
      if (user) {
        console.log('User authenticated:', user.uid);
        setCurrentUser(user);
        
        try {
          // Get additional user data from Firestore using modular API
          const firestoreInstance = getFirestore();
          const userRef = doc(firestoreInstance, 'users', user.uid);
          const docSnapshot = await getDoc(userRef);
          
          if (docSnapshot.exists()) {
            const userDocData = {
              id: docSnapshot.id,
              ...docSnapshot.data()
            };
            
            console.log('User data retrieved successfully');
            setUserData(userDocData);
            
            // Update language if needed
            if (userDocData.language && onLanguageChange) {
              onLanguageChange(userDocData.language);
            }
            
            try {
              // Store the last login timestamp using modular API
              console.log('Updating last login timestamp');
              await updateDoc(userRef, {
                lastLoggedIn: serverTimestamp()
              });
              
              // Check for stored push token in AsyncStorage
              const storedToken = await AsyncStorage.getItem('expoPushToken');
              if (storedToken) {
                console.log('Updating stored push token');
                await updateDoc(userRef, {
                  expoPushToken: storedToken
                });
                // Clear from AsyncStorage now that it's saved to the user profile
                await AsyncStorage.removeItem('expoPushToken');
              }
            } catch (updateError) {
              console.error('Error updating user document:', updateError);
              // Continue with authentication flow even if update fails
            }
          } else {
            // Handle missing user document - create a basic one
            console.log('No user document found, creating one');
            try {
              // Create a user document with server timestamp
              const userData = {
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0] || "New User",
                createdAt: serverTimestamp(),
                lastLoggedIn: serverTimestamp(),
                completedOnboarding: false
              };
              
              // Use modular API
              await setDoc(userRef, userData);
              setUserData({ id: user.uid, ...userData });
            } catch (createError) {
              console.error('Error creating user document:', createError);
            }
          }
        } catch (firestoreError) {
          console.error('Error retrieving user data:', firestoreError);
          // Continue with basic user authentication even without Firestore data
          setUserData({
            id: user.uid,
            email: user.email,
            displayName: user.displayName || "User",
            fallbackProfile: true // Flag to indicate this is a fallback profile
          });
        }
      } else {
        console.log('No user authenticated');
        setCurrentUser(null);
        setUserData(null);
      }
    } catch (error) {
      console.error('Error in auth state listener:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear any auth errors when component unmounts
  useEffect(() => {
    return () => {
      setAuthError(null);
    };
  }, []);

  /**
   * Sign up with email and password
   */
  const signup = async (email, password, additionalData = {}) => {
    setAuthError(null);
    try {
      // Default language to English if not specified
      const userData = {
        language: 'en',
        ...additionalData,
        createdAt: new Date()
      };
      
      // Create user with email and password
      let user;
      
      if (isExpoGo) {
        // Mock implementation for Expo Go
        console.log('Mock signup in Expo Go');
        // Return a mock user
        return { uid: 'mock-uid', email, displayName: additionalData.displayName || email.split('@')[0] };
      } else {
        // React Native Firebase with modular API
        const authInstance = getAuth();
        const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
        user = userCredential.user;
      }
      
      setCurrentUser(user);
      
      // Create user document in Firestore using modular API
      const firestoreInstance = getFirestore();
      const userRef = doc(firestoreInstance, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        ...userData
      });
      
      // Set user data in state
      const userProfile = {
        id: user.uid,
        email: user.email,
        ...userData
      };
      
      setUserData(userProfile);
      
      // Update language if specified
      if (userData.language && onLanguageChange) {
        onLanguageChange(userData.language);
      }
      
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      setAuthError(error);
      throw error;
    }
  };

  /**
   * Sign in with email and password
   */
  const login = async (email, password) => {
    setAuthError(null);
    try {
      console.log('AuthContext: Starting login process');
      console.log('AuthContext: Email:', email);
      console.log('AuthContext: Password length:', password?.length);
      console.log('AuthContext: isExpoGo:', isExpoGo);
      
      let user;
      
      if (isExpoGo) {
        // Mock implementation for Expo Go
        console.log('Mock login in Expo Go');
        // Return a mock user
        return { uid: 'mock-uid', email, displayName: email.split('@')[0], completedOnboarding: true };
      } else {
        // React Native Firebase with modular API
        console.log('AuthContext: Using React Native Firebase');
        const authInstance = getAuth();
        console.log('AuthContext: Auth instance obtained:', !!authInstance);
        
        console.log('AuthContext: Calling signInWithEmailAndPassword...');
        const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
        user = userCredential.user;
        console.log('AuthContext: signInWithEmailAndPassword successful, user:', user.uid);
      }
      
      setCurrentUser(user);
      
      let hasCompletedOnboarding = false;
      
      try {
        // Get user data using modular API
        const firestoreInstance = getFirestore();
        const userRef = doc(firestoreInstance, 'users', user.uid);
        const docSnapshot = await getDoc(userRef);
        
        if (docSnapshot.exists()) {
          const userDocData = {
            id: docSnapshot.id,
            ...docSnapshot.data()
          };
          
          console.log('User data retrieved during login');
          
          // Check onboarding status
          hasCompletedOnboarding = userDocData.completedOnboarding === true;
          console.log('User onboarding status:', hasCompletedOnboarding);
          
          setUserData({
            ...userDocData,
            completedOnboarding: hasCompletedOnboarding
          });
          
          // Update language if needed
          if (userDocData.language && onLanguageChange) {
            onLanguageChange(userDocData.language);
          }
          
          // Update last login time using modular API
          await updateDoc(userRef, {
            lastLoggedIn: serverTimestamp()
          });
        } else {
          // Create a basic user document if none exists
          console.log('No user document found during login, creating one');
          try {
            const userData = {
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || "New User",
              createdAt: serverTimestamp(),
              lastLoggedIn: serverTimestamp(),
              completedOnboarding: false
            };
            
            await setDoc(userRef, userData);
            setUserData({ 
              id: user.uid, 
              ...userData,
              completedOnboarding: false
            });
            
            hasCompletedOnboarding = false;
          } catch (createError) {
            console.error('Error creating user document during login:', createError);
          }
        }
      } catch (firestoreError) {
        console.error('Error retrieving user data during login:', firestoreError);
        // Continue with basic user authentication even without Firestore data
        setUserData({
          id: user.uid,
          email: user.email,
          displayName: user.displayName || "User",
          fallbackProfile: true,
          completedOnboarding: false
        });
      }
      
      // Return extended user object with onboarding status
      return {
        ...user,
        completedOnboarding: hasCompletedOnboarding
      };
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error);
      throw error;
    }
  };

  /**
   * Sign in with Apple
   */
  const loginWithApple = async () => {
    setAuthError(null);
    try {
      // Check if Apple Authentication is available
      if (!appleAuthAvailable) {
        Alert.alert(
          'Not Available',
          'Apple Sign In is not available on this device.',
          [{ text: 'OK' }]
        );
        return null;
      }

      console.log('Starting Apple Sign-In process from AuthContext');
      
      // First, perform the Apple Sign-In through Expo
      const appleAuthCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      console.log('Apple credential obtained');
      
      // Get Apple identity token
      const { identityToken, nonce } = appleAuthCredential;
      
      if (!identityToken) {
        throw new Error('No identity token returned from Apple');
      }
      
      let user;
      
      if (isExpoGo) {
        // Mock implementation for Expo Go
        console.log('Mock Apple Sign-In in Expo Go');
        // Create a mock user based on Apple info
        user = {
          uid: 'apple-' + appleAuthCredential.user,
          email: appleAuthCredential.email || 'apple-user@example.com',
          displayName: (appleAuthCredential.fullName ? 
            `${appleAuthCredential.fullName.givenName || ''} ${appleAuthCredential.fullName.familyName || ''}`.trim() : 
            'Apple User')
        };
      } else {
        // React Native Firebase approach with modular API
        // For Apple authentication we need to use a special import
        const { OAuthProvider } = auth;
        const provider = new OAuthProvider('apple.com');
        const appleCredential = provider.credential({
          idToken: identityToken,
          rawNonce: nonce
        });
        
        const authInstance = getAuth();
        const userCredential = await authInstance.signInWithCredential(appleCredential);
        user = userCredential.user;
      }
      
      console.log('Apple Sign-In with Firebase successful, user:', user.uid);
      
      // Check if this is a new user or existing user using modular API
      const firestoreInstance = getFirestore();
      const userRef = doc(firestoreInstance, 'users', user.uid);
      const docSnapshot = await getDoc(userRef);
      let isNewUser = !docSnapshot.exists();
      let hasCompletedOnboarding = false;
      
      if (docSnapshot.exists()) {
        const userDocData = {
          id: docSnapshot.id,
          ...docSnapshot.data()
        };
        
        // Existing user - update last login and check onboarding status
        hasCompletedOnboarding = userDocData.completedOnboarding === true;
        
        // Use modular API - FIXED: using lastLoggedIn instead of lastLogin
        await updateDoc(userRef, {
          lastLoggedIn: serverTimestamp()
        });
        
        console.log('Existing user, onboarding completed:', hasCompletedOnboarding);
      } else {
        // New user - create user document with Apple info
        isNewUser = true;
        console.log('New user, creating profile');
        
        // Name will only be provided on first sign-in, so store it
        const displayName = appleAuthCredential.fullName ? 
          `${appleAuthCredential.fullName.givenName || ''} ${appleAuthCredential.fullName.familyName || ''}`.trim() : 
          user.email?.split('@')[0] || 'Apple User';
        
        // Create a new user document using modular API - FIXED: using lastLoggedIn instead of lastLogin
        await setDoc(userRef, {
          email: user.email,
          displayName: displayName,
          createdAt: serverTimestamp(),
          lastLoggedIn: serverTimestamp(),
          authProvider: 'apple',
          appleUserId: appleAuthCredential.user,
          completedOnboarding: false
        });
        
        // Update Firebase profile if we have a name
        if (displayName && !isExpoGo) {
          await user.updateProfile({
            displayName: displayName
          });
        }
      }
      
      // Save user data to state
      setUserData({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        completedOnboarding: hasCompletedOnboarding,
        isNewUser: isNewUser
      });
      
      // Return user object with additional info about onboarding status
      return {
        ...user,
        isNewUser: isNewUser,
        completedOnboarding: hasCompletedOnboarding
      };
    } catch (error) {
      console.error('Apple auth error in context:', error);
      
      // Handle specific Apple authentication errors
      if (error.code === 'ERR_CANCELED') {
        // User cancelled the sign-in flow
        setAuthError({ code: 'auth/cancelled', message: 'Sign in was cancelled' });
      } else if (error.code === 'auth/admin-restricted-operation') {
        // This specific error occurs when the authentication method isn't enabled in Firebase
        console.error('Apple Sign-In is not enabled in your Firebase console');
        setAuthError({ 
          code: 'auth/admin-restricted-operation', 
          message: 'Apple Sign-In is not enabled in Firebase. Please contact the app administrator.'
        });
      } else {
        // Other authentication errors
        setAuthError(error);
      }
      
      throw error;
    }
  };

  /**
   * Sign out the current user
   */
  const logout = async () => {
    setAuthError(null);
    try {
      await AsyncStorage.removeItem('userToken');
      
      if (isExpoGo) {
        // Mock implementation for Expo Go
        console.log('Mock logout in Expo Go');
        setCurrentUser(null);
        setUserData(null);
      } else {
        // React Native Firebase with modular API
        const authInstance = getAuth();
        await firebaseSignOut(authInstance);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError(error);
      throw error;
    }
  };

  /**
   * Reset password
   */
  const forgotPassword = async (email) => {
    setAuthError(null);
    try {
      if (isExpoGo) {
        // Mock implementation for Expo Go
        console.log('Mock password reset in Expo Go');
        return true;
      } else {
        // React Native Firebase with modular API
        const authInstance = getAuth();
        await authInstance.sendPasswordResetEmail(email);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthError(error);
      throw error;
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (data) => {
    setAuthError(null);
    try {
      if (!currentUser) throw new Error('No authenticated user found');
      
      try {
        // Update profile in Firebase Authentication
        if (data.displayName || data.photoURL) {
          if (isExpoGo) {
            // Mock implementation for Expo Go
            console.log('Mock profile update in Expo Go');
          } else {
            // React Native Firebase approach
            await currentUser.updateProfile({
              displayName: data.displayName,
              photoURL: data.photoURL
            });
          }
        }
        
        // Update language immediately if needed
        if (data.language && data.language !== userData?.language && onLanguageChange) {
          onLanguageChange(data.language);
        }
        
        try {
          // Update user data in Firestore using modular API
          const firestoreInstance = getFirestore();
          const userRef = doc(firestoreInstance, 'users', currentUser.uid);
          await updateDoc(userRef, {
            ...data,
            updatedAt: serverTimestamp()
          });
          
          // Fetch updated user data using modular API
          const updatedDocSnap = await getDoc(userRef);
          const updatedUserData = updatedDocSnap.exists() ? {
            id: updatedDocSnap.id,
            ...updatedDocSnap.data()
          } : null;
          
          if (updatedUserData) {
            console.log('User profile updated successfully');
            setUserData(updatedUserData);
          } else {
            // If for some reason we can't get the updated document, still update local state
            console.log('Could not retrieve updated user document, updating local state');
            setUserData(prev => ({
              ...prev,
              ...data,
              updatedAt: new Date()
            }));
          }
        } catch (firestoreError) {
          console.error('Error retrieving updated user data:', firestoreError);
          // Update local state even if Firestore retrieval fails
          setUserData(prev => ({
            ...prev,
            ...data,
            updatedAt: new Date()
          }));
        }
      } catch (profileError) {
        console.error('Error updating user profile:', profileError);
        throw profileError;
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setAuthError(error);
      throw error;
    }
  };

  /**
   * Get current auth status
   */
  const getAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch (error) {
      console.error('Error getting auth status:', error);
      return false;
    }
  };

  // Context value
  const value = {
    currentUser,
    userData,
    loading,
    authError,
    login,
    signup,
    loginWithApple,  // Apple Sign-In method
    appleAuthAvailable,  // Flag indicating if Apple Sign-In is available
    logout,
    forgotPassword,
    updateProfile,
    getAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
