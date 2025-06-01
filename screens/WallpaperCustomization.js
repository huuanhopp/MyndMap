import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Modal,
  Alert,
  Dimensions,
  Animated
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

// Import your specific wallpaper options
import defaultWallpaper from '../assets/splash.png';
import wavesWallpaper from '../assets/Waves.png';
import acostaWallpaper from '../assets/Accosia.png';
import dreamsWallpaper from '../assets/Dreams.png';
import synapseWallpaper from '../assets/Synapse.png';
import yamaWallpaper from '../assets/Yama.png';
import hikariWallpaper from '../assets/Hikari.png';
import celestiaWallpaper from '../assets/Celestia.png';
import meiyoWallpaper from '../assets/Meiyo.png';
import unityWallpaper from '../assets/Unity.png';
import pebbleWallpaper from '../assets/Pebble.png';
import serenityWallpaper from '../assets/Serenity.png';
import tranquilWallpaper from '../assets/Tranquil.png';
import essenceWallpaper from '../assets/Essence.png';
import breezeWallpaper from '../assets/Breeze.png';
import graphiteWallpaper from '../assets/Graphite.png';
import obsidianWallpaper from '../assets/Obsidian.png';
import midnightWallpaper from '../assets/Midnight.png';

// Get device dimensions for responsive layout
const { width, height } = Dimensions.get('window');

