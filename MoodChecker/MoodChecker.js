import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
  FlatList,
  ImageBackground,
  Vibration,
  Platform,
  BackHandler,
  Alert
} from 'react-native';
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { db, auth, createDocument, queryDocuments } from '../screens/firebase-services.js';

// Import our custom modules
import generateConversation from './MoodCheckerConversation';
import CustomInputModal from './CustomInputModal';
import {
  getTimeOfDay,
  needsPersonalizedOptions
} from './MoodCheckerData';

const { width, height } = Dimensions.get('window');

// Custom animated message component
const Message = React.memo(({ message, style, onLayout }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
      onLayout={onLayout}
    >
      <View style={[styles.messageContainer, style]}>
        <Text style={styles.messageText}>{message.text}</Text>
      </View>
    </Animated.View>
  );
});

const MoodChecker = ({ onClose, animatedValue }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [currentStepId, setCurrentStepId] = useState(null);
  const [conversationSteps, setConversationSteps] = useState([]);
  const [userData, setUserData] = useState({
    mood: '',
    issue: '',
    specificIssue: '',
    intensity: '',
    customInput: '',
    scheduleOption: '',
    previousVisits: 0,
    sessionDate: new Date().toISOString()
  });
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [showProgressIndicator, setShowProgressIndicator] = useState(true);
  const [useHaptics, setUseHaptics] = useState(true);
  const [showCustomInputModal, setShowCustomInputModal] = useState(false);
  const [customInputTitle, setCustomInputTitle] = useState('');
  const [scheduleReminder, setScheduleReminder] = useState(false);

  const flatListRef = useRef();
  const optionsScrollViewRef = useRef();
  const optionsAnim = useRef(new Animated.Value(0)).current;

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackPress();
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, [currentStepId]);

  // Load user preferences and history
  useEffect(() => {
    loadPreferences();
  }, []);

  // Set up conversation flow
  useEffect(() => {
    if (moodHistory.length > 0) {
      const conversation = generateConversation(moodHistory, t);
      setConversationSteps(conversation);
      setCurrentStepId('initial-greeting');
    }
  }, [moodHistory]);

  // Start conversation when steps are loaded
  useEffect(() => {
    if (conversationSteps.length > 0 && currentStepId) {
      const currentStep = conversationSteps.find(step => step.id === currentStepId);
      if (currentStep) {
        addMessage(currentStep);
      }
    }
  }, [conversationSteps, currentStepId]);

  const loadPreferences = async () => {
    try {
      const hapticsPreference = await AsyncStorage.getItem('moodCheckerHaptics');
      if (hapticsPreference !== null) {
        setUseHaptics(JSON.parse(hapticsPreference));
      }

      // Load mood history from both Firestore and local storage
      let combinedHistory = [];

      // 1. Get local history first
      const moodHistoryData = await AsyncStorage.getItem('moodHistory');
      if (moodHistoryData) {
        const parsedHistory = JSON.parse(moodHistoryData);
        combinedHistory = [...parsedHistory];
      }

      // 2. If user is authenticated, get Firestore history and merge
      if (auth.currentUser) {
        try {
          // Query the user's mood entries from Firestore
          const conditions = [
            ["userId", "==", auth.currentUser.uid]
          ];
          const options = { orderBy: ["date", "desc"] };

          const firestoreEntries = await queryDocuments("moodEntries", conditions, options);

          if (firestoreEntries && firestoreEntries.length > 0) {
            // Merge with local history, removing duplicates by date
            const localDates = new Set(combinedHistory.map(entry => entry.date));

            // Add Firestore entries that aren't in local history
            firestoreEntries.forEach(entry => {
              if (!localDates.has(entry.date)) {
                combinedHistory.push(entry);
              }
            });

            // Sort by date, newest first
            combinedHistory.sort((a, b) =>
              new Date(b.date) - new Date(a.date)
            );

            // Update local storage with the merged history
            await savePreference('moodHistory', combinedHistory);
          }
        } catch (error) {
          console.error('Error loading mood history from Firestore:', error);
        }
      }

      // Set the combined history
      setMoodHistory(combinedHistory);

      // Get interaction count
      const interactionsCount = await AsyncStorage.getItem('moodCheckerInteractions');
      if (interactionsCount) {
        const count = parseInt(interactionsCount, 10);
        setUserData(prev => ({
          ...prev,
          previousVisits: count
        }));
      }

      // If no conversation steps yet, initialize
      if (conversationSteps.length === 0) {
        const conversation = generateConversation(combinedHistory, t);
        setConversationSteps(conversation);
        setCurrentStepId('initial-greeting');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Fallback if there's an error
      if (conversationSteps.length === 0) {
        const conversation = generateConversation([], t);
        setConversationSteps(conversation);
        setCurrentStepId('initial-greeting');
      }
    }
  };

  const savePreference = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const saveHapticsPreference = (value) => {
    setUseHaptics(value);
    savePreference('moodCheckerHaptics', value);
  };

  // Record session data
  const recordMoodData = async () => {
    if (!userData.mood || !userData.issue) return;

    const newEntry = {
      date: userData.sessionDate,
      mood: userData.mood,
      issue: userData.issue,
      specificIssue: userData.specificIssue,
      intensity: userData.intensity,
      customInput: userData.customInput,
      userId: auth.currentUser?.uid
    };

    // Save to Firestore if user is logged in
    if (auth.currentUser) {
      try {
        // Create a document in the moodEntries collection
        await createDocument('moodEntries', newEntry);
        console.log('Mood entry saved to Firestore');
      } catch (error) {
        console.error('Error saving mood entry to Firestore:', error);
      }
    }

    // Also save locally for offline access
    const updatedHistory = [...moodHistory, newEntry];
    setMoodHistory(updatedHistory);
    await savePreference('moodHistory', updatedHistory);

    // Update interaction count
    const newCount = userData.previousVisits + 1;
    setUserData(prev => ({
      ...prev,
      previousVisits: newCount
    }));
    await savePreference('moodCheckerInteractions', newCount);

    // Schedule a reminder if requested
    if (scheduleReminder) {
      scheduleReminderNotification();
    }
  };

  const scheduleReminderNotification = async () => {
    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    // Get the reminder time based on selected option
    let triggerDate = new Date();

    if (userData.scheduleOption === t('moodChecker.scheduleOptions.tomorrow')) {
      triggerDate.setDate(triggerDate.getDate() + 1);
      triggerDate.setHours(10, 0, 0); // 10:00 AM
    } else if (userData.scheduleOption === t('moodChecker.scheduleOptions.fewDays')) {
      triggerDate.setDate(triggerDate.getDate() + 3);
      triggerDate.setHours(10, 0, 0);
    } else if (userData.scheduleOption === t('moodChecker.scheduleOptions.nextWeek')) {
      triggerDate.setDate(triggerDate.getDate() + 7);
      triggerDate.setHours(10, 0, 0);
    } else {
      return; // No valid schedule option
    }

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('moodChecker.notifications.title'),
        body: t('moodChecker.notifications.body'),
        data: { screen: 'MoodChecker' },
      },
      trigger: triggerDate,
    });
  };

  const navigateToHome = () => {
    // Reset the navigation stack and navigate to Home
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }]
      })
    );
  };

  const handleBackPress = () => {
    // If conversation ended or at first step, navigate to Home
    if (isConversationEnded || currentStepId === 'initial-greeting') {
      if (onClose) {
        onClose();
      } else {
        navigateToHome();
      }
      return;
    }

    // Otherwise find the previous step in the conversation flow
    goBackOneStep();
  };

  const goBackOneStep = () => {
    // Remove the last user message and assistant response
    const updatedMessages = [...messages];
    // Remove last assistant message
    updatedMessages.pop();
    // If the last message is from user, remove it too
    if (updatedMessages[updatedMessages.length - 1]?.user) {
      updatedMessages.pop();
    }

    setMessages(updatedMessages);

    // Find appropriate previous step
    // This is simplified - in a real app you'd need to track the step history
    setCurrentStepId('initial-greeting');

    // Reset user data for the current branch
    setUserData(prev => ({
      ...prev,
      mood: '',
      issue: '',
      specificIssue: '',
      intensity: ''
    }));
  };

  useEffect(() => {
    // Animate options when they appear
    Animated.timing(optionsAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [messages]);

  const addMessage = (messageStep) => {
    // Handle function-based message text
    let messageText = messageStep.text;
    if (typeof messageText === 'function') {
      messageText = messageText(userData);
    }

    // Add the message to the conversation
    setMessages(prevMessages => [
      ...prevMessages,
      { text: messageText, step: messageStep.id }
    ]);
  };

  const renderMessage = ({ item, index }) => (
    <Message
      message={item}
      style={item.user ? styles.userMessage : styles.arneMessage}
      onLayout={(event) => onMessageLayout(event, index)}
    />
  );

  const onMessageLayout = (event, index) => {
    // Force scroll to end when messages layout changes
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleFinishButton = () => {
    // Record data before exiting
    recordMoodData();
    // Navigate to Home screen
    navigateToHome();
  };

  const handleCustomInputSubmit = (text) => {
    // Add the custom input to userData
    setUserData(prev => ({
      ...prev,
      customInput: text
    }));

    // Add the user's input as a message
    setMessages(prevMessages => [
      ...prevMessages,
      { text, user: true }
    ]);

    // Continue the conversation
    const currentStep = conversationSteps.find(step => step.id === currentStepId);
    const nextStepId = currentStep.nextStepId(t('moodChecker.customInputOptions.addThoughts'), userData);

    if (nextStepId) {
      setCurrentStepId(nextStepId);
      const nextStep = conversationSteps.find(step => step.id === nextStepId);
      if (nextStep) {
        setTimeout(() => {
          addMessage(nextStep);
        }, 500);
      }
    }
  };

  const handleOptionPress = (option) => {
    // Provide haptic feedback
    if (useHaptics) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Vibration.vibrate(20);
      }
    }

    // Add user's response to the conversation
    setMessages(prevMessages => [
      ...prevMessages,
      { text: option, user: true }
    ]);

    // Update user data based on current step
    const currentStep = conversationSteps.find(step => step.id === currentStepId);
    updateUserDataFromOption(currentStep.id, option);

    // Handle steps with free text input
    if (currentStep.freeTextInput && option === t('moodChecker.customInputOptions.addThoughts')) {
      setCustomInputTitle(t('moodChecker.customInputModalTitle'));
      setShowCustomInputModal(true);
      return;
    }

    // Handle scheduling reminders
    if (currentStep.id === 'schedule-check-in' && option !== t('moodChecker.scheduleOptions.noThanks')) {
      setUserData(prev => ({
        ...prev,
        scheduleOption: option
      }));
      setScheduleReminder(true);
    }

    // Determine the next step
    const nextStepId = currentStep.nextStepId(option, userData);

    if (nextStepId === null) {
      // End of conversation
      setIsConversationEnded(true);
      recordMoodData();
      return;
    }

    if (nextStepId) {
      setCurrentStepId(nextStepId);
      const nextStep = conversationSteps.find(step => step.id === nextStepId);
      if (nextStep) {
        setTimeout(() => {
          addMessage(nextStep);
        }, 500);
      }
    }

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const updateUserDataFromOption = (stepId, option) => {
    if (stepId === 'initial-greeting') {
      setUserData(prev => ({ ...prev, mood: option }));
    } else if (stepId === 'positive-mood-followup' || stepId === 'negative-mood-followup' || stepId === 'additional-topic') {
      setUserData(prev => ({ ...prev, issue: option }));
    } else if (stepId === 'specific-issue') {
      setUserData(prev => ({ ...prev, specificIssue: option }));
    } else if (stepId === 'intensity-check') {
      setUserData(prev => ({ ...prev, intensity: option }));
    }
  };

  // Get progress through conversation
  const getProgress = () => {
    if (!currentStepId || conversationSteps.length === 0) return 0;

    // Find current step index
    const currentIndex = conversationSteps.findIndex(step => step.id === currentStepId);
    if (currentIndex === -1) return 0;

    return ((currentIndex + 1) / conversationSteps.length) * 100;
  };

  // Styling for progress bar
  const progressBarStyles = {
    width: `${getProgress()}%`,
  };

  // Get options for current step
  const getCurrentOptions = () => {
    if (!currentStepId || conversationSteps.length === 0) return [];

    const currentStep = conversationSteps.find(step => step.id === currentStepId);
    if (!currentStep) return [];

    let options = currentStep.options;
    if (typeof options === 'function') {
      options = options(userData);
    }

    return options || [];
  };

  return (
    <ImageBackground
      source={require('../assets/splash.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color="#f7e8d3" />
          </TouchableOpacity>
          <Image source={require('../assets/Arne_1.png')} style={styles.image} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{t('moodChecker.title')}</Text>
            <Text style={styles.captionText}>
              {getTimeOfDay() === 'morning' ? t('moodChecker.captionMorning') :
               getTimeOfDay() === 'afternoon' ? t('moodChecker.captionAfternoon') :
               t('moodChecker.captionEvening')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => saveHapticsPreference(!useHaptics)}
          >
            <FontAwesome
              name={useHaptics ? "bell" : "bell-slash"}
              size={20}
              color="#f7e8d3"
            />
          </TouchableOpacity>
        </View>

        {showProgressIndicator && !isConversationEnded && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, progressBarStyles]} />
            </View>
          </View>
        )}

        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.chatContentContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {isConversationEnded ? (
          <View style={styles.finishButtonContainer}>
            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleFinishButton}
            >
              <Text style={styles.finishButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.optionsContainer,
              { opacity: optionsAnim }
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              ref={optionsScrollViewRef}
              contentContainerStyle={styles.optionsScrollContent}
            >
              {getCurrentOptions().map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleOptionPress(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <CustomInputModal
          visible={showCustomInputModal}
          onClose={() => setShowCustomInputModal(false)}
          onSubmit={handleCustomInputSubmit}
          title={customInputTitle}
          placeholder={t('moodChecker.customInputPlaceholder')}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'transparent',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FF6347"
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f7e8d3',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: 'transparent',
  },
  captionText: {
    fontSize: 12,
    color: "#FF6347",
    fontWeight: "bold",
    fontStyle: "italic"
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  settingsButton: {
    padding: 10,
    marginLeft: 5,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  chatContentContainer: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: 'transparent',
  },
  messageWrapper: {
    marginVertical: 6,
    backgroundColor: 'transparent',
  },
  messageContainer: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    maxWidth: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  arneMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(230,208,181,0.15)',
    borderBottomLeftRadius: 4, // Small point on the bottom left
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(74,105,189,0.15)',
    borderBottomRightRadius: 4, // Small point on the bottom right
  },
  messageText: {
    fontSize: 16,
    color: '#f7e8d3',
    lineHeight: 22,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: 'transparent',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6347',
    borderRadius: 2,
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'rgba(20,20,20,0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  optionsScrollContent: {
    paddingRight: 20,
    paddingVertical: 5,
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  optionText: {
    fontSize: 14,
    color: "#f7e8d3",
    fontWeight: "600",
    textAlign: 'center'
  },
  finishButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'rgba(20,20,20,0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  finishButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  finishButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    textAlign: 'center'
  }
});

export default MoodChecker;
