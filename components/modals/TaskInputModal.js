import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import modalStyles from '../../styles/TaskInputStyles';
import SubtasksSection from '../SubtaksSection';
import IntervalSlider from '../IntervalSlider';

const { height } = Dimensions.get('window');

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

const TaskInputModal = ({ 
  visible, 
  onClose, 
  loading = false,
  getFlagColor = getFlagColorDefault,
  newTaskText,
  onTextChange,
  onPriorityChange,
  onIntervalChange,
  onDateChange,
  taskPriority,
  repetitionInterval,
  scheduledDate,
  onSubmit,
  setNewTaskText,
  subtasks = [],
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  MAX_SUBTASKS = 5,
  isHighestPriority = false 
}) => {
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local copy of subtasks to manage state internally if needed
  const [localSubtasks, setLocalSubtasks] = useState(subtasks || []);
  
  // Break information
  const [breakDuration, setBreakDuration] = useState(0);
  const breakInfoOpacity = useRef(new Animated.Value(0)).current;
  const breakInfoTranslateY = useRef(new Animated.Value(10)).current;

  // Calculate break time based on task interval
  const calculateBreakTime = (intervalMinutes) => {
    // For intervals over 20 minutes, calculate appropriate break time
    // Using a simple formula: 5 min break for every 25 min of work
    if (intervalMinutes >= 20) {
      const baseBreak = Math.floor(intervalMinutes / 25) * 5;
      return Math.min(Math.max(baseBreak, 5), 15); // Minimum 5, maximum 15 minutes
    }
    return 0; // No break for short intervals
  };

  useEffect(() => {
    // Keep local subtasks in sync with props
    setLocalSubtasks(subtasks || []);
  }, [subtasks]);

  useEffect(() => {
    if (visible) {
      animateIn();
      if (!scheduledDate) {
        onDateChange(new Date());
      }
    } else {
      animateOut();
    }
  }, [visible]);

  // Add this useEffect to handle the fade animation and break calculation
  useEffect(() => {
    // Only process if modal is visible
    if (!visible) return;
    
    // Parse interval to number
    const intervalMinutes = parseInt(repetitionInterval) || 15;
    
    // Calculate appropriate break time for this interval
    const calculatedBreakTime = calculateBreakTime(intervalMinutes);
    setBreakDuration(calculatedBreakTime);
    
    // Show break info message if interval is long enough to warrant breaks
    if (intervalMinutes >= 20 && calculatedBreakTime > 0) {
      // First make sure it's reset
      breakInfoTranslateY.setValue(10);
      breakInfoOpacity.setValue(0);
      
      // Then animate in
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
      // Animate out if currently showing
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
  }, [repetitionInterval, breakInfoOpacity, breakInfoTranslateY, visible]);

  const animateIn = () => {
    translateY.setValue(height);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        mass: 1,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const animateOut = (callback) => {
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
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (callback) callback();
      setDatePickerVisible(false);
      setIsSubmitting(false);
      if (setNewTaskText) {
        setNewTaskText('');
      }
    });
  };

  const handleClose = () => {
    Keyboard.dismiss();
    animateOut(onClose);
  };

  // Subtask handlers
  const handleAddSubtask = () => {
    if (onAddSubtask) {
      onAddSubtask();
    }
  };

  const handleUpdateSubtask = (index, text) => {
    if (onUpdateSubtask) {
      onUpdateSubtask(index, text);
    }
  };

  const handleDeleteSubtask = (index) => {
    if (onDeleteSubtask) {
      onDeleteSubtask(index);
    }
  };

  // Update handleSubmit to include subtasks
  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!newTaskText?.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        text: newTaskText.trim(),
        priority: taskPriority,
        scheduledFor: scheduledDate ? scheduledDate.toISOString() : null,
        intervals: repetitionInterval ? [repetitionInterval] : [],
        subtasks: subtasks || [],
        hasSubtasks: (subtasks && subtasks.length > 0) || false,
        breakDuration: breakDuration, // Add the break duration
        completed: false,
        createdAt: new Date().toISOString()
      };

      await onSubmit(taskData);
      
      if (setNewTaskText) {
        setNewTaskText('');
      }
      
      setTimeout(() => {
        animateOut(onClose);
      }, 150);
    } catch (error) {
      console.error('Task creation error:', error);
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleDateButtonPress = () => {
    setDatePickerVisible(true);
  };

  const handleDateSelect = (date) => {
    onDateChange(date);
    setDatePickerVisible(false);
  };

  const handleDatePickerCancel = () => {
    setDatePickerVisible(false);
  };

  const handleDateReset = () => {
    onDateChange(new Date());
  };

  const handleIntervalChange = (value) => {
    // Convert the value to a string as the original component expects a string
    onIntervalChange(String(value));
  };

  const renderPriorityOption = (priority) => (
    <TouchableOpacity
      style={[
        modalStyles.optionButton,
        taskPriority === priority && modalStyles.optionButtonSelected,
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }
      ]}
      onPress={() => onPriorityChange(priority)}
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
  );

  return (
    <>
      <Modal transparent visible={visible} onRequestClose={handleClose}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[modalStyles.modalOverlay, { opacity: fadeAnim }]}>
            <Animated.View
              style={[
                modalStyles.modalContainer,
                { transform: [{ translateY }] }
              ]}
            >
              <ScrollView
                ref={scrollViewRef}
                bounces={true}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={modalStyles.scrollViewContent}
                indicatorStyle="white"
              >
                <View style={[modalStyles.contentContainer, { paddingTop: 20 }]}>
                  <Text style={[modalStyles.title, { textAlign: 'center' }]}>
                    {t('taskModal.createNewTask')}
                  </Text>
                  
                  <TextInput
                    style={modalStyles.input}
                    placeholder={t('taskModal.enterTaskTitle')}
                    placeholderTextColor="rgba(247,232,211,0.5)"
                    value={newTaskText}
                    onChangeText={onTextChange}
                  />
                  
                  <View style={modalStyles.optionsContainer}>
                    <Text style={modalStyles.sectionTitle}>{t('taskModal.reminderInterval')}</Text>
                    
                    {/* Enhanced interval slider component */}
                    <IntervalSlider
                      value={parseInt(repetitionInterval) || 15}
                      onChange={handleIntervalChange}
                      minValue={1}
                      maxValue={90}
                      step={1}
                      activeColor="#F7E8D3"
                      accentColor={getFlagColor(taskPriority)} // Use task priority color for accent
                      textColor="#F7E8D3"
                      containerStyle={{ marginVertical: 5 }}
                    />
                    
                    {/* Break info message with proper animation */}
                    <Animated.View 
                      style={[
                        modalStyles.breakInfoContainer,
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
                      <Text style={modalStyles.breakInfoText}>
                        {t('taskModal.breakTimeInfo', { 
                          breakTime: breakDuration, 
                          defaultValue: `${breakDuration}-minute breaks recommended`
                        })}
                      </Text>
                    </Animated.View>
                  </View>
  
                  <View style={modalStyles.optionsContainer}>
                    <Text style={modalStyles.sectionTitle}>{t('taskModal.priority')}</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={modalStyles.optionsScroll}
                      decelerationRate="fast"
                      snapToInterval={112}
                      snapToAlignment="start"
                      alwaysBounceHorizontal={true}
                    >
                      {["Lowest", "Medium", "High", "Urgent"].map(priority => (
                        <React.Fragment key={priority}>
                          {renderPriorityOption(priority)}
                        </React.Fragment>
                      ))}
                    </ScrollView>
                  </View>
  
                  <View style={modalStyles.optionsContainer}>
                    <Text style={modalStyles.sectionTitle}>{t('taskModal.deadline')}</Text>
                    <View style={modalStyles.dateContainer}>
                      <TouchableOpacity
                        style={modalStyles.dateButton}
                        onPress={handleDateButtonPress}
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
                      >
                        <FontAwesome name="calendar" size={20} color="#F7e8d3" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>
  
              <View style={modalStyles.actionButtons}>
                <TouchableOpacity
                  style={[modalStyles.button, modalStyles.cancelButton]}
                  onPress={handleClose}
                >
                  <Text style={modalStyles.buttonText}>{t('taskModal.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[modalStyles.button, modalStyles.submitButton]}
                  onPress={handleSubmit}
                  disabled={loading || isSubmitting}
                >
                  {loading || isSubmitting ? (
                    <ActivityIndicator color="#1a1a1a" />
                  ) : (
                    <Text style={[modalStyles.buttonText, modalStyles.submitButtonText]}>
                      {t('taskModal.create')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
  
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateSelect}
        onCancel={handleDatePickerCancel}
        minimumDate={new Date()}
        date={scheduledDate || new Date()}
      />
    </>
  );
};

export default React.memo(TaskInputModal);