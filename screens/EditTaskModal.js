import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import modalStyles from '../styles/TaskInputStyles';
import IntervalSlider from '../components/IntervalSlider';

const { height, width } = Dimensions.get('window');

// Make sure this matches exactly with TaskInputModal
const getFlagColorDefault = (priority) => {
  switch (priority) {
    case 'Urgent':
      return '#FF1744';
    case 'High':
      return '#FF9100';
    case 'Medium':
      return '#00C853';
    case 'Lowest':
      return '#00B0FF';
    default:
      return '#00B0FF';
  }
};

// Add the styles object with hardware-accelerated properties
const styles = StyleSheet.create({
  breakInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 6,
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      }
    })
  },
  breakInfoText: {
    color: '#F7E8D3',
    fontSize: 12,
    opacity: 0.9,
    flex: 1,
  },
  // Additional optimized styles
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  priorityOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  priorityOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  hitSlop: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10
  }
});

const EditTaskModal = ({ 
  visible, 
  onClose, 
  task,
  onSave,
  loading = false,
  getFlagColor = getFlagColorDefault,
}) => {
  const { t } = useTranslation();
  // Pre-initialize animations for better performance
  const translateY = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const breakInfoOpacity = useRef(new Animated.Value(0)).current;
  const breakInfoTranslateY = useRef(new Animated.Value(10)).current;
  
  // State management
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [taskPriority, setTaskPriority] = useState('Lowest');
  const [repetitionInterval, setRepetitionInterval] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [breakDuration, setBreakDuration] = useState(0);
  
  // Refs for preventing double actions
  const animationCompletedRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const initialSetupDoneRef = useRef(false);
  
  // Simple animation durations - no complex easing
  const animationDurations = useMemo(() => ({
    fadeIn: Platform.OS === 'ios' ? 300 : 250,
    fadeOut: Platform.OS === 'ios' ? 250 : 200,
    slideIn: Platform.OS === 'ios' ? 350 : 300,
    slideOut: Platform.OS === 'ios' ? 300 : 250,
  }), []);
  
  // Precompute frequently used values
  const priorityOptions = useMemo(() => ["Lowest", "Medium", "High", "Urgent"], []);

  // Calculate break time based on task interval - memoized for performance
  const calculateBreakTime = useCallback((intervalMinutes) => {
    if (intervalMinutes >= 20) {
      const baseBreak = Math.floor(intervalMinutes / 25) * 5;
      return Math.min(Math.max(baseBreak, 5), 15);
    }
    return 0;
  }, []);

  // Set initial values when task changes or modal becomes visible - with optimized updates
  useEffect(() => {
    if (task && visible && !initialSetupDoneRef.current) {
      // Safely set default values for task properties
      const taskText = task.text || '';
      const taskPriority = task.priority || 'Lowest';
      
      // Safely handle intervals with fallbacks
      let intervalValue = "15";
      if (typeof task.interval === 'number') {
        intervalValue = task.interval.toString();
      } else if (typeof task.interval === 'string') {
        intervalValue = task.interval;
      } else if (Array.isArray(task.intervals) && task.intervals.length > 0) {
        // Get first interval from intervals array if available
        const firstInterval = task.intervals[0];
        if (typeof firstInterval === 'number') {
          intervalValue = firstInterval.toString();
        } else if (typeof firstInterval === 'string') {
          intervalValue = firstInterval;
        }
      }
      
      // Safely handle scheduled date
      let dateValue = new Date();
      if (task.scheduledFor) {
        const parsedDate = new Date(task.scheduledFor);
        if (!isNaN(parsedDate.getTime())) {
          dateValue = parsedDate;
        }
      } else if (task.dueDate) {
        const parsedDate = new Date(task.dueDate);
        if (!isNaN(parsedDate.getTime())) {
          dateValue = parsedDate;
        }
      }
      
      // Update state in a single batch for better performance
      setNewTaskText(taskText);
      setTaskPriority(taskPriority);
      setRepetitionInterval(intervalValue);
      setScheduledDate(dateValue);
      
      // Calculate break time immediately
      const intervalMinutes = parseInt(intervalValue) || 15;
      setBreakDuration(calculateBreakTime(intervalMinutes));
      
      initialSetupDoneRef.current = true;
    }
    
    // Reset the flag when modal is closed
    if (!visible) {
      initialSetupDoneRef.current = false;
    }
  }, [task, visible, calculateBreakTime]);

  // Handle modal animation states
  useEffect(() => {
    if (visible && !isAnimatingOut) {
      animationCompletedRef.current = false;
      animateIn();
    }
  }, [visible, isAnimatingOut]);

  // Handle break info animation when repetition interval changes
  useEffect(() => {
    if (!visible) return;
    
    const intervalMinutes = parseInt(repetitionInterval) || 15;
    const calculatedBreakTime = calculateBreakTime(intervalMinutes);
    setBreakDuration(calculatedBreakTime);
    
    // Optimization: Skip animation if break time hasn't changed
    if (breakDuration === calculatedBreakTime && breakInfoOpacity._value !== 0) {
      return;
    }
    
    if (intervalMinutes >= 20 && calculatedBreakTime > 0) {
      // Simple animation with duration only - no easing
      Animated.parallel([
        Animated.timing(breakInfoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(breakInfoTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      // Simple animation with duration only - no easing
      Animated.parallel([
        Animated.timing(breakInfoOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(breakInfoTranslateY, {
          toValue: 10,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [repetitionInterval, breakDuration, breakInfoOpacity, breakInfoTranslateY, visible, calculateBreakTime]);

  // Simplified animation in function - NO EASING
  const animateIn = useCallback(() => {
    // Reset position before animation
    translateY.setValue(height);
    fadeAnim.setValue(0);

    // Simple animations without complex easing
    if (Platform.OS === 'ios') {
      // iOS: Smoother with sequential animations
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animationDurations.fadeIn,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          mass: 1,
          stiffness: 150,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Android: Better performance with parallel animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animationDurations.fadeIn,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: animationDurations.slideIn,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [translateY, fadeAnim, animationDurations, height]);

  // Simplified animation out function - NO EASING
  const animateOut = useCallback((callback) => {
    if (isAnimatingOut || animationCompletedRef.current) return;
    
    setIsAnimatingOut(true);
    animationCompletedRef.current = true;
    
    // Simple platform-specific animations without easing
    if (Platform.OS === 'ios') {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: height,
          damping: 20,
          mass: 1,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animationDurations.fadeOut,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsAnimatingOut(false);
        setDatePickerVisible(false);
        setIsSubmitting(false);
        pendingSaveRef.current = false;
        
        if (callback && typeof callback === 'function') {
          callback();
        }
      });
    } else {
      // Android: Faster, simpler animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: animationDurations.slideOut,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animationDurations.fadeOut,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsAnimatingOut(false);
        setDatePickerVisible(false);
        setIsSubmitting(false);
        pendingSaveRef.current = false;
        
        if (callback && typeof callback === 'function') {
          callback();
        }
      });
    }
  }, [translateY, fadeAnim, isAnimatingOut, animationDurations, height]);

  // Optimized handlers
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    // Add a small delay for keyboard to dismiss first
    requestAnimationFrame(() => {
      animateOut(onClose);
    });
  }, [animateOut, onClose]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isAnimatingOut || pendingSaveRef.current) return;
  
    if (!newTaskText?.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }
  
    setIsSubmitting(true);
    pendingSaveRef.current = true;
    Keyboard.dismiss();
  
    try {
      // Start animation early for perceived speed
      if (Platform.OS === 'android') {
        translateY.setValue(10); // Small shift to indicate action
      }
      
      // Pre-process values for better performance
      let intervalNum = parseInt(repetitionInterval, 10);
      if (isNaN(intervalNum) || intervalNum <= 0) {
        intervalNum = 5;
      }
      
      // Create the updated task object - preserve original task properties not edited
      // Make sure to preserve subtasks and other properties
      const updatedTask = {
        ...task,
        text: newTaskText.trim(),
        priority: taskPriority,
        interval: intervalNum,
        intervals: intervalNum ? [intervalNum] : [],
        dueDate: scheduledDate ? scheduledDate.toISOString() : null,
        scheduledFor: scheduledDate ? scheduledDate.toISOString() : null,
        breakDuration,
        _lastUpdated: new Date().toISOString() // Add timestamp to force updates
      };
  
      // Call onSave with a timeout to prevent UI issues
      setTimeout(async () => {
        await onSave(updatedTask);
        
        // Start animation out immediately
        animateOut(onClose);
      }, 50);
    } catch (error) {
      console.error('Task update error:', error);
      setIsSubmitting(false);
      pendingSaveRef.current = false;
      Alert.alert('Error', 'Failed to update task: ' + (error.message || 'Unknown error'));
    }
  }, [
    isSubmitting, isAnimatingOut, newTaskText, task, taskPriority,
    repetitionInterval, scheduledDate, breakDuration, onSave, animateOut, onClose,
    translateY
  ]);

  // Optimized date handlers
  const handleDateButtonPress = useCallback(() => {
    Keyboard.dismiss();
    // Small delay to ensure keyboard is dismissed
    setTimeout(() => setDatePickerVisible(true), 50);
  }, []);

  const handleDateSelect = useCallback((date) => {
    setScheduledDate(date);
    setDatePickerVisible(false);
  }, []);

  const handleDatePickerCancel = useCallback(() => {
    setDatePickerVisible(false);
  }, []);

  const handleDateReset = useCallback(() => {
    setScheduledDate(new Date());
  }, []);

  // Optimized interval change handler
  const handleIntervalChange = useCallback((value) => {
    setRepetitionInterval(String(value));
  }, []);

  // Memoized render functions
  const renderPriorityOption = useCallback((priority) => (
    <TouchableOpacity
      style={[
        styles.priorityOption,
        taskPriority === priority && styles.priorityOptionSelected,
      ]}
      onPress={() => setTaskPriority(priority)}
      key={priority}
      activeOpacity={0.7}
      hitSlop={styles.hitSlop}
    >
      <FontAwesome 
        name="flag" 
        size={16} 
        color={getFlagColor(priority)}
        style={{ marginRight: 8 }}
      />
      <Text style={[
        modalStyles.optionText,
        taskPriority === priority && modalStyles.optionTextSelected
      ]}>
        {t(`taskModal.priorityLevels.${priority.toLowerCase()}`)}
      </Text>
    </TouchableOpacity>
  ), [taskPriority, getFlagColor, t]);

  // To prevent the modal from showing during animation out
  if (!visible && isAnimatingOut) return null;

  return (
    <Modal 
      transparent 
      visible={visible} 
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent={Platform.OS === 'android'}
      hardwareAccelerated={true}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={[modalStyles.modalOverlay, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, justifyContent: 'center' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <Animated.View
              style={[
                modalStyles.modalContainer,
                { transform: [{ translateY }] }
              ]}
            >
              {/* Use FlatList instead of ScrollView for better performance */}
              <FlatList
                data={[1]} // Single item for content
                keyExtractor={() => 'content'}
                renderItem={() => (
                  <View style={[modalStyles.contentContainer, { paddingTop: 20 }]}>
                    <Text style={[modalStyles.title, { textAlign: 'center' }]}>
                      {t('taskModal.editTask')}
                    </Text>
                    
                    <TextInput
                      style={modalStyles.input}
                      placeholder={t('taskModal.enterTaskTitle')}
                      placeholderTextColor="rgba(247,232,211,0.5)"
                      value={newTaskText}
                      onChangeText={setNewTaskText}
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />

                    <View style={modalStyles.optionsContainer}>
                      <Text style={modalStyles.sectionTitle}>{t('taskModal.reminderInterval')}</Text>
                      <IntervalSlider
                        value={parseInt(repetitionInterval) || 15}
                        onChange={handleIntervalChange}
                        minValue={1}
                        maxValue={90}
                        step={1}
                        activeColor="#F7E8D3"
                        accentColor={getFlagColor(taskPriority)}
                        textColor="#F7E8D3"
                        containerStyle={{ marginVertical: 5 }}
                      />
                      
                      {/* Break info message with improved animation performance */}
                      <Animated.View 
                        style={[
                          styles.breakInfoContainer,
                          { 
                            opacity: breakInfoOpacity,
                            transform: [{ translateY: breakInfoTranslateY }]
                          }
                        ]}
                      >
                        <FontAwesome 
                          name="coffee" 
                          size={12} 
                          color="#F7E8D3"
                          style={{ marginRight: 8, opacity: 0.8 }}
                        />
                        <Text style={styles.breakInfoText}>
                          {t('taskModal.breakTimeInfo', { 
                            breakTime: breakDuration, 
                            defaultValue: `${breakDuration}-minute breaks recommended`
                          })}
                        </Text>
                      </Animated.View>
                    </View>

                    <View style={modalStyles.optionsContainer}>
                      <Text style={modalStyles.sectionTitle}>{t('taskModal.priority')}</Text>
                      {/* Optimized priority options rendering */}
                      <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between',
                        marginVertical: 8 
                      }}>
                        {priorityOptions.map(renderPriorityOption)}
                      </View>
                    </View>

                    <View style={modalStyles.optionsContainer}>
                      <Text style={modalStyles.sectionTitle}>{t('taskModal.deadline')}</Text>
                      <View style={modalStyles.dateContainer}>
                        <TouchableOpacity
                          style={modalStyles.dateButton}
                          onPress={handleDateButtonPress}
                          disabled={isAnimatingOut}
                          hitSlop={styles.hitSlop}
                          activeOpacity={0.7}
                        >
                          <Text style={modalStyles.dateText}>
                            {scheduledDate ?
                              scheduledDate.toLocaleDateString() :
                              t('taskModal.selectDate')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={modalStyles.iconButton}
                          onPress={handleDateReset}
                          disabled={isAnimatingOut}
                          hitSlop={styles.hitSlop}
                          activeOpacity={0.7}
                        >
                        <FontAwesome name="calendar" size={20} color="#F7e8d3" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
                bounces={true}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                indicatorStyle="white"
                // Optimized FlatList performance
                removeClippedSubviews={Platform.OS === 'android'}
                maxToRenderPerBatch={1}
                initialNumToRender={1}
                getItemLayout={(data, index) => ({
                  length: 450, // Approximate height
                  offset: 450 * index,
                  index,
                })}
              />

              <View style={modalStyles.actionButtons}>
                <TouchableOpacity
                  style={[modalStyles.button, modalStyles.cancelButton]}
                  onPress={handleClose}
                  disabled={isAnimatingOut || isSubmitting}
                  activeOpacity={0.7}
                  hitSlop={styles.hitSlop}
                >
                  <Text style={modalStyles.buttonText}>{t('taskModal.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[modalStyles.button, modalStyles.submitButton]}
                  onPress={handleSubmit}
                  disabled={loading || isSubmitting || isAnimatingOut}
                  activeOpacity={0.7}
                  hitSlop={styles.hitSlop}
                >
                  {loading || isSubmitting ? (
                    <ActivityIndicator color="#1a1a1a" size={Platform.OS === 'android' ? 24 : 'small'} />
                  ) : (
                    <Text style={[modalStyles.buttonText, modalStyles.submitButtonText]}>
                      {t('taskModal.save')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>

      <DateTimePickerModal
        isVisible={isDatePickerVisible && !isAnimatingOut}
        mode="date"
        onConfirm={handleDateSelect}
        onCancel={handleDatePickerCancel}
        minimumDate={new Date()}
        date={scheduledDate || new Date()}
        // Optimized DateTimePicker settings
        confirmTextIOS="Confirm"
        cancelTextIOS="Cancel"
        modalTransparent={true} // Better Android performance
        androidVariant="nativeAndroid" // Use native variant for better performance
      />
    </Modal>
  );
};

// Export with memo for better performance
export default React.memo(EditTaskModal, (prevProps, nextProps) => {
  // Quick check for visibility change - always re-render when showing/hiding
  if (prevProps.visible !== nextProps.visible) {
    return false;
  }
  
  // If modal isn't visible, no need to check other props
  if (!prevProps.visible && !nextProps.visible) {
    return true;
  }
  
  // Check for loading state changes
  if (prevProps.loading !== nextProps.loading) {
    return false;
  }
  
  // Check if task ID has changed (different task being edited)
  if (prevProps.task?.id !== nextProps.task?.id) {
    return false;
  }
  
  // Safer deep comparison of key task properties
  const prevTask = prevProps.task || {};
  const nextTask = nextProps.task || {};
  
  // Return true only if all essential properties match
  return (
    prevTask.text === nextTask.text &&
    prevTask.priority === nextTask.priority &&
    prevTask.interval === nextTask.interval &&
    prevTask.scheduledFor === nextTask.scheduledFor &&
    JSON.stringify(prevTask.intervals) === JSON.stringify(nextTask.intervals)
  );
});