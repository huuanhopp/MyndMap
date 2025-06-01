import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBnAerRKE6Jy5mybuXpQK4CzB-JVrmrcJA",
    authDomain: "myndmap-8d0ff.firebaseapp.com",
    databaseURL: "https://myndmap-8d0ff-default-rtdb.firebaseio.com",
    projectId: "myndmap-8d0ff",
    storageBucket: "myndmap-8d0ff.appspot.com",
    messagingSenderId: "923455445614",
    appId: "1:923455445614:ios:2a88c3d11c75162df9247f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;