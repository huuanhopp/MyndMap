// utils/firebaseTest.js - Test Firebase connection
import { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getFirestore,
  collection,
  doc,
  setDoc
} from '../firebase/init';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test auth instance
    const auth = getAuth();
    console.log('Auth instance created:', !!auth);
    
    // Test firestore instance
    const db = getFirestore();
    console.log('Firestore instance created:', !!db);
    
    return { success: true, auth: !!auth, firestore: !!db };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return { success: false, error: error.message };
  }
};

export const testCreateUser = async (email, password) => {
  try {
    console.log('Testing user creation...');
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Test user created successfully:', userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Test user creation failed:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

export const testLogin = async (email, password) => {
  try {
    console.log('Testing user login...');
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Test login successful:', userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Test login failed:', error);
    return { success: false, error: error.message, code: error.code };
  }
};
