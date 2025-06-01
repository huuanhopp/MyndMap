import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Animated, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useUser } from '../hooks/userHook';
import { getDocument, updateDocument } from '../firebase-services';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

const ArneCustomizationScreen = ({ onClose }) => {
  const [arneImage, setArneImage] = useState(null);
  const { user } = useUser();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchArneImage = async () => {
      if (user) {
        // Use standardized getDocument method
        const userData = await getDocument('users', user.uid);
        if (userData && userData.arneImageUri) {
          setArneImage(userData.arneImageUri);
        }
      }
    };

    fetchArneImage();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleArneImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(t('arneCustomization.permissionRequired'), t('arneCustomization.imagePermissionMessage'));
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
  
      if (!result.canceled) {
        // Use standardized updateDocument method
        await updateDocument('users', user.uid, {
          arneImageUri: result.assets[0].uri
        });
        setArneImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('generalError.error'), t('arneCustomization.imageUploadError'));
    }
  };

  const resetArneImage = async () => {
    try {
      // Use standardized updateDocument method
      await updateDocument('users', user.uid, {
        arneImageUri: null
      });
      setArneImage(null);
    } catch (error) {
      console.error('Error resetting Arne image:', error);
      Alert.alert(t('general.error'), t('arneCustomization.resetError'));
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <FontAwesome name="chevron-left" size={24} color="#FF6347" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('arneCustomization.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.arneImageContainer}>
        <Image 
          source={arneImage ? { uri: arneImage } : require('../assets/Arne.jpeg')} 
          style={styles.arneImage} 
        />
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={handleArneImagePick}
        >
          <FontAwesome name="camera" size={20} color="#F7e8d3" />
          <Text style={styles.uploadButtonText}>
            {t('arneCustomization.changeImage')}
          </Text>
        </TouchableOpacity>
        {arneImage && (
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={resetArneImage}
          >
            <FontAwesome name="refresh" size={20} color="#FF6347" />
            <Text style={styles.resetButtonText}>
              {t('arneCustomization.resetImage')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 65,
    paddingBottom: 20,
    width: '100%',
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F7e8d3',
  },
  placeholder: {
    width: 40,
  },
  arneImageContainer: {
    alignItems: 'center',
    padding: 20,
  },
  arneImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FF6347',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#F7e8d3',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6347',
  },
  resetButtonText: {
    color: '#FF6347',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ArneCustomizationScreen;