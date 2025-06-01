// firebase-init.js
// Re-export everything from firebase/init.js for compatibility with existing hooks

export {
    auth,
    getDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    addDocument,
    getCollection,
    createQuery,
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
    limit
  } from '../firebase/init';
  
  // Also re-export the database instance if needed
  export { db } from '../firebase/config';