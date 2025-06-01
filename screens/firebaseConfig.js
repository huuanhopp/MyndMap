// screens/firebaseConfig.js
// Re-export Firebase functions for compatibility with existing userHook
export { auth, db } from '../firebase/config';
export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
export { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';