import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Animated, StyleSheet, Alert } from 'react-native';
import { useUser } from '../hooks/userHook';
import { getDocument, updateDocument } from '../screens/firebase-services.js';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import WallpaperCustomization from './WallpaperCustomization';

const ProfileScreen = ({ onBack }) => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [adhd, setAdhd] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [profileImage, setProfileImage] = useState(null);
  const { t } = useTranslation();
  
  // Wallpaper customization states
  const [showWallpaperCustomization, setShowWallpaperCustomization] = useState(false);
  const [wallpaperSetting, setWallpaperSetting] = useState({
    type: 'preset',
    value: 'default'
  });
  
  // Footer customization state (if you're keeping this feature)
  const [showFooterCustomization, setShowFooterCustomization] = useState(false);

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t('profile.permissionRequired'), t('profile.imagePermissionMessage'));
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
        await updateDocument('users', user.uid, { profileImageUri: result.assets[0].uri });
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('generalError.error'), t('profile.imageUploadError'));
    }
  };

  // Handle wallpaper change
  const handleWallpaperChange = (newWallpaper) => {
    setWallpaperSetting(newWallpaper);
    
    // Pass to HomeScreen immediately if it's already mounted
    if (navigation && navigation.navigate) {
      navigation.navigate('Home', { updatedWallpaper: newWallpaper });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Use standardized getDocument method for user data
          const userData = await getDocument('users', user.uid);
          if (userData) {
            setUserData(userData);
            setName(userData.displayName || user.displayName || t('profile.notSpecified'));
            setAdhd(userData.adhd || 'Unknown');
            setProfileImage(userData.profileImageUri || null);
            
            // Load wallpaper setting if exists
            if (userData.wallpaperSetting) {
              setWallpaperSetting(userData.wallpaperSetting);
            }
          } else {
            console.warn('User document does not exist');
          }

          // Use standardized getDocument method for user stats
          const statsData = await getDocument('userStats', user.uid);
          if (statsData) {
            setUserData(prevData => ({
              ...prevData,
              tasksCompleted: statsData.tasksCompleted || 0
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }
      }
    };

    fetchUserData();
  }, [user, fadeAnim, t]);

  const saveName = async () => {
    if (user) {
      try {
        // Use standardized updateDocument method
        await updateDocument('users', user.uid, { displayName: name });
      } catch (error) {
        console.error('Error updating name:', error);
      }
    }
  };

  const toggleADHD = async () => {
    const newStatus = adhd === 'Yes' ? 'No' : adhd === 'No' ? 'Unknown' : 'Yes';
    setAdhd(newStatus);
    if (user) {
      try {
        // Use standardized updateDocument method
        await updateDocument('users', user.uid, { adhd: newStatus });
      } catch (error) {
        console.error('Error updating ADHD status:', error);
      }
    }
  };

  const InfoItem = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{t(label)}:</Text>
      <Text style={styles.infoValue}>{value.toString()}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <FontAwesome name="arrow-left" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('profile.title')}</Text>
          <TouchableOpacity onPress={handleImagePick}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.genderImage} />
            ) : (
              <View style={[styles.genderImage, styles.defaultProfileImage]}>
                <Text>
                  <FontAwesome name="user" size={24} color="#1a1a1a" />
                </Text>
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Text>
                <FontAwesome name="camera" size={12} color="#1a1a1a" />
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else if (item.type === 'info') {
      return (
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.name')}:</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              onBlur={saveName}
              placeholder={t('profile.enterName')}
              placeholderTextColor="#a0a0a0"
            />
          </View>
          <InfoItem label="profile.email" value={user?.email || t('profile.notSpecified')} />
          <InfoItem label="profile.ageGroup" value={userData?.ageGroup || t('profile.notSpecified')} />
          <InfoItem label="profile.mainStruggle" value={userData?.struggles || t('profile.notSpecified')} />
          <TouchableOpacity style={styles.infoRow} onPress={toggleADHD}>
            <Text style={styles.infoLabel}>{t('profile.adhdStatus')}:</Text>
            <Text style={styles.adhdStatus}>{adhd}</Text>
          </TouchableOpacity>
          <InfoItem label="profile.tasksCompleted" value={userData?.tasksCompleted || 0} />
          <InfoItem label="profile.accountCreated" value={new Date(user?.metadata?.creationTime).toLocaleDateString() || t('profile.notSpecified')} />
          
          {/* Wallpaper customization button */}
          <TouchableOpacity 
            style={styles.wallpaperButton} 
            onPress={() => setShowWallpaperCustomization(true)}
          >
            <FontAwesome name="image" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.wallpaperButtonText}>Change App Background</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const getData = () => {
    return [
      { type: 'header', id: 'header' },
      { type: 'info', id: 'info' }
    ];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>{t('profile.loading')}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <FlatList
        data={getData()}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        style={{ width: '100%' }}
      />

      {/* Wallpaper Customization Modal */}
      <WallpaperCustomization
        visible={showWallpaperCustomization}
        onClose={() => setShowWallpaperCustomization(false)}
        user={user}
        currentWallpaper={wallpaperSetting}
        onWallpaperChange={handleWallpaperChange}
      />

      {/* Footer Customization Modal if you're keeping it */}
      {/* Whatever your footer customization component is */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7e8d3',
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: 'bold',
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
    borderRadius: 20,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  genderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF6347',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '100%',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 26, 26, 0.1)',
    width: '100%',
  },
  infoLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'right',
    flex: 2,
  },
  nameInput: {
    flex: 2,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  adhdStatus: {
    fontSize: 16,
    color: '#FF6347',
    fontWeight: 'bold',
  },
  defaultProfileImage: {
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(247, 232, 211, 0.8)',
    padding: 4,
    borderRadius: 8,
  },
  
  // Wallpaper button style
  wallpaperButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2', // Different color from the other button
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallpaperButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Footer customization button style
  customizeButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  customizeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;