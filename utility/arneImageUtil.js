import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const getArneImage = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().arneImageUri) {
      return { uri: userDoc.data().arneImageUri };
    }
    
    return require('../assets/arne_photo.jpeg');
  } catch (error) {
    console.error('Error fetching Arne image:', error);
    return require('../assets/arne_photo.jpeg');
  }
};

export const useArneImage = (user) => {
  const [arneImage, setArneImage] = useState(require('../assets/arne_photo.jpeg'));

  useEffect(() => {
    const fetchArneImage = async () => {
      if (user) {
        const image = await getArneImage(user.uid);
        setArneImage(image);
      }
    };

    fetchArneImage();
  }, [user]);

  return arneImage;
};
