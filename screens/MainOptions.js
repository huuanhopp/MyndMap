import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, ActionSheetIOS, Alert, ActivityIndicator, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as AppleAuthentication from 'expo-apple-authentication';
// Import Firebase services from our centralized module
import { 
  auth,  
  getDocument, 
  setDocument
} from "../firebase/init";
import { OAuthProvider, signInWithCredential } from 'firebase/auth';
import { useUser } from '../hooks/userHook';
import { useTranslation } from 'react-i18next';
import ParticleAnimation from './ParticleAnimation';

const MainOptions = () => {
  const navigation = useNavigation();
  const { user, login, loading } = useUser();
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const loadingFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAppleSignIn();
    handleInitialAnimation();
  }, [loading]);

  const checkAppleSignIn = async () => {
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      setIsAppleSignInAvailable(available);
    } catch (error) {
      console.error('Error checking Apple Sign In availability:', error);
      setIsAppleSignInAvailable(false);
    }
  };

  const handleInitialAnimation = () => {
    if (loading) {
      Animated.timing(loadingFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 100);
    }
  };

  const handleAppleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      // Get credentials from Apple
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      if (!credential.identityToken) {
        throw new Error('No identity token provided by Apple');
      }
      
      // Create Apple provider credential using Firebase v9+ web SDK
      const provider = new OAuthProvider('apple.com');
      const appleCredential = provider.credential({
        idToken: credential.identityToken,
        rawNonce: credential.nonce
      });
      
      // Sign in with Firebase using the credential
      const userCredential = await signInWithCredential(auth, appleCredential);
      const user = userCredential.user;
      const userEmail = credential.email || user.email || `apple_user_${user.uid}@example.com`;
      
      // Use our userHook login function
      await login(userCredential);
      
      // Check if user exists in Firestore
      const userDoc = await getDocument("users", user.uid);
      
      if (!userDoc) {
        // Create new user document if it doesn't exist
        await setDocument("users", user.uid, {
          email: userEmail,
          displayName: credential.fullName ? 
            `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() : 
            "Apple User",
          createdAt: new Date(),
          lastLogin: new Date(),
          completedOnboarding: false
        });
        navigation.navigate("Onboarding");
      } else {
        // Update existing user
        await setDocument("users", user.uid, { lastLogin: new Date() }, { merge: true });
        if (!userDoc.completedOnboarding) {
          navigation.navigate("Onboarding");
        } else {
          navigation.navigate("Home");
        }
      }
    } catch (e) {
      console.error("Apple Sign In Error:", e);
      if (e.code !== 'ERR_CANCELED') {
        Alert.alert(
          t('general.signInError'),
          t('general.signInErrorMessage'),
          [{ text: t('general.ok') }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showMoreOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('general.cancel'), t('mainOptions.loginWithEmail')],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            navigation.navigate("Login");
          }
        }
      );
    } else {
      navigation.navigate("Login");
    }
  };

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(newLang);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
        <Animated.View style={{ opacity: loadingFadeAnim }}>
          <ActivityIndicator size="large" color="#000000" />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.containerWrapper}>
      <View style={StyleSheet.absoluteFill}>
        <ParticleAnimation />
      </View>
      
      <View style={styles.mainContent}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Image 
            source={require("../assets/mynd.png")} 
            style={styles.logo}
            accessible={true}
            accessibilityLabel={t('mainOptions.logoAlt')}
          />
          <Text style={styles.collaborationText}>
            {t('mainOptions.collaboration')}
          </Text>
          <Image 
            source={require("../assets/Designer-4.png")} 
            style={styles.optionsLogo}
            accessible={true}
            accessibilityLabel={t('mainOptions.optionsLogoAlt')}
          />
          <Text style={styles.captionText}>
            {t('mainOptions.caption')}
          </Text>

          <View style={styles.buttonsContainer}>
            {isAppleSignInAvailable && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={5}
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              />
            )}

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => navigateToScreen("Signup")}
              activeOpacity={0.7}
            >
              <Icon name="envelope" size={24} color="#F7e8d3" style={styles.buttonIcon} />
              <Text style={styles.signUpButtonText}>{t('mainOptions.signUpEmail')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.languageToggle}
              onPress={toggleLanguage}
              activeOpacity={0.7}
            >
              <Text style={styles.languageToggleText}>
                {i18n.language === 'en' ? '日本語' : 'English'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreOptionsButton}
              onPress={showMoreOptions}
              activeOpacity={0.7}
            >
              <Text style={styles.moreOptionsText}>{t('mainOptions.moreOptions')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.legalButtonsContainer}>
            <TouchableOpacity 
              style={styles.legalButton} 
              onPress={() => navigateToScreen("PrivacyPolicy")}
              activeOpacity={0.7}
            >
              <Text style={styles.legalButtonText}>{t('mainOptions.privacyPolicy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.legalButton} 
              onPress={() => navigateToScreen("TermsOfService")}
              activeOpacity={0.7}
            >
              <Text style={styles.legalButtonText}>{t('mainOptions.termsOfService')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {isLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loader]}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 75,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 5,
    resizeMode: "contain",
  },
  collaborationText: {
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 5,
    textAlign: "center",
  },
  optionsLogo: {
    width: "70%",
    height: undefined,
    aspectRatio: 1,
    marginBottom: 20,
    resizeMode: "contain",
    borderWidth: 1,          // Add a thin border
    borderColor: "#1a1a1a",  // Use the cream color you specified
    borderRadius: 10,        // Optional: add some rounded corners
  },
  captionText: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 30,
    paddingBottom: 10,
    textAlign: "center",
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  appleButton: {
    width: '80%',
    height: 44,
    marginBottom: 20,
  },
  signUpButton: {
    backgroundColor: '#1a1a1a',
    borderColor: '#FF6347',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: "#F7e8d3",
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  languageToggle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1a1a1a',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
  },
  languageToggleText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: 'bold',
  },
  moreOptionsButton: {
    padding: 10,
  },
  moreOptionsText: {
    color: "#1a1a1a",
    fontSize: 14,
    fontWeight: 'bold',
  },
  legalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    width: '100%',
    paddingHorizontal: 20,
  },
  legalButton: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  legalButtonText: {
    color: '#1a1a1a',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: "bold"
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default MainOptions;