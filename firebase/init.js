// firebase/init.js
import { auth, db } from './config';
import app from './config';
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
  serverTimestamp
} from 'firebase/firestore';

import { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';

// Check if running in Expo Go
export const isExpoGo = typeof window !== 'undefined' && window.ExponentConstants;

// Export Firebase app and services
export { app };
export { auth };
export { getAuth };
export { getFirestore };

// Export Firestore functions
export { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
};

// Export Auth functions
export { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged
};

// Document operations
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
};

export const setDocument = async (collectionName, docId, data, options = {}) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, options);
    return { id: docId, ...data };
  } catch (error) {
    console.error("Error setting document:", error);
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    return { id: docId, ...data };
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

// Collection operations
export const addDocument = async (collectionName, data) => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

export const getCollection = async (collectionName, constraints = []) => {
  try {
    const collectionRef = collection(db, collectionName);
    let q = collectionRef;
    
    if (constraints.length > 0) {
      q = query(collectionRef, ...constraints);
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    console.error("Error getting collection:", error);
    throw error;
  }
};

// Query helpers
export const createQuery = (collectionName, ...constraints) => {
  const collectionRef = collection(db, collectionName);
  return query(collectionRef, ...constraints);
};