const WallpaperCustomization = ({ visible, onClose, user, currentWallpaper, onWallpaperChange }) => {
  const { t } = useTranslation();
  const [selectedWallpaper, setSelectedWallpaper] = useState(currentWallpaper || { type: 'preset', value: 'default' });
  const [customWallpapers, setCustomWallpapers] = useState([]);
  const [activeTab, setActiveTab] = useState('themes'); // 'themes' or 'custom'
  const [activeThemeCategory, setActiveThemeCategory] = useState('casual'); // 'casual', 'flowState', 'zenMode', 'deepWork'
  
  // Animation for wallpaper preview
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Animation for category content
  const categoryFadeAnim = useRef(new Animated.Value(1)).current;

  // Define wallpaper options by category
  const wallpaperCategories = {
    casual: [
      { name: 'Default', image: defaultWallpaper, id: 'default' },
      { name: 'Waves', image: wavesWallpaper, id: 'waves' },
      { name: 'Acosta', image: acostaWallpaper, id: 'acosta' },
      { name: 'Dreams', image: dreamsWallpaper, id: 'dreams' },
      { name: 'Synapse', image: synapseWallpaper, id: 'synapse' },
      { name: 'Yama', image: yamaWallpaper, id: 'yama' },
      { name: 'Hikari', image: hikariWallpaper, id: 'hikari' },
      { name: 'Celestia', image: celestiaWallpaper, id: 'celestia' },
      { name: 'Meiyo', image: meiyoWallpaper, id: 'meiyo' },
      { name: 'Unity', image: unityWallpaper, id: 'unity' },
    ],
    flowState: [
      { name: 'Essence', image: essenceWallpaper, id: 'essence' },
      { name: 'Breeze', image: breezeWallpaper, id: 'breeze' },
    ],
    zenMode: [
      { name: 'Serenity', image: serenityWallpaper, id: 'serenity' },
      { name: 'Pebble', image: pebbleWallpaper, id: 'pebble' },
      { name: 'Tranquil', image: tranquilWallpaper, id: 'tranquil' },
    ],
    deepWork: [
      { name: 'Graphite', image: graphiteWallpaper, id: 'graphite' },
      { name: 'Obsidian', image: obsidianWallpaper, id: 'obsidian' },
      { name: 'Midnight', image: midnightWallpaper, id: 'midnight' },
    ]
  };

  useEffect(() => {
    const fetchCustomWallpapers = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists() && userDoc.data().customWallpapers) {
            setCustomWallpapers(userDoc.data().customWallpapers || []);
            
            // If user has custom wallpapers and is using one, switch to custom tab
            if (userDoc.data().customWallpapers.length > 0 && 
                currentWallpaper?.type === 'custom') {
              setActiveTab('custom');
            }
          }

          // Determine which theme category the current wallpaper belongs to
          if (currentWallpaper?.type === 'preset') {
            for (const [category, wallpapers] of Object.entries(wallpaperCategories)) {
              if (wallpapers.some(wp => wp.id === currentWallpaper.value)) {
                setActiveThemeCategory(category);
                break;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching custom wallpapers:', error);
        }
      }
    };

    fetchCustomWallpapers();
  }, [user, currentWallpaper]);

  // Animation function for wallpaper changes
  const animateWallpaperChange = (callback) => {
    // Start the fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
    
    // Execute the callback that changes the wallpaper DURING the fade-out
    // not after it completes
    callback();
    
    // Set a timeout that approximately matches the fade-out duration
    // This ensures the fade-in starts after fade-out is complete
    setTimeout(() => {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 400); // Match this to the fade-out duration
  };

  const handleWallpaperSelect = (option) => {
    animateWallpaperChange(() => {
      setSelectedWallpaper({
        type: 'preset',
        value: option.id
      });
    });
  };

  const handleCustomWallpaperSelect = (uri) => {
    animateWallpaperChange(() => {
      setSelectedWallpaper({
        type: 'custom',
        value: uri
      });
    });
  };
  
  // Animation function for category changes
  const animateCategoryChange = (category) => {
    // Fade out
    Animated.timing(categoryFadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Change category (in the middle of animation)
      setActiveThemeCategory(category);
      
      // Fade in
      Animated.timing(categoryFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleUploadWallpaper = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t('profile.permissionRequired'), t('profile.imagePermissionMessage'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [9, 16] // Good aspect ratio for phone screens
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        
        // Add to custom wallpapers array
        const updatedWallpapers = [...customWallpapers, imageUri];
        setCustomWallpapers(updatedWallpapers);
        
        // Select the newly uploaded wallpaper with animation
        animateWallpaperChange(() => {
          setSelectedWallpaper({
            type: 'custom',
            value: imageUri
          });
          
          // Switch to custom tab
          setActiveTab('custom');
        });

        // Save to Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { customWallpapers: updatedWallpapers });
      }
    } catch (error) {
      console.error('Error uploading wallpaper:', error);
      Alert.alert('Error', 'Failed to upload wallpaper');
    }
  };
  
  const handleCameraCapture = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t('profile.permissionRequired'), 'Camera access is required to take a photo.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: true,
        aspect: [9, 16] // Good aspect ratio for phone screens
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        
        // Add to custom wallpapers array
        const updatedWallpapers = [...customWallpapers, imageUri];
        setCustomWallpapers(updatedWallpapers);
        
        // Select the newly captured wallpaper with animation
        animateWallpaperChange(() => {
          setSelectedWallpaper({
            type: 'custom',
            value: imageUri
          });
          
          // Switch to custom tab
          setActiveTab('custom');
        });

        // Save to Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { customWallpapers: updatedWallpapers });
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };
  
  const removeCustomWallpaper = async (uriToRemove) => {
    try {
      // Remove from local state
      const updatedWallpapers = customWallpapers.filter(uri => uri !== uriToRemove);
      setCustomWallpapers(updatedWallpapers);
      
      // If the removed wallpaper was selected, change to default
      if (selectedWallpaper.type === 'custom' && selectedWallpaper.value === uriToRemove) {
        animateWallpaperChange(() => {
          setSelectedWallpaper({
            type: 'preset',
            value: 'default'
          });
          setActiveTab('themes');
          setActiveThemeCategory('casual');
        });
      }
      
      // Update in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { customWallpapers: updatedWallpapers });
    } catch (error) {
      console.error('Error removing custom wallpaper:', error);
      Alert.alert('Error', 'Failed to remove custom wallpaper');
    }
  };

  const saveWallpaperSelection = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 
        wallpaperSetting: selectedWallpaper
      });
      
      // Call the callback to update the wallpaper in the parent component
      onWallpaperChange(selectedWallpaper);
      onClose();
    } catch (error) {
      console.error('Error saving wallpaper selection:', error);
      Alert.alert('Error', 'Failed to save wallpaper selection');
    }
  };

  // Find the currently selected preset wallpaper
  const getPresetWallpaperById = (id) => {
    for (const category in wallpaperCategories) {
      const foundWallpaper = wallpaperCategories[category].find(option => option.id === id);
      if (foundWallpaper) return foundWallpaper;
    }
    
    // If we can't find the wallpaper, return a default one
    return wallpaperCategories.casual[0]; // Default as fallback
  };
  
  // Debug function to check if all images are loading correctly
  useEffect(() => {
    // Log available wallpapers on mount to help with debugging
    Object.keys(wallpaperCategories).forEach(category => {
      wallpaperCategories[category].forEach(wp => {
        if (!wp.image && wp.id !== 'black') {
          console.log(`Warning: No image found for wallpaper: ${wp.name} (${wp.id})`);
        }
      });
    });
  }, []);

  // Render preview based on selection
  const renderPreview = () => {
    if (selectedWallpaper.type === 'custom') {
      return (
        <Image 
          source={{ uri: selectedWallpaper.value }} 
          style={styles.previewImage}
          resizeMode="cover"
        />
      );
    } else {
      // Handle special cases
      if (selectedWallpaper.value === 'black') {
        return (
          <View style={[styles.previewImage, { backgroundColor: '#000' }]}>
            <Text style={styles.midnightText}>Midnight</Text>
          </View>
        );
      } else if (selectedWallpaper.value === 'midnight') {
        return (
          <Image 
            source={midnightWallpaper}
            style={styles.previewImage}
            resizeMode="cover"
          />
        );
      }
      
      const option = getPresetWallpaperById(selectedWallpaper.value);
      if (!option || !option.image) {
        // Fallback for missing images
        return (
          <View style={[styles.previewImage, { backgroundColor: '#333' }]}>
            <Text style={styles.midnightText}>{option?.name || 'Wallpaper'}</Text>
          </View>
        );
      }
      
      return (
        <Image 
          source={option.image} 
          style={styles.previewImage}
          resizeMode="cover"
        />
      );
    }
  };

  // Render the theme category tabs
  const renderThemeCategoryTabs = () => {
    const categories = [
      { id: 'casual', label: 'Casual' },
      { id: 'flowState', label: 'Flow State' },
      { id: 'zenMode', label: 'Zen Mode' },
      { id: 'deepWork', label: 'Deep Work' }
    ];

    return (
      <View style={styles.themeCategoryTabs}>
        {categories.map((category, index) => (
          <React.Fragment key={category.id}>
            <TouchableOpacity
              style={[
                styles.themeCategoryTab,
                activeThemeCategory === category.id ? styles.activeThemeCategoryTab : null
              ]}
              onPress={() => animateCategoryChange(category.id)}
            >
              <Text 
                style={[
                  styles.themeCategoryTabText, 
                  activeThemeCategory === category.id ? styles.activeThemeCategoryTabText : null
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
            {index < categories.length - 1 && (
              <View style={styles.tabDivider} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          {/* Header with title and close button */}
          <View style={styles.header}>
            <Text style={styles.title}>Change Background</Text>
          </View>
          
          {/* Preview section - always visible */}
          <Animated.View style={[styles.previewContainer, { opacity: fadeAnim }]}>
            {renderPreview()}
            <View style={styles.previewOverlay} />
          </Animated.View>
          
          {/* Tab navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'themes' ? styles.activeTab : null]}
              onPress={() => setActiveTab('themes')}
            >
              <FontAwesome 
                name="image" 
                size={18} 
                color={activeTab === 'themes' ? '#FF6347' : '#f7e8d3'} 
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, activeTab === 'themes' ? styles.activeTabText : null]}>
                Themes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'custom' ? styles.activeTab : null]}
              onPress={() => setActiveTab('custom')}
            >
              <FontAwesome 
                name="upload" 
                size={18} 
                color={activeTab === 'custom' ? '#FF6347' : '#f7e8d3'} 
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, activeTab === 'custom' ? styles.activeTabText : null]}>
                My Photos
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Content area - changes based on active tab */}
          <View style={styles.contentContainer}>
            {activeTab === 'themes' ? (
              // Theme wallpapers tab with categories
              <View style={styles.themesContent}>
                {/* Theme category tabs */}
                {renderThemeCategoryTabs()}
                
                <Animated.View style={{ opacity: categoryFadeAnim, flex: 1 }}>
                  <ScrollView contentContainerStyle={styles.optionsGrid}>
                    {wallpaperCategories[activeThemeCategory].map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.wallpaperOption,
                          selectedWallpaper.type === 'preset' && 
                          selectedWallpaper.value === option.id 
                            ? styles.selectedOption 
                            : null
                        ]}
                        onPress={() => handleWallpaperSelect(option)}
                      >
                        {option.id === 'black' ? (
                          <View style={[styles.wallpaperThumbnail, { backgroundColor: '#000' }]}>
                            <Text style={styles.thumbnailMidnightText}>Midnight</Text>
                          </View>
                        ) : option.image ? (
                          <Image 
                            source={option.image} 
                            style={styles.wallpaperThumbnail}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.wallpaperThumbnail, { backgroundColor: '#333' }]}>
                            <Text style={styles.thumbnailMidnightText}>{option.name}</Text>
                          </View>
                        )}
                        <Text style={styles.optionName}>{option.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              </View>
            ) : (
              // Custom wallpapers tab
              <View style={styles.customContent}>
                {/* Add buttons always visible at top */}
                <View style={styles.uploadButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.uploadButton, styles.galleryButton]}
                    onPress={handleUploadWallpaper}
                  >
                    <FontAwesome name="image" size={20} color="#fff" />
                    <Text style={styles.uploadButtonText}>Gallery</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.uploadButton, styles.cameraButton]}
                    onPress={handleCameraCapture}
                  >
                    <FontAwesome name="camera" size={20} color="#fff" />
                    <Text style={styles.uploadButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Custom wallpapers grid */}
                {customWallpapers.length > 0 ? (
                  <ScrollView contentContainerStyle={styles.optionsGrid}>
                    {customWallpapers.map((uri, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.wallpaperOption,
                          selectedWallpaper.type === 'custom' && 
                          selectedWallpaper.value === uri
                            ? styles.selectedOption 
                            : null
                        ]}
                        onPress={() => handleCustomWallpaperSelect(uri)}
                      >
                        <Image 
                          source={{ uri }} 
                          style={styles.wallpaperThumbnail}
                          resizeMode="cover"
                        />
                        <View style={styles.customWallpaperFooter}>
                          <Text style={styles.optionName}>Photo {index + 1}</Text>
                          <TouchableOpacity 
                            style={styles.removeButton}
                            onPress={() => removeCustomWallpaper(uri)}
                          >
                            <FontAwesome name="trash" size={16} color="#f7e8d3" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.noCustomWallpaper}>
                    <FontAwesome name="image" size={40} color="#f7e8d3" style={{ opacity: 0.5, marginBottom: 10 }} />
                    <Text style={styles.noWallpaperText}>No custom photos yet</Text>
                    <Text style={styles.noWallpaperSubtext}>Use the buttons above to add your own photos</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          
          {/* Footer with action buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveWallpaperSelection}
            >
              <Text style={styles.saveButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    height: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247, 232, 211, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f7e8d3',
  },
  closeButton: {
    padding: 5,
  },
  previewContainer: {
    width: '100%',
    height: '40%', // Takes 30% of the modal height
    position: 'relative',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  midnightText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: '20%',
  },
  thumbnailMidnightText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247, 232, 211, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF6347',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    color: '#f7e8d3',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6347',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1, // Takes remaining space
    backgroundColor: '#1a1a1a',
  },
  themesContent: {
    flex: 1,
    padding: 15,
  },
  themeCategoryTabs: {
    flexDirection: 'row',
    marginBottom: 15,
    height: 40,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(247, 232, 211, 0.1)',
  },
  themeCategoryTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeThemeCategoryTab: {
    backgroundColor: '#FF6347',
  },
  themeCategoryTabText: {
    color: '#f7e8d3',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeThemeCategoryTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
    alignSelf: 'center',
  },
  customContent: {
    flex: 1,
    padding: 15,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 15,
  },
  wallpaperOption: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#FF6347',
  },
  wallpaperThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 6,
  },
  optionName: {
    textAlign: 'center',
    padding: 8,
    color: '#f7e8d3',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
  },
  customWallpaperFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  removeButton: {
    padding: 5,
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  uploadButton: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  galleryButton: {
    backgroundColor: '#4A90E2', // Blue for gallery
    marginRight: 8,
  },
  cameraButton: {
    backgroundColor: '#FF6347', // Red for camera
    marginLeft: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noCustomWallpaper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noWallpaperText: {
    color: '#f7e8d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noWallpaperSubtext: {
    color: '#f7e8d3',
    opacity: 0.7,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(247, 232, 211, 0.2)',
  },
  cancelButton: {
    backgroundColor: 'rgba(247, 232, 211, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#f7e8d3',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default WallpaperCustomization;