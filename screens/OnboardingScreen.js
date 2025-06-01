import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { FontAwesome } from "@expo/vector-icons";
import { useUser } from '../hooks/userHook';
import { updateDocument } from '../screens/firebase-services.js';
import arneImage from '../assets/Arne.jpeg';

const OnboardingScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  // Comprehensive user profile state
  const [userProfile, setUserProfile] = useState({
    gender: '', // Add this line
    nickname: '',
    adhdStatus: '',
    primaryChallenges: [],
    workEnvironment: '',
    workStyle: '',
    timePreference: '',
    distractionTriggers: [],
    supportNeeds: [],
    learningStyle: '',
    completedOnboarding: false
  });

  // Define all onboarding stages
  const stages = [
    {
      id: 'gender',
      title: t('onboarding.gender.title'),
      subtitle: t('onboarding.gender.subtitle'),
      options: [
        { id: '1', label: t('onboarding.gender.options.male'), image: require('../assets/1.png') },
        { id: '2', label: t('onboarding.gender.options.female'), image: require('../assets/2.png') },
        { id: '3', label: t('onboarding.gender.options.other'), image: require('../assets/3.png') }
      ],
      type: 'single',
      isGenderSelection: true
    },
    {
      id: 'adhdStatus',
      title: t('onboarding.adhd.title'),
      subtitle: t('onboarding.adhd.subtitle'),
      options: [
        { id: 'diagnosed', label: t('onboarding.adhd.options.diagnosed'), icon: 'check-circle' },
        { id: 'suspected', label: t('onboarding.adhd.options.suspected'), icon: 'question-circle' },
        { id: 'exploring', label: t('onboarding.adhd.options.exploring'), icon: 'search' }
      ],
      type: 'single'
    },
    {
      id: 'primaryChallenges',
      title: t('onboarding.challenges.title'),
      subtitle: t('onboarding.challenges.subtitle'),
      options: [
        { id: 'focus', label: t('onboarding.challenges.options.focus'), icon: 'bullseye' },
        { id: 'organization', label: t('onboarding.challenges.options.organization'), icon: 'folder-open' },
        { id: 'time', label: t('onboarding.challenges.options.time'), icon: 'clock-o' },
        { id: 'emotional', label: t('onboarding.challenges.options.emotional'), icon: 'heart' },
        { id: 'procrastination', label: t('onboarding.challenges.options.procrastination'), icon: 'hourglass-half' }
      ],
      type: 'multiple',
      max: 3
    },
    {
      id: 'workStyle',
      title: t('onboarding.workStyle.title'),
      subtitle: t('onboarding.workStyle.subtitle'),
      options: [
        { id: 'structured', label: t('onboarding.workStyle.options.structured'), icon: 'calendar' },
        { id: 'flexible', label: t('onboarding.workStyle.options.flexible'), icon: 'random' },
        { id: 'deadline', label: t('onboarding.workStyle.options.deadline'), icon: 'flag-checkered' },
        { id: 'bodyDouble', label: t('onboarding.workStyle.options.bodyDouble'), icon: 'users' }
      ],
      type: 'single'
    },
    {
      id: 'workEnvironment',
      title: t('onboarding.environment.title'),
      subtitle: t('onboarding.environment.subtitle'),
      options: [
        { id: 'quiet', label: t('onboarding.environment.options.quiet'), icon: 'volume-off' },
        { id: 'ambient', label: t('onboarding.environment.options.ambient'), icon: 'coffee' },
        { id: 'busy', label: t('onboarding.environment.options.busy'), icon: 'group' },
        { id: 'varying', label: t('onboarding.environment.options.varying'), icon: 'random' }
      ],
      type: 'single'
    },
    {
      id: 'timePreference',
      title: t('onboarding.timePreference.title'),
      subtitle: t('onboarding.timePreference.subtitle'),
      options: [
        { id: 'morning', label: t('onboarding.timePreference.options.morning'), icon: 'sun-o' },
        { id: 'afternoon', label: t('onboarding.timePreference.options.afternoon'), icon: 'cloud' },
        { id: 'evening', label: t('onboarding.timePreference.options.evening'), icon: 'moon-o' },
        { id: 'variable', label: t('onboarding.timePreference.options.variable'), icon: 'refresh' }
      ],
      type: 'single'
    },
    {
      id: 'learningStyle',
      title: t('onboarding.learning.title'),
      subtitle: t('onboarding.learning.subtitle'),
      options: [
        { id: 'visual', label: t('onboarding.learning.options.visual'), icon: 'eye' },
        { id: 'auditory', label: t('onboarding.learning.options.auditory'), icon: 'headphones' },
        { id: 'kinesthetic', label: t('onboarding.learning.options.kinesthetic'), icon: 'hand-paper-o' },
        { id: 'reading', label: t('onboarding.learning.options.reading'), icon: 'book' }
      ],
      type: 'single'
    }
  ];

  // Update progress when stage changes
  useEffect(() => {
    setProgress(((stage + 1) / stages.length) * 100);
  }, [stage]);

  // Handle user selection
  const handleSelection = (optionId) => {
    const currentStage = stages[stage];
    
    if (currentStage.type === 'multiple') {
      setUserProfile(prev => {
        const currentSelections = prev[currentStage.id] || [];
        let newSelections;
        
        if (currentSelections.includes(optionId)) {
          newSelections = currentSelections.filter(id => id !== optionId);
        } else if (currentSelections.length < (currentStage.max || 3)) {
          newSelections = [...currentSelections, optionId];
        } else {
          Alert.alert(
            t('onboarding.alert.maxSelection.title'),
            t('onboarding.alert.maxSelection.message')
          );
          newSelections = [...currentSelections.slice(1), optionId];
        }
        
        return {
          ...prev,
          [currentStage.id]: newSelections
        };
      });
    } else {
      setUserProfile(prev => ({
        ...prev,
        [currentStage.id]: optionId
      }));
    }
  };

  // Animation function
  const animateTransition = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  // Navigate to next stage
  const handleNext = () => {
    const currentStage = stages[stage];
    const currentValue = userProfile[currentStage.id];
  
    // Improved validation check
    const isValid = currentStage.type === 'multiple' 
      ? Array.isArray(currentValue) && currentValue.length > 0
      : currentValue !== undefined && currentValue !== '';
  
    if (!isValid) {
      Alert.alert(
        t('onboarding.alert.required.title'),
        t('onboarding.alert.required.message')
      );
      return;
    }
  
    if (stage === stages.length - 1) {
      saveUserData();
    } else {
      animateTransition();
      setStage(prev => prev + 1);
    }
  };


  // Navigate to previous stage
  const handleBack = () => {
    if (stage > 0) {
      animateTransition();
      setStage(prev => prev - 1);
    }
  };

  // Save user data to Firebase
  const saveUserData = async () => {
    setIsLoading(true);
    try {
      const userData = {
        ...userProfile,
        completedOnboarding: true,
        updatedAt: new Date()
      };

      await updateDocument('users', user.uid, userData);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert(
        t('onboarding.alert.error.title'),
        t('onboarding.alert.error.message')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Welcome modal component
  const renderWelcomeModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Image source={arneImage} style={styles.arneImage} />
          <Text style={styles.modalTitle}>{t('onboarding.welcome.title')}</Text>
          <Text style={styles.modalText}>{t('onboarding.welcome.message')}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>{t('onboarding.welcome.start')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderCurrentStage = () => {
    const currentStage = stages[stage];
    
    return (
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <View style={styles.stageHeader}>
          <Text style={styles.stageTitle}>{currentStage.title}</Text>
          <Text style={styles.stageSubtitle}>{currentStage.subtitle}</Text>
        </View>
  
        <ScrollView style={styles.optionsContainer}>
          {currentStage.isGenderSelection ? (
            <View style={styles.genderContainer}>
              {currentStage.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.genderOption,
                    userProfile.gender === option.id && styles.activeGenderOption
                  ]}
                  onPress={() => handleSelection(option.id)}
                >
                  <Image 
                    source={option.image} 
                    style={styles.genderImage} 
                    resizeMode="contain"
                  />
                  <Text style={styles.genderText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            currentStage.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  currentStage.type === 'multiple' 
                    ? userProfile[currentStage.id]?.includes(option.id) && styles.activeButton
                    : userProfile[currentStage.id] === option.id && styles.activeButton
                ]}
                onPress={() => handleSelection(option.id)}
              >
                <FontAwesome 
                  name={option.icon} 
                  size={24} 
                  color={
                    (currentStage.type === 'multiple' 
                      ? userProfile[currentStage.id]?.includes(option.id)
                      : userProfile[currentStage.id] === option.id)
                    ? "#f7e8d3" 
                    : "#FF6347"
                  }
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
  
        {/* Continue button for both single and multiple selections */}
        <TouchableOpacity 
          style={[
            styles.nextButton,
            (!userProfile[currentStage.id] || 
             (Array.isArray(userProfile[currentStage.id]) && 
              userProfile[currentStage.id].length === 0)) && 
            styles.disabledButton
          ]} 
          onPress={handleNext}
          disabled={
            !userProfile[currentStage.id] || 
            (Array.isArray(userProfile[currentStage.id]) && 
             userProfile[currentStage.id].length === 0) || 
            isLoading
          }
        >
          {isLoading ? (
            <ActivityIndicator color="#f7e8d3" />
          ) : (
            <Text style={styles.nextButtonText}>
              {stage === stages.length - 1 
                ? t('onboarding.common.complete') 
                : t('onboarding.common.continue')}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {renderWelcomeModal()}
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: `${progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {stage + 1} of {stages.length}
        </Text>
      </View>

      {stage > 0 && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <FontAwesome name="arrow-left" size={24} color="#FF6347" />
        </TouchableOpacity>
      )}

      {renderCurrentStage()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 16,
  },

  // Welcome Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6347',
  },
  arneImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FF6347',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f7e8d3',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#f7e8d3',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalButtonText: {
    color: '#f7e8d3',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Progress Bar Styles
  progressContainer: {
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(247, 232, 211, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6347',
    borderRadius: 4,
  },
  progressText: {
    color: '#f7e8d3',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
    opacity: 0.8,
  },

  // Stage Header Styles
  stageHeader: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f7e8d3',
    marginBottom: 8,
  },
  stageSubtitle: {
    fontSize: 14,
    color: '#f7e8d3',
    opacity: 0.8,
    lineHeight: 20,
  },

  // Options Container and Buttons
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 71, 0.3)',
  },
  activeButton: {
    backgroundColor: '#FF6347',
    borderColor: '#FF6347',
  },
  optionIcon: {
    width: 24,
    textAlign: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#f7e8d3',
    flex: 1,
    paddingRight: 10, // Prevent text from touching the right edge
  },

  // Navigation Buttons
  backButton: {
    position: 'absolute',
    top: 45,
    left: 16,
    zIndex: 1,
    padding: 8,
  },

  nextButton: {
    backgroundColor: '#FF6347',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 16,
  },
  nextButtonText: {
    color: '#f7e8d3',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 99, 71, 0.3)',
    opacity: 0.7,
  },

  // Multiple Selection Indicator
  selectionIndicator: {
    position: 'absolute',
    right: 12,
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectionIndicatorText: {
    color: '#f7e8d3',
    fontSize: 12,
    fontWeight: '500',
  },

  // Loading State
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  loadingText: {
    color: '#f7e8d3',
    marginTop: 15,
    fontSize: 16,
  },

  // Helper Text
  helperText: {
    fontSize: 12,
    color: '#f7e8d3',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
  },

  // Animation Container
  animationContainer: {
    flex: 1,
    width: '100%',
  },

  // Error States
  errorContainer: {
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  errorText: {
    color: '#FF6347',
    fontSize: 14,
    textAlign: 'center',
  },

  // Option Description (for additional context)
  optionDescription: {
    fontSize: 14,
    color: '#f7e8d3',
    opacity: 0.7,
    marginTop: 4,
    marginLeft: 45, // Aligns with option text
  },

  // Selected Option Indicator
  checkmark: {
    position: 'absolute',
    right: 20,
    color: '#f7e8d3',
  },

  // Multiple Selection Max Indicator
  maxSelectionIndicator: {
    position: 'absolute',
    top: -8,
    right: 15,
    backgroundColor: '#FF6347',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  maxSelectionText: {
    color: '#f7e8d3',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Progress Section Title
  sectionProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  sectionTitle: {
    color: '#f7e8d3',
    fontSize: 14,
    opacity: 0.9,
  },

  // Skip Button (if needed)
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipButtonText: {
    color: '#FF6347',
    fontSize: 16,
    fontWeight: '500',
  },

  // Toast Message
  toastContainer: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 99, 71, 0.9)',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: '#f7e8d3',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },

// Gender Selection Styles
genderContainer: {
  paddingHorizontal: 10,
  marginTop: 10,
},
genderOption: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 16,
  borderRadius: 12,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: 'rgba(255, 99, 71, 0.3)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
},
activeGenderOption: {
  backgroundColor: '#FF6347',
  borderColor: '#FF6347',
},
genderImage: {
  width: 60,
  height: 60,
  marginRight: 15,
},
genderText: {
  color: '#f7e8d3',
  fontSize: 16,
  flex: 1,
  fontWeight: '500',
},

      // Completion Modal Styles
  completionContainer: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionContent: {
    alignItems: 'center',
    padding: 30,
  },
  checkmarkContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
    borderWidth: 2,
    borderColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f7e8d3',
    marginBottom: 10,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 16,
    color: '#f7e8d3',
    textAlign: 'center',
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#f7e8d3',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#f7e8d3',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 71, 0.3)',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  toggleText: {
    color: '#f7e8d3',
    fontSize: 16,
  }
});

export default OnboardingScreen;