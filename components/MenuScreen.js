import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  ScrollView, 
  Alert, 
  Modal, 
  Dimensions, 
  StyleSheet, 
  Platform,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
  BackHandler,
  Easing
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUser } from "../hooks/userHook.js";
import Wiki from '../screens/Wiki.js';
import { getWallpaperSource } from '../utility/wallpaperUtils';
import { Menu } from 'react-native-paper';
import { setAppStatusBar } from '../utility/statusBarUtils';

const { width, height } = Dimensions.get('window');

// Memoize version history data to prevent unnecessary re-renders
const versionHistory = [
  {
    version: "v1.0",
    date: "2024-03-15",
    changes: [
      'Initial release',
      'Task management system',
      'Timer functionality',
      'Basic user interface',
      'User authentication'
    ]
  }
];

const MenuScreen = ({ 
  isVisible, 
  onClose,
  highestPriorityTask,
  onTimerComplete,
  wallpaperSetting = { type: 'preset', value: 'default' },
  preRender = false // Add this prop
}) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const { user, logout } = useUser();
  const [levelData, setLevelData] = useState({ level: 1, currentXP: 0, nextLevelXP: 100 });
  const [showWiki, setShowWiki] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Simple fade animation for better performance
  const fadeAnimation = useMemo(() => new Animated.Value(0), []);
  
  // Icon-specific animation for the selected button
  const iconFadeAnimation = useRef(new Animated.Value(1)).current;
  
  // Prepare wallpaper source
  const wallpaperSource = useMemo(() => 
    getWallpaperSource(wallpaperSetting),
    [wallpaperSetting]
  );
  
  // Determine if the wallpaper is dark (to adapt text colors)
  const isDarkWallpaper = useMemo(() => {
    return wallpaperSetting?.type === 'preset' && wallpaperSetting?.value === 'black';
  }, [wallpaperSetting]);
  
  // Handle close with simple fade out animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => { 
      onClose();
      setIsClosing(false);
    });
  }, [fadeAnimation, onClose]);

  const handleCloseWiki = useCallback(() => {
    setShowWiki(false);
  }, []);

  // Memoize menu items to prevent recreating on each render
  const menuItems = useMemo(() => [
    { 
      icon: "user-o", 
      text: t('menu.profile'), 
      onPress: () => {
        handleClose();
        setTimeout(() => {
          navigation.navigate('Profile');
        }, 300);
      }
    },    
    { 
      icon: "snowflake-o", 
      text: t('menu.myndCooling'), 
      onPress: () => {   
        handleClose();     
        setTimeout(() => {
          navigation.navigate('MyndCooling');
        }, 300);
      }
    },
    { 
      icon: "money", 
      text: t('menu.myndBudget'), 
      onPress: () => {
        handleClose();
        setTimeout(() => {
          navigation.navigate('MyndBudget');
        }, 300);
      }
    },
    { 
      icon: "smile-o", 
      text: t('menu.myndChecker'), 
      onPress: () => {
        handleClose();
        setTimeout(() => {
          navigation.navigate('MoodChecker');
        }, 300);
      }
    },
    { 
      icon: "tasks", 
      text: t('menu.organization'), 
      onPress: () => {
        handleClose();
        setTimeout(() => {
          navigation.navigate('Organization');
        }, 300);
      }
    },
    { 
      icon: "trophy", 
      text: t('menu.leaderboard'), 
      onPress: () => {
        handleClose();
        setTimeout(() => {
          navigation.navigate('Leaderboard');
        }, 300);
      }
    },
    { 
      icon: "users", 
      text: t('menu.community'), 
      disabled: true,
      comingSoon: true 
    },
    { 
      icon: "image", 
      text: t('menu.customizeArne'), 
      disabled: true,
      comingSoon: true 
    },
    { 
      icon: "calendar", 
      text: t('home.calendar'), 
      disabled: true,
      comingSoon: true 
    },
    { 
      icon: "star", 
      text: t('menu.subscription'), 
      disabled: true,
      comingSoon: true 
    }
  ], [t, navigation, handleClose]);

  const [selectedItem, setSelectedItem] = useState(null);

  // Simple fade in animation when menu becomes visible
  useEffect(() => {
    if (isVisible) {
      // Set initial state immediately (zero delay)
      fadeAnimation.setValue(0);
      
      // Use requestAnimationFrame to ensure UI is updated before animation starts
      requestAnimationFrame(() => {
        // Adding a very small delay can help with rendering issues
        setTimeout(() => {
          Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease), // Using a different easing function
          }).start();
        }, 10); // Small delay (10ms) to let render complete first
      });
    }
  }, [isVisible, fadeAnimation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isVisible) {
        handleClose();
        return true; // Prevent default back behavior
      }
      return false; // Let default back behavior happen
    });
  
    return () => backHandler.remove();
  }, [isVisible, handleClose]);

  // Set initial selected item when menu becomes visible
  useEffect(() => {
    if (isVisible && menuItems.length > 0 && !selectedItem) {
      setSelectedItem(menuItems[0]);
    }
  }, [isVisible, menuItems, selectedItem]);

  // Cross-platform status bar management
  useEffect(() => {
    if (isVisible) {
      // Set status bar based on wallpaper darkness
      setAppStatusBar(isDarkWallpaper ? 'dark' : 'light');
      
      // Ensure proper cleanup on unmount
      return () => {
        setAppStatusBar('dark'); // Reset to app default
      };
    }
  }, [isVisible, isDarkWallpaper]);

  // Animate the icon when selected item changes
  const handleItemSelect = useCallback((item) => {
    if (!item.disabled) {
      // Animate the icon fade out and in
      Animated.sequence([
        Animated.timing(iconFadeAnimation, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(iconFadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      setSelectedItem(item);
    }
  }, [iconFadeAnimation]);

  // Filter menu items once instead of on each render
  const activeItems = useMemo(() => 
    menuItems.filter(item => !item.comingSoon),
    [menuItems]
  );
  
  const comingSoonItems = useMemo(() => 
    menuItems.filter(item => item.comingSoon),
    [menuItems]
  );
  
  // Modified code to prevent glitching
  // Don't render at all if not visible and preRender is false
  if (!isVisible && !preRender) return null;
  
  // Otherwise, render but with opacity control for smooth transitions
  return (
    <View style={[
      StyleSheet.absoluteFill, 
      styles.menuScreenContainer,
      // When using preRender, we control visibility with opacity and pointer events
      preRender ? {
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        // Using hardware acceleration when possible
        ...(Platform.OS === 'android' ? { renderToHardwareTextureAndroid: true } : {})
      } : {}
    ]}>
      {/* Background with wallpaper support */}
      {wallpaperSetting?.type === 'preset' && wallpaperSetting?.value === 'black' ? (
        // Black background
        <Animated.View 
          style={[
            styles.backgroundOverlay, 
            { 
              opacity: fadeAnimation,
              zIndex: 0,
              backgroundColor: '#000000'
            }
          ]} 
        />
      ) : (
        // Wallpaper background - same as HomeScreen
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            opacity: fadeAnimation,
            zIndex: 0,
          }}
        >
          <ImageBackground
            source={wallpaperSource}
            style={styles.backgroundOverlay}
            resizeMode={Platform.OS === 'android' ? 'cover' : undefined}
          >
            <View style={styles.backgroundTint} />
          </ImageBackground>
        </Animated.View>
      )}
      
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnimation,
            transform: [{ 
              translateY: fadeAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }) 
            }],
            zIndex: 2
          }
        ]}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuTitleContainer}>
            <View style={styles.titleTextContainer}>
              <Text style={styles.menuTitle}>
                {t('menu.title')}
              </Text>
            </View>
          </View>

          <View style={styles.mainContentContainer}>
            <View style={styles.iconContainer}>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  selectedItem && !selectedItem.disabled && styles.iconButtonSelected
                ]}
                onPress={selectedItem?.onPress}
                activeOpacity={0.8}
                disabled={!selectedItem || selectedItem.disabled}
              >
                <Animated.View style={{ opacity: iconFadeAnimation }}>
                  <FontAwesome
                    name={selectedItem?.icon || "user-o"}
                    size={70}
                    color={selectedItem && !selectedItem.disabled ? "#FF6347" : "#1A1A1A"}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.navigationContainer}>
            <View style={styles.titleBackground}>
              <Text style={styles.navigationTitle}>
                {t('menu.shortcuts')}
              </Text>
            </View>
            <View style={styles.navigationDivider} />
            
            {/* Use optimized ScrollView for better performance */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.navigationScroll}
              contentContainerStyle={styles.scrollContent}
              removeClippedSubviews={Platform.OS === 'android'}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
            >
              {activeItems.map((item, index) => (
                <TouchableOpacity
                  key={`active-${index}`}
                  style={[
                    styles.navigationItem,
                    isDarkWallpaper ? styles.navigationItemDark : styles.navigationItemLight,
                    selectedItem?.text === item.text && styles.navigationItemSelected
                  ]}
                  onPress={() => handleItemSelect(item)}
                  disabled={item.disabled}
                  activeOpacity={0.7}
                >
                  <FontAwesome
                    name={item.icon}
                    size={16}
                    color={item.disabled ? "#8C8C8C" : (isDarkWallpaper ? "#FFFFFF" : "#1A1A1A")}
                    style={styles.navigationIcon}
                  />
                  <Text 
                    style={[
                      styles.navigationText,
                      isDarkWallpaper ? styles.lightText : styles.darkText,
                      item.disabled && styles.navigationTextDisabled
                    ]}
                    numberOfLines={1}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* Coming Soon Section */}
              <TouchableOpacity
                style={styles.comingSoonHeader}
                onPress={() => setShowComingSoon(!showComingSoon)}
                activeOpacity={0.6}
              >
              <Text style={styles.comingSoonText}>
              {t('menu.comingSoon')} {/* Note the spelling correction */}
              </Text>
                <FontAwesome
                  name={`chevron-${showComingSoon ? 'up' : 'down'}`}
                  size={12}
                  color="#1A1A1A"
                />
              </TouchableOpacity>

              {showComingSoon && comingSoonItems.map((item, index) => (
                <TouchableOpacity
                  key={`coming-soon-${index}`}
                  style={[
                    styles.navigationItem,
                    isDarkWallpaper ? styles.navigationItemDark : styles.navigationItemLight,
                    styles.comingSoonItem,
                    selectedItem?.text === item.text && styles.navigationItemSelected
                  ]}
                  onPress={() => handleItemSelect(item)}
                  disabled={item.disabled}
                  activeOpacity={0.7}
                >
                  <FontAwesome
                    name={item.icon}
                    size={16}
                    color="#8C8C8C"
                    style={styles.navigationIcon}
                  />
                  <Text 
                    style={styles.comingSoonItemText}
                    numberOfLines={1}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.settingsGroup}>
              {/* MyndWiki Button - Black with white text */}
              <TouchableOpacity 
                style={styles.wikiButton}
                onPress={() => setShowWiki(true)}
                activeOpacity={0.8}
              >
                <FontAwesome name="lightbulb-o" size={20} color="#FFFFFF" />
                <Text style={styles.wikiText}>{t('menu.myndWiki')}</Text>
              </TouchableOpacity>

              <View style={styles.settingsDivider} />

              <TouchableOpacity 
                style={[
                  styles.settingButton,
                  isDarkWallpaper ? styles.settingButtonDark : styles.settingButtonLight
                ]}
                onPress={() => {
                  Alert.alert(
                    t('menu.logoutConfirm'),
                    t('menu.logoutMessage'),
                    [
                      { text: t('menu.cancel'), style: 'cancel' },
                      { 
                        text: t('menu.confirmLogout'),
                        onPress: async () => {
                          try {
                            handleClose();
                            setTimeout(async () => {
                              await logout();
                            }, 300);
                          } catch (error) {
                            console.error("Error during logout:", error);
                            Alert.alert(t('generalError.error'), t('menu.logoutError'));
                          }
                        },
                        style: 'destructive'
                      }
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <FontAwesome 
                  name="sign-out" 
                  size={20} 
                  color={isDarkWallpaper ? "#FFFFFF" : "#1A1A1A"} 
                />
                <Text style={[styles.settingText, isDarkWallpaper ? styles.lightText : styles.darkText]}>
                  {t('menu.logout')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.settingButton,
                  isDarkWallpaper ? styles.settingButtonDark : styles.settingButtonLight
                ]}
                onPress={() => {
                  const newLang = i18n.language === 'en' ? 'ja' : 'en';
                  i18n.changeLanguage(newLang);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.settingText, isDarkWallpaper ? styles.lightText : styles.darkText]}>
                  {i18n.language === 'en' ? '日本語' : 'EN'}
                </Text>
              </TouchableOpacity>

              {/* Orange Close Button */}
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleClose}
                activeOpacity={0.8}
                disabled={isClosing}
              >
                {isClosing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.closeButtonText}>{t('menu.close')}</Text>
                )}
              </TouchableOpacity>

              {/* Version Button */}
              <TouchableOpacity 
                style={styles.versionButton}
                onPress={() => setShowAboutModal(true)}
                activeOpacity={0.6}
              >
                <View style={[styles.versionTextContainer, isDarkWallpaper ? styles.versionTextContainerDark : styles.versionTextContainerLight]}>
                  <Text style={[styles.versionText, isDarkWallpaper ? styles.lightText : styles.darkText]}>
                    v1.0 {levelData?.level ? `| ${t('profile.level')} ${levelData.level}` : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Version History Modal */}
      <Modal
        visible={showVersionInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVersionInfo(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.versionOverlay}>
          <View style={styles.versionContent}>
            <View style={styles.versionHeader}>
              <Text style={styles.versionTitle}>{t('menu.versionHistory')}</Text>
              <TouchableOpacity 
                onPress={() => setShowVersionInfo(false)}
                style={styles.versionCloseButton}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <FontAwesome name="times" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.versionList}
              showsVerticalScrollIndicator={Platform.OS === 'ios'}
            >
              {versionHistory.map((version, index) => (
                <View key={index} style={styles.versionItem}>
                  <View style={styles.versionItemHeader}>
                    <Text style={styles.versionNumber}>{version.version}</Text>
                    <Text style={styles.versionDate}>{version.date}</Text>
                  </View>
                  {version.changes.map((change, changeIndex) => (
                    <View key={changeIndex} style={styles.changeItem}>
                      <FontAwesome name="circle" size={6} color="#FF6347" style={styles.changeBullet} />
                      <Text style={styles.changeText}>{change}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.versionOverlay}>
          <View style={styles.aboutContent}>
            <View style={styles.versionHeader}>
              <Text style={styles.versionTitle}>About MyndManage</Text>
              <TouchableOpacity 
                onPress={() => setShowAboutModal(false)}
                style={styles.versionCloseButton}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <FontAwesome name="times" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.aboutContentScroll}>
              <Text style={styles.aboutHeading}>MyndManage v1.0</Text>
              <Text style={styles.aboutText}>
                MyndManage is a productivity application designed specifically for people with ADHD. 
                It provides a structured environment to help you manage tasks, track progress, 
                and improve focus through specialized timers and reminders.
              </Text>
              
              <Text style={styles.aboutHeading}>Key Features</Text>
              <View style={styles.featureItem}>
                <FontAwesome name="check-circle" size={16} color="#FF6347" style={styles.featureBullet} />
                <Text style={styles.featureText}>Task Management System</Text>
              </View>
              <View style={styles.featureItem}>
                <FontAwesome name="check-circle" size={16} color="#FF6347" style={styles.featureBullet} />
                <Text style={styles.featureText}>Focus Timers</Text>
              </View>
              <View style={styles.featureItem}>
                <FontAwesome name="check-circle" size={16} color="#FF6347" style={styles.featureBullet} />
                <Text style={styles.featureText}>Priority-Based Organization</Text>
              </View>
              <View style={styles.featureItem}>
                <FontAwesome name="check-circle" size={16} color="#FF6347" style={styles.featureBullet} />
                <Text style={styles.featureText}>Mood Tracking</Text>
              </View>
              <View style={styles.featureItem}>
                <FontAwesome name="check-circle" size={16} color="#FF6347" style={styles.featureBullet} />
                <Text style={styles.featureText}>Budget Management</Text>
              </View>
              
              <Text style={styles.aboutHeading}>Get in Touch</Text>
              <Text style={styles.aboutText}>
                We're continuously improving MyndManage based on user feedback. 
                If you have suggestions or encounter any issues, please reach out through the app's 
                feedback feature or contact our support team.
              </Text>
              
              <TouchableOpacity 
                style={styles.versionHistoryButton}
                onPress={() => {
                  setShowAboutModal(false);
                  setTimeout(() => setShowVersionInfo(true), 300);
                }}
              >
                <Text style={styles.versionHistoryText}>View Version History</Text>
              </TouchableOpacity>
              
              <View style={styles.copyrightContainer}>
                <Text style={styles.copyrightText}>© 2025 MyndManage. All rights reserved.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Wiki Modal */}
      {showWiki && (
        <Wiki
          visible={showWiki}
          onClose={handleCloseWiki}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  menuScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F7E8D3',
    zIndex: 0,
  },
  backgroundTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Darker overlay for better contrast
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        zIndex: 3,
      },
      android: {
        elevation: 3,
      }
    }),
  },
  menuContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  menuTitleContainer: {
    width: 40, // Increased width to accommodate text
    alignItems: 'center',
    marginRight: 15,
  },
  titleTextContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 10,
    width: 40, // Fixed width to ensure consistent sizing
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 8,
    lineHeight: 35,
    color: '#FFFFFF', // Always white for better contrast
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-light',
      }
    }),
  },
  mainContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      }
    }),
  },
  iconButtonSelected: {
    ...Platform.select({
      ios: {
        shadowColor: '#FF6347',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      }
    }),
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: 'rgba(255, 99, 71, 0.5)',
  },
  navigationContainer: {
    width: '30%',
    maxWidth: 200,
    marginLeft: 15,
    backgroundColor: 'transparent',
    borderRadius: 25,
    padding: 15,
    flex: 1,
    flexDirection: 'column',
  },
  titleBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF', // Always white for better contrast
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      }
    }),
  },
  navigationDivider: {
    height: 2,
    backgroundColor: '#FF6347',
    opacity: 0.5,
    marginBottom: 12,
  },
  navigationScroll: {
    flexGrow: 0,
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  navigationItemLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Semi-transparent white for light backgrounds
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  navigationItemDark: {
    backgroundColor: 'rgba(40, 40, 40, 0.85)', // Semi-transparent dark gray for dark backgrounds
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navigationItemSelected: {
    backgroundColor: 'rgba(255, 99, 71, 0.25)', // More translucent selection
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 71, 0.7)', // Border for better visibility
  },
  navigationIcon: {
    marginRight: 12,
  },
  navigationText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      }
    }),
  },
  navigationTextDisabled: {
    color: '#8C8C8C',
  },
  comingSoonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.3)',
    justifyContent: 'space-between',
    backgroundColor: '#F7E8D3', // Fixed cream background color as requested
    borderRadius: 12, // Rounded corners like other buttons
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A', // Fixed dark text color as requested
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      }
    }),
  },
  comingSoonItem: {
    opacity: 0.7
  },
  comingSoonItemText: {
    color: '#8C8C8C',
    fontSize: 11,
    fontWeight: '500',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      }
    }),
  },
  settingsGroup: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.3)',
    gap: 8,
    paddingTop: 15,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingButtonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(26, 26, 26, 0.3)',
  },
  settingButtonDark: {
    backgroundColor: 'rgba(40, 40, 40, 0.85)',
    borderColor: 'rgba(200, 200, 200, 0.3)',
  },
  wikiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      }
    }),
  },
  wikiText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    textAlign: 'center',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      }
    }),
  },
  settingText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    textAlign: 'center',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      }
    }),
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    marginVertical: 8,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: '#FF6347', // Keeping the orange color
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      }
    }),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      }
    }),
  },
  versionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  versionTextContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  versionTextContainerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  versionTextContainerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '400',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      }
    }),
  },
  versionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for better contrast
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...Platform.select({
      android: {
        paddingTop: StatusBar.currentHeight || 0
      }
    })
  },
  versionContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      }
    }),
  },
  aboutContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      }
    }),
  },
  aboutContentScroll: {
    flex: 1,
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  versionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      }
    }),
  },
  versionCloseButton: {
    padding: 5,
  },
  versionList: {
    flex: 1,
  },
  versionItem: {
    marginBottom: 25,
  },
  versionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  versionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      }
    }),
  },
  versionDate: {
    fontSize: 12,
    color: '#666666',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      }
    }),
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 4,
  },
  changeBullet: {
    marginRight: 10,
    marginTop: 6,
  },
  changeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#1A1A1A',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      }
    }),
  },
  aboutHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      }
    }),
  },
  aboutText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
    marginBottom: 16,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      }
    }),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 4,
  },
  featureBullet: {
    marginRight: 10,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      }
    }),
  },
  versionHistoryButton: {
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  versionHistoryText: {
    color: '#FF6347',
    fontSize: 14,
    fontWeight: '500',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-medium',
      }
    }),
  },
  copyrightContainer: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#8C8C8C',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      }
    })
  },
  // Text color styles for adaptive visibility
  lightText: {
    color: '#FFFFFF',
  },
  darkText: {
    color: '#1A1A1A',
  },
  lightMutedText: {
    color: '#CCCCCC',
  },
  darkMutedText: {
    color: '#666666',
  }
});

export default React.memo(MenuScreen);