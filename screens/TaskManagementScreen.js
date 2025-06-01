import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ImageBackground,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  Alert,
  Easing,
  Platform
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { doc, updateDoc, deleteDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import * as Notifications from 'expo-notifications';
import NotificationSystem from '../notifications/NotificationSystem';
import { useUser } from '../hooks/userHook';
import { useModalHandlers } from '../hooks/useModalHandlers';
import splashImage from '../assets/splash.png';
import styles from '../styles/TaskManagementScreenStyles';

// Components
import TaskList from '../components/TaskList';
import TaskInputModal from '../components/modals/TaskInputModal';
import TaskModal from '../components/TaskModal';
import NavigationButtons from '../components/NavigationButtons';
import BottomActionButtons from '../components/BottomActionButtons';
import SubtaskModal from '../components/SubtasksModal';
import XPGainAnimation from '../components/XPGainAnimation';

const TaskManagementScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const { t } = useTranslation();
  const unsubscribeListeners = useRef([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const taskListAnim = useRef(new Animated.Value(0)).current;

  // Task Input Modal State
  const [taskInputModalVisible, setTaskInputModalVisible] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [repetitionInterval, setRepetitionInterval] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Task Management State
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [subtaskModalVisible, setSubtaskModalVisible] = useState(false);
  const [selectedTaskForSubtasks, setSelectedTaskForSubtasks] = useState(null);
  const [showFutureTasks, setShowFutureTasks] = useState(false);
  const [xpGainAnimations, setXpGainAnimations] = useState([]);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Modal Handlers
  const {
    openTaskInputModal,
    closeTaskInputModal,
    resetModalState,
    handleViewSubtasks,
    handleLongPress,
    handleAddSubtask,
    handleEdit,
    handleModalClose
  } = useModalHandlers({
    setTaskInputModalVisible,
    setNewTaskText,
    setTaskPriority,
    setRepetitionInterval,
    setScheduledDate,
    setSubtasks,
    setModalVisible,
    setSelectedTask,
    setEditMode
  });

  // Task CRUD Operations
  const handleTaskSubmit = useCallback(async (taskData) => {
    if (!user) return;
    if (!taskData.text?.trim()) {
      Alert.alert('Error', 'Task text is required');
      return;
    }

    try {
      setLoading(true);
      
      const finalTaskData = {
        ...taskData,
        userId: user.uid,
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: subtasks || [],
        hasSubtasks: (subtasks?.length || 0) > 0
      };

      // Create notifications if intervals exist
      if (taskData.intervals?.length > 0) {
        await NotificationSystem.scheduleTaskNotification(finalTaskData);
      }

      // Add task to Firestore
      const docRef = await addDoc(collection(db, 'tasks'), finalTaskData);
      const newTask = { ...finalTaskData, id: docRef.id };

      // Update local state
      setTasks(prev => [...prev, newTask]);
      
      // Reset form and close modal
      resetModalState();
      closeTaskInputModal();

      // Show XP gain animation
      const newAnimation = {
        id: Date.now(),
        xp: 10,
        position: { top: Math.random() * 300, left: Math.random() * 200 }
      };
      setXpGainAnimations(prev => [...prev, newAnimation]);
      
      // Remove animation after delay
      setTimeout(() => {
        setXpGainAnimations(prev => prev.filter(a => a.id !== newAnimation.id));
      }, 1500);

    } catch (error) {
      console.error('Error submitting task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  }, [user, subtasks, closeTaskInputModal, resetModalState]);

  const handleTaskComplete = useCallback(async (task) => {
    if (!task?.id) return;

    try {
      setDeletingTaskId(task.id);
      
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: true,
        completedAt: new Date().toISOString()
      });

      // Update local state
      setTasks(prev => prev.filter(t => t.id !== task.id));

      // Cancel notifications if they exist
      if (task.intervals?.length > 0) {
        await NotificationSystem.cancelTaskNotifications(task.id);
      }

      // Show completion animation
      const newAnimation = {
        id: Date.now(),
        xp: 20,
        position: { top: Math.random() * 300, left: Math.random() * 200 }
      };
      setXpGainAnimations(prev => [...prev, newAnimation]);
      
      setTimeout(() => {
        setXpGainAnimations(prev => prev.filter(a => a.id !== newAnimation.id));
      }, 1500);

    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task');
    } finally {
      setDeletingTaskId(null);
    }
  }, []);

  const handleTaskDelete = useCallback(async (taskId) => {
    if (!taskId) return;

    try {
      setDeletingTaskId(taskId);
      
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Cancel any existing notifications
      await NotificationSystem.cancelTaskNotifications(taskId);
      
      handleModalClose();
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
    } finally {
      setDeletingTaskId(null);
    }
  }, [handleModalClose]);

  const handleSaveSubtasks = async (updatedSubtasks) => {
    if (!selectedTaskForSubtasks?.id) return;
    
    try {
      setLoading(true);
      
      await updateDoc(doc(db, 'tasks', selectedTaskForSubtasks.id), {
        subtasks: updatedSubtasks,
        hasSubtasks: updatedSubtasks.length > 0
      });

      setTasks(prev => prev.map(task => 
        task.id === selectedTaskForSubtasks.id 
          ? { ...task, subtasks: updatedSubtasks, hasSubtasks: updatedSubtasks.length > 0 } 
          : task
      ));
      
      setSubtaskModalVisible(false);
      setSelectedTaskForSubtasks(null);
    } catch (error) {
      console.error('Error saving subtasks:', error);
      Alert.alert('Error', 'Failed to save subtasks');
    } finally {
      setLoading(false);
    }
  };

  // Form Handlers
  const handleInputChange = useCallback((text) => {
    setNewTaskText(text);
  }, []);

  const handleDateChange = useCallback((date) => {
    setScheduledDate(date);
    setShowDatePicker(false);
  }, []);

  // Animation Functions
  const startEntryAnimation = useCallback(() => {
    // Reset animation values
    headerFadeAnim.setValue(0);
    contentFadeAnim.setValue(0);
    taskListAnim.setValue(0);

    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(headerFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(taskListAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        ]),
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(contentFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        ]),
      ]),
    ]).start();
  }, [headerFadeAnim, contentFadeAnim, taskListAnim]);

  // Load Tasks
  useEffect(() => {
    let mounted = true;

    const loadTasks = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('completed', '==', false)
        );
        
        const querySnapshot = await getDocs(q);
        const loadedTasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        if (mounted) {
          setTasks(loadedTasks);
          setIsInitializing(false);
          startEntryAnimation();
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        if (mounted) {
          Alert.alert('Error', 'Failed to load tasks');
          setIsInitializing(false);
        }
      }
    };

    loadTasks();

    return () => {
      mounted = false;
      unsubscribeListeners.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
      unsubscribeListeners.current = [];
    };
  }, [user, startEntryAnimation]);

  // Setup Notifications
  useEffect(() => {
    const setupNotifications = async () => {
      await NotificationSystem.initialize();
      
      const subscription = Notifications.addNotificationResponseReceivedListener(
        async response => {
          const { taskId } = response.notification.request.content.data;
          if (taskId) {
            const taskDoc = await doc(db, "tasks", taskId);
            // Handle notification response
          }
        }
      );

      return () => subscription.remove();
    };

    setupNotifications();
  }, []);

  if (isInitializing || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={splashImage} style={styles.container}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.content, { opacity: headerFadeAnim }]}>
          <Animated.View style={[styles.taskListContainer, { opacity: taskListAnim }]}>
            <TaskList
              tasks={tasks}
              onComplete={handleTaskComplete}
              onDelete={handleTaskDelete}
              onEdit={handleEdit}
              onAddSubtask={handleAddSubtask}
              showFutureTasks={showFutureTasks}
              deletingTaskId={deletingTaskId}
            />
          </Animated.View>

          <Animated.View style={[styles.buttonsContainer, { opacity: contentFadeAnim }]}>
            <NavigationButtons
              onToggleFutureTasks={() => setShowFutureTasks(prev => !prev)}
              showFutureTasks={showFutureTasks}
            />

            <BottomActionButtons
              onAddTaskPress={openTaskInputModal}
            />
          </Animated.View>

          {xpGainAnimations.map(animation => (
            <XPGainAnimation
              key={animation.id}
              xpAmount={animation.xp}
              style={{
                position: 'absolute',
                top: animation.position.top,
                left: animation.position.left,
              }}
            />
          ))}
        </Animated.View>

        <TaskInputModal
          visible={taskInputModalVisible}
          onClose={closeTaskInputModal}
          onSubmit={handleTaskSubmit}
          newTaskText={newTaskText}
          taskPriority={taskPriority}
          repetitionInterval={repetitionInterval}
          scheduledDate={scheduledDate}
          subtasks={subtasks}
          loading={loading}
          showDatePicker={showDatePicker}
          onTextChange={handleInputChange}
          onPriorityChange={setTaskPriority}
          onIntervalChange={setRepetitionInterval}
          onDatePress={() => setShowDatePicker(true)}
          onDateChange={handleDateChange}
          onDatePickerClose={() => setShowDatePicker(false)}
          onResetDate={() => setScheduledDate(null)}
          setSubtasks={setSubtasks}
        />

<SubtaskModal
  visible={subtaskModalVisible}
  onClose={() => setSubtaskModalVisible(false)}
  onSave={handleSaveSubtasks}
  task={selectedTaskForSubtasks}
  loading={loading}
/>

<TaskModal
            task={selectedTask}
            visible={modalVisible}
            onClose={handleModalClose}
            onDelete={() => handleTaskDelete(selectedTask.id)}
            onEdit={() => handleEdit(selectedTask)}
            loading={deletingTaskId === selectedTask?.id}
          />
        )}
      </View>
    </ImageBackground>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#F7E8D3',
    marginTop: 12,
    fontSize: 16,
  },
  taskListContainer: {
    flex: 1,
    marginBottom: 16,
  },
  buttonsContainer: {
    marginTop: 'auto',
    gap: 16,
  },
});

export default TaskManagementScreen;
