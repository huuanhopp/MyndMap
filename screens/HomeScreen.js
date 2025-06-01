import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { 
  View, 
  ImageBackground, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  Animated, 
  Alert, 
  Easing,
  AppState,
  Platform
} from 'react-native';
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { db } from '../firebase/init.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n.js';

// Components - import on demand to improve initial load time
import TaskList from '../components/TaskList';
import NavigationButtons from '../components/NavigationButtons';
import BottomActionButtons from '../components/BottomActionButtons';
import ActiveTimer from '../components/ActiveTimer';
import XPGainAnimation from '../components/XPGainAnimation';

// Hooks
import { useUser } from '../hooks/userHook';
import { useTaskHandlers } from '../hooks/useTaskHandlers';
import { useInitialization } from '../hooks/useInitialization';
import { useAnimationHandlers } from '../hooks/useAnimationHandlers';
import { useModalHandlers } from '../hooks/useModalHandlers';
import { useNotificationSubscriptions } from '../hooks/useNotificationSubscriptions';
import { useTaskAddition } from '../hooks/useTaskAddition';
import { useOverdueTasks } from './useOverdueTasks';
import { useHomeScreenState } from '../hooks/useHomeScreenState';
import { useXPSystem } from '../hooks/useXPSystem.js';
import { getFlagColor } from '../utility/taskUtils';
import styles from '../styles/HomeScreenStyles';
import NotificationManager from '../notifications/notifications.js';

// Wallpapers
import defaultWallpaper from '../assets/splash.png';
// Create a separate wallpaper utility file to improve initial loading time
import { getWallpaperSource } from '../utility/wallpaperUtils';

// Import all components unconditionally to prevent hook count issues
import TaskInputModal from '../components/modals/TaskInputModal';
import TaskModal from '../components/TaskModal';
import HelpModal from '../components/HelpModal.js';
import SubtaskModal from '../components/SubtasksModal.js';
import MenuScreen from '../components/MenuScreen';
import ProgressReflections from '../components/ProgressReflections';
import OverdueNotification from '../components/OverdueNotification';
import TaskReminderModal from '../components/TaskReminderModal';
import QuestCompletedModal from '../components/QuestCompletedModal';
import EditTaskModal from './EditTaskModal.js';

const HomeScreen = () => {
  // Navigation and context hooks - always call these first
  const navigation = useNavigation();
  const { user } = useUser();
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  
  // State initialization - ensure these are always called in the same order
  const [wallpaperSetting, setWallpaperSetting] = useState({
    type: 'preset',
    value: 'default'
  });
  const [wallpaperSource, setWallpaperSource] = useState(defaultWallpaper);
  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);
  const [subtaskModalVisible, setSubtaskModalVisible] = useState(false);
  const [selectedTaskForSubtasks, setSelectedTaskForSubtasks] = useState(null);
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  
  // Refs should be initialized early
  const appStateRef = useRef(AppState.currentState);
  const animRefs = useRef({
    headerFadeAnim: new Animated.Value(0),
    contentFadeAnim: new Animated.Value(0),
    buttonsFadeAnim: new Animated.Value(0),
    footerFadeAnim: new Animated.Value(0),
    helpButtonScale: new Animated.Value(1),
    taskListFade: new Animated.Value(1)
  }).current;
  
  // Destructure for easier access
  const { 
    headerFadeAnim, contentFadeAnim, buttonsFadeAnim, 
    footerFadeAnim, helpButtonScale, taskListFade 
  } = animRefs;
  
  // Always call custom hooks in the same order
  const { xpGainAnimations, triggerXPGain } = useXPSystem();
  
  // Get all state and handlers from the custom hook
  const {
    isLoading, setIsLoading,
    isInitializing, setIsInitializing,
    loading, setLoading,
    reminders, setReminders,
    futureReminders, setFutureReminders,
    showFutureTasks, setShowFutureTasks,
    selectedTask, setSelectedTask,
    deletingTaskId, setDeletingTaskId,
    currentReminderTask, setCurrentReminderTask,
    highestPriorityTask, setHighestPriorityTask,
    overdueTasks, setOverdueTasks,
    isNewUser, setIsNewUser,
    userName, setUserName,
    modalVisible, setModalVisible,
    isHelpModalVisible, setHelpModalVisible,
    isProgressReflectionsVisible, setProgressReflectionsVisible,
    taskInputModalVisible, setTaskInputModalVisible,
    taskReminderModalVisible, setTaskReminderModalVisible,
    isMenuVisible, setIsMenuVisible,
    isQuestCompletedVisible, setIsQuestCompletedVisible,
    subtasks, setSubtasks,
    fadeAnims, helpButtonAnim, listFadeAnim, fadeAnim,
    showDatePicker, setShowDatePicker,
    unsubscribeListeners,
    showOverdueNotification, setShowOverdueNotification
  } = useHomeScreenState();
  
  // IMPORTANT: Define all callback functions before using them in other hooks
  
  // Calculate task priority score - define before it's used in findHighestPriorityTask
  const calculateTaskPriorityScore = useCallback((task) => {
    if (!task) return 0;
    
    let score = 0;
    
    // Base score from priority level
    switch(task.priority) {
      case 'high':
        score += 100;
        break;
      case 'medium':
        score += 50;
        break;
      case 'low':
        score += 25;
        break;
      default:
        score += 10;
    }
    
    // Shorter intervals get higher priority
    if (task.interval) {
      const intervalMins = parseInt(task.interval);
      score += (60 - intervalMins); // Max 60 points for shortest interval
    }
    
    // Tasks with deadlines get higher priority
    if (task.dueDate) {
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      const daysUntilDue = Math.max(0, Math.floor((dueDate - now) / (1000 * 60 * 60 * 24)));
      
      if (daysUntilDue === 0) {
        score += 100; // Due today
      } else if (daysUntilDue <= 2) {
        score += 75; // Due in next 2 days
      } else if (daysUntilDue <= 7) {
        score += 50; // Due this week
      }
    }
    
    // Tasks with subtasks get higher priority
    if (task.subtasks && task.subtasks.length > 0) {
      score += task.subtasks.length * 5; // 5 points per subtask
    }
    
    return score;
  }, []);
  
  // Find highest priority task - define before it's used in other functions
  const findHighestPriorityTask = useCallback(() => {
    if (!reminders || reminders.length === 0) {
      setHighestPriorityTask(null);
      // Only clear active timer if no task is currently showing a timer completion popup
      if (!taskReminderModalVisible) {
        setActiveTimerTask(null);
      }
      return;
    }
    
    // Calculate priority scores for all tasks
    const tasksWithScores = reminders.map(task => ({
      ...task,
      priorityScore: calculateTaskPriorityScore(task)
    }));
    
    // Sort by priority score (descending)
    tasksWithScores.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Set the highest priority task
    const highestPriority = tasksWithScores[0];
    setHighestPriorityTask(highestPriority);
    
    // Only set as active timer task if no timer is already running
    // and no reminder modal is currently shown - this prevents automatic
    // progression to next task when one completes
    if (!activeTimerTask && !taskReminderModalVisible && highestPriority) {
      // Verify task exists in Firestore before setting it as active
      const verifyTaskExists = async () => {
        try {
          const taskRef = doc(db, "reminders", highestPriority.id);
          const taskDoc = await getDoc(taskRef);
          
          if (taskDoc.exists()) {
            // Ensure timerState has isCompleted property before setting as active
            const updatedTask = {
              ...highestPriority,
              timerState: {
                isActive: false,
                isCompleted: false,
                duration: highestPriority.interval || 5,
                ...(highestPriority.timerState || {})
              }
            };
            setActiveTimerTask(updatedTask);
          } else {
            console.log('Highest priority task no longer exists in Firestore');
            // Remove from local state
            setReminders(prev => prev.filter(t => t.id !== highestPriority.id));
            setFutureReminders(prev => prev.filter(t => t.id !== highestPriority.id));
            // Try finding the next highest priority task
            setTimeout(() => findHighestPriorityTask(), 100);
          }
        } catch (error) {
          console.error('Error verifying task existence:', error);
        }
      };
      
      verifyTaskExists();
    }
  }, [
    reminders, 
    activeTimerTask, 
    taskReminderModalVisible, 
    calculateTaskPriorityScore, 
    setHighestPriorityTask, 
    setActiveTimerTask, 
    setReminders, 
    setFutureReminders
  ]);
  
  // Handle task completion - define before it's used in other hooks
  const handleTaskComplete = useCallback(async (task) => {
    if (!task || !task.id) return;
    
    try {
      // Mark the task as completed in local state first for immediate feedback
      setReminders(prev => prev.filter(t => t.id !== task.id));
      
      // If this is the active timer task, update its state but keep it visible briefly
      if (activeTimerTask && activeTimerTask.id === task.id) {
        // Create a completed state for the timer
        const completedTimerTask = {
          ...activeTimerTask,
          completed: true,
          timerState: {
            ...activeTimerTask.timerState,
            isActive: false,
            isCompleted: true,
            completedAt: new Date().toISOString()
          }
        };
        
        // Update the timer with completed state
        setActiveTimerTask(completedTimerTask);
        
        // Set a timeout to remove the timer after a delay (for visual continuity)
        setTimeout(() => {
          setActiveTimerTask(null);
        }, 1500); // 1.5 seconds delay
      }
      
      // Update in Firestore
      const taskRef = doc(db, "reminders", task.id);
      await updateDoc(taskRef, {
        completed: true,
        completedAt: serverTimestamp(),
        'timerState.isActive': false,
        'timerState.isCompleted': true,
        'timerState.completedAt': serverTimestamp()
      });
      
      // Update AsyncStorage cache with a non-blocking approach
      AsyncStorage.getItem('cachedTasks')
        .then(cachedTasks => {
          if (cachedTasks) {
            const parsed = JSON.parse(cachedTasks);
            const updated = parsed.filter(t => t.id !== task.id);
            return AsyncStorage.setItem('cachedTasks', JSON.stringify(updated));
          }
        })
        .catch(cacheError => {
          console.error('Error updating task cache:', cacheError);
        });
      
      // Trigger XP gain if available
      if (typeof triggerXPGain === 'function') {
        // Calculate XP based on task priority and reschedule count
        const baseXP = 5; // Default XP
        const priorityBonus = task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1;
        const rescheduleCount = task.rescheduleCount || 0;
        const xpPenalty = Math.min(rescheduleCount, baseXP - 1);
        const xpGain = Math.max(1, (baseXP * priorityBonus) - xpPenalty);
        
        triggerXPGain(xpGain);
      }
      
      // After a brief delay, find a new highest priority task
      setTimeout(() => {
        findHighestPriorityTask();
      }, 500);
      
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  }, [
    activeTimerTask, 
    setActiveTimerTask, 
    setReminders, 
    triggerXPGain, 
    findHighestPriorityTask
  ]);
  
  // Handle timer complete - define before it's used
  const handleTimerComplete = useCallback(async (task, isInForeground = true) => {
    console.log(`[HOME] Timer completed for task ${task?.id}, in foreground: ${isInForeground}`);
    
    try {
      // First, let the NotificationManager handle the timer completion
      await NotificationManager.handleTimerComplete(task, isInForeground);
      
      // Create an updated task object with completed timer state
      const updatedTask = {
        ...task,
        timerState: {
          ...(task.timerState || {}),
          isActive: false,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          completedInForeground: isInForeground
        }
      };
      
      // Update the active timer task with completed state for UI
      setActiveTimerTask(updatedTask);
      
      // If app is in foreground, show the reminder modal immediately
      if (isInForeground) {
        console.log(`[HOME] App in foreground, displaying modal for task ${task?.id}`);
        setCurrentReminderTask(updatedTask);
        setTaskReminderModalVisible(true);
        
        // Mark that we've displayed the modal
        // This is intentionally done AFTER setting the modal to visible
        await NotificationManager.markModalDisplayed(task.id, true);
      } else {
        console.log(`[HOME] App in background, will display modal when app becomes active`);
        // When app comes to foreground, we'll handle it through checkAllActiveTasks
      }
    } catch (error) {
      console.error('[HOME] Error handling timer completion:', error);
      
      // Fallback: Try to show the modal anyway
      try {
        console.log('[HOME] Using fallback to show timer completion modal');
        setCurrentReminderTask(task);
        setTaskReminderModalVisible(true);
      } catch (fallbackError) {
        console.error('[HOME] Error in fallback modal display:', fallbackError);
      }
    }
  }, [setActiveTimerTask, setCurrentReminderTask, setTaskReminderModalVisible]);

  // Add this to your HomeScreen.js - this is a specialized function 
// for checking expired timers on app initialization
const checkForExpiredTimersOnLoad = useCallback(async () => {
  if (!user || !setCurrentReminderTask || !setTaskReminderModalVisible) return false;
  
  console.log('[HOME] Checking for expired timers on app load...');
  
  try {
    // Wait a moment to ensure app is fully loaded
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Query for tasks with completed timers that need user action
    const expiredQuery = query(
      collection(db, "reminders"),
      where("userId", "==", user.uid),
      where("completed", "==", false),
      where("deleted", "in", [false, null]),
      where("timerState.isActive", "==", false),
      where("timerState.isCompleted", "==", true),
      where("timerState.modalShown", "in", [false, null])
    );
    
    // Execute the query
    const expiredSnapshot = await getDocs(expiredQuery);
    
    if (!expiredSnapshot.empty) {
      console.log(`[HOME] Found ${expiredSnapshot.docs.length} expired timer tasks on load`);
      
      // Get the first expired task
      const expiredDoc = expiredSnapshot.docs[0];
      const expiredTask = createInitializedReminder(expiredDoc);
      
      // Check if this task has been recently processed
      const isRecentlyProcessed = await NotificationManager.wasNotificationRecentlySent(expiredTask.id);
      
      if (isRecentlyProcessed) {
        console.log('[HOME] Task was recently processed, skipping:', expiredTask.id);
        return false;
      }
      
      // Mark notification as sent to prevent duplicates
      await NotificationManager.markNotificationAsSent(expiredTask.id, 'app-load-check');
      
      // Mark this task as having shown a modal
      const taskRef = doc(db, "reminders", expiredTask.id);
      await updateDoc(taskRef, {
        'timerState.modalShown': true,
        'timerState.lastUpdated': serverTimestamp()
      });
      
      // Force a short delay to ensure UI is ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Show reminder modal for this task
      console.log('[HOME] Showing modal for expired task:', expiredTask.id);
      setCurrentReminderTask(expiredTask);
      setTaskReminderModalVisible(true);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[HOME] Error checking for expired timer tasks on load:', error);
    return false;
  }
}, [user, setCurrentReminderTask, setTaskReminderModalVisible, createInitializedReminder]);
  
  // Handle edit task - define before using
  const handleEdit = useCallback(async (updatedTask) => {
    if (!updatedTask?.id) {
      console.error('Cannot edit: invalid task object');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update in Firestore
      const taskRef = doc(db, "reminders", updatedTask.id);
      await updateDoc(taskRef, {
        text: updatedTask.text,
        priority: updatedTask.priority,
        interval: updatedTask.interval,
        intervals: updatedTask.intervals || (updatedTask.interval ? [updatedTask.interval] : []),
        dueDate: updatedTask.dueDate,
        scheduledFor: updatedTask.scheduledFor,
        updatedAt: serverTimestamp()
      });
      
      // Create a copy with a timestamp to force re-render
      const updatedTaskWithTimestamp = { 
        ...updatedTask, 
        _lastUpdated: Date.now() // Use a timestamp to force state updates
      };
      
      // Update in local state with the modified object
      setReminders(prev => {
        if (!prev) return [];
        return prev.map(task => 
          task.id === updatedTask.id ? updatedTaskWithTimestamp : task
        );
      });
      
      setFutureReminders(prev => {
        if (!prev) return [];
        return prev.map(task => 
          task.id === updatedTask.id ? updatedTaskWithTimestamp : task
        );
      });
      
      // If this is the active timer task, update it too but preserve the timerState
      if (activeTimerTask && activeTimerTask.id === updatedTask.id) {
        // If the task is active and interval changed, restart timer completely
        const oldInterval = activeTimerTask.timerState?.duration || activeTimerTask.interval;
        const newInterval = updatedTask.interval;
        
        if (oldInterval !== newInterval) {
          // Create a fresh timer state
          const updatedTimerTask = {
            ...updatedTaskWithTimestamp,
            timerState: {
              isActive: true,
              startTime: new Date().toISOString(),
              duration: newInterval,
              isCompleted: false // Make sure this is included
            }
          };
          
          // Update Firestore with new timer state
          await updateDoc(taskRef, {
            timerState: {
              isActive: true,
              startTime: serverTimestamp(),
              duration: newInterval,
              isCompleted: false // Make sure this is included
            }
          });
          
          // Update active timer task with new state
          setActiveTimerTask(updatedTimerTask);
        } else {
          // If interval didn't change, preserve current timer state
          setActiveTimerTask({
            ...updatedTaskWithTimestamp,
            timerState: {
              ...activeTimerTask.timerState,
              isCompleted: activeTimerTask.timerState?.isCompleted ?? false // Ensure it exists
            }
          });
        }
      }
      
      // Explicitly update the task in case it's the highest priority
      if (highestPriorityTask && highestPriorityTask.id === updatedTask.id) {
        setHighestPriorityTask(updatedTaskWithTimestamp);
      }
      
      // Close the modal
      setModalVisible(false);
      setSelectedTask(null);
      
      // Recalculate highest priority task
      setTimeout(() => findHighestPriorityTask(), 100);
      
      setLoading(false);
    } catch (error) {
      console.error('Error editing task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
      setLoading(false);
    }
  }, [
    activeTimerTask, 
    highestPriorityTask, 
    setActiveTimerTask, 
    setHighestPriorityTask, 
    setModalVisible, 
    setReminders, 
    setFutureReminders, 
    setSelectedTask, 
    setLoading, 
    findHighestPriorityTask
  ]);
  
  // Delete task - define before using
  const handleDeleteTask = useCallback(async (task) => {
    if (!task || !task.id) return;
    
    try {
      // Mark as deleting for animation
      setDeletingTaskId(task.id);
      
      // If this is the active timer task, remove it immediately
      if (activeTimerTask && activeTimerTask.id === task.id) {
        setActiveTimerTask(null);
      }
      
      // Update local state first for immediate feedback
      setReminders(prev => {
        const updatedReminders = prev.filter(t => t.id !== task.id);
        
        // If we're deleting the last task, force a UI update to show empty state
        if (updatedReminders.length === 0) {
          // Use a short timeout to ensure state update completes first
          setTimeout(() => {
            // Briefly adjust the opacity to force a re-render
            taskListFade.setValue(0.99);
            setTimeout(() => taskListFade.setValue(1), 50);
          }, 10);
        }
        
        return updatedReminders;
      });
      
      // Also update future reminders if showing those
      setFutureReminders(prev => {
        const updatedFutureReminders = prev.filter(t => t.id !== task.id);
        return updatedFutureReminders;
      });
      
      // Delete from Firestore
      await deleteDoc(doc(db, "reminders", task.id));
      
      // Update AsyncStorage cache
      const cachedTasks = await AsyncStorage.getItem('cachedTasks');
      if (cachedTasks) {
        const parsed = JSON.parse(cachedTasks);
        const updated = parsed.filter(t => t.id !== task.id);
        await AsyncStorage.setItem('cachedTasks', JSON.stringify(updated));
      }
      
      // Clear deleting state
      setDeletingTaskId(null);
      
      // After delete, make sure to reset highest priority task if needed
      if (highestPriorityTask && highestPriorityTask.id === task.id) {
        setHighestPriorityTask(null);
        setTimeout(() => findHighestPriorityTask(), 100);
      }
      
    } catch (error) {
      console.error('Error deleting task:', error);
      // Revert the local state change if deletion failed
      fetchReminders(); // Re-fetch all reminders
      setDeletingTaskId(null);
    }
  }, [
    activeTimerTask, 
    setActiveTimerTask, 
    setDeletingTaskId, 
    setReminders, 
    setFutureReminders, 
    taskListFade,
    highestPriorityTask,
    setHighestPriorityTask,
    findHighestPriorityTask
  ]);
  
  // Handle timer status update - define before using
  const handleTimerStatusUpdate = useCallback((taskId, statusUpdate) => {
    if (!taskId) return;
    
    // Handle different status updates
    switch (statusUpdate.action) {
      case 'complete':
        // For completion, show completion state briefly before removing
        if (activeTimerTask && activeTimerTask.id === taskId) {
          // Update to completed state
          setActiveTimerTask(prev => ({
            ...prev,
            completed: true,
            timerState: {
              ...prev.timerState,
              isActive: false,
              isCompleted: true
            }
          }));
          
          // Remove after delay
          setTimeout(() => {
            setActiveTimerTask(null);
          }, 1500);
        }
        break;
        
      case 'delete':
        // For deletion, remove immediately
        if (activeTimerTask && activeTimerTask.id === taskId) {
          setActiveTimerTask(null);
        }
        break;
        
      case 'reschedule':
        // For reschedule, the timer is already updated in handleTaskReschedule
        // No need to do anything here
        break;
        
      default:
        // For dismiss or other actions
        break;
    }
  }, [activeTimerTask, setActiveTimerTask]);
  
  // Check for completed tasks
  const checkForCompletedTasks = useCallback(async () => {
    // Add a delay to avoid showing modal during transition from splash screen
    setTimeout(async () => {
      try {
        // Use the NotificationManager to check all active tasks
        const completedTasks = await NotificationManager.checkAllActiveTasks();
        
        if (completedTasks && completedTasks.length > 0) {
          console.log('Found completed tasks:', completedTasks.length);
          
          // Get the first completed task to display in modal
          const task = completedTasks[0];
          
          // Check if we should show the modal for this task
          const shouldShow = await NotificationManager.shouldShowTaskCompletionModal(task.id);
          
          if (shouldShow) {
            // Show reminder modal for the completed task
            setCurrentReminderTask(task);
            setTaskReminderModalVisible(true);
            
            // Mark that the modal has been displayed
            await NotificationManager.markModalDisplayed(task.id, true);
            
            // If this task is the active timer task, update its state
            if (activeTimerTask && activeTimerTask.id === task.id) {
              setActiveTimerTask({
                ...activeTimerTask,
                timerState: {
                  ...activeTimerTask.timerState,
                  isCompleted: true,
                  modalDisplayed: true
                }
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking completed tasks:', error);
      }
    }, 500); // 500ms delay to ensure transition has completed
  }, [
    setCurrentReminderTask, 
    setTaskReminderModalVisible, 
    activeTimerTask, 
    setActiveTimerTask
  ]);
  
  // Start timer for task - define before using
  const startTimerForTask = useCallback(async (task) => {
    if (!task || !task.id) return;
    
    try {
      // Check if the task still exists in Firestore before starting the timer
      const taskRef = db.collection("reminders").doc(task.id);
      const taskDoc = await taskRef.get();
      
      if (!taskDoc.exists) {
        console.log('Cannot start timer: Task no longer exists in Firestore');
        
        // Remove the task from local state to keep things in sync
        setReminders(prev => prev.filter(t => t.id !== task.id));
        setFutureReminders(prev => prev.filter(t => t.id !== task.id));
        
        // If this was the highest priority task, recalculate
        if (highestPriorityTask?.id === task.id) {
          setHighestPriorityTask(null);
          setTimeout(() => findHighestPriorityTask(), 100);
        }
        
        return;
      }
      
      // Get the most recent interval value
      const interval = task.interval || 5; // default to 5 minutes if no interval is set
      
      // Set as active timer task
      setActiveTimerTask({
        ...task,
        timerState: {
          isActive: true,
          startTime: new Date().toISOString(),
          duration: interval,
          isCompleted: false // Make sure this is included
        }
      });
      
      // Update in Firestore
      await taskRef.update({
        timerState: {
          isActive: true,
          startTime: new Date(),
          duration: interval,
          isCompleted: false
        }
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      
      // Check if this is a "document not found" error
      if (error.code === 'not-found' || error.message?.includes('No document to update')) {
        // Remove the task from local state
        setReminders(prev => prev.filter(t => t.id !== task.id));
        setFutureReminders(prev => prev.filter(t => t.id !== task.id));
        
        // If this was the highest priority task, recalculate
        if (highestPriorityTask?.id === task.id) {
          setHighestPriorityTask(null);
          setTimeout(() => findHighestPriorityTask(), 100);
        }
      } else {
        // For other errors, show an alert
        Alert.alert('Error', 'Failed to start timer. Please try again.');
      }
    }
  }, [
    highestPriorityTask, 
    setActiveTimerTask, 
    setReminders, 
    setFutureReminders, 
    setHighestPriorityTask, 
    findHighestPriorityTask
  ]);
  
  // Handle adding subtasks
  const handleAddSubtask = useCallback((task) => {
    setSelectedTaskForSubtasks(task);
    setSubtaskModalVisible(true);
  }, []);
  
  // Save subtasks
  const handleSaveSubtasks = useCallback(async (subtasks) => {
    if (!selectedTaskForSubtasks) return;
    
    try {
      // Ensure subtasks are properly structured
      const processedSubtasks = subtasks.map(subtask => ({
        id: subtask.id,
        text: subtask.text,
        completed: subtask.completed || false,
        microtasks: subtask.microtasks || []
      }));
      
      // Update in Firestore with proper structure
      await db.collection("reminders").doc(selectedTaskForSubtasks.id).update({
        subtasks: processedSubtasks,
        hasSubtasks: processedSubtasks.length > 0
      });
  
      // Update local state to ensure UI updates immediately
      const updateTask = (task) => 
        task.id === selectedTaskForSubtasks.id 
          ? { 
              ...task, 
              subtasks: processedSubtasks, 
              hasSubtasks: processedSubtasks.length > 0,
              _lastUpdated: Date.now() // Force re-render
            } 
          : task;
          
      // Update reminders
      setReminders(prev => {
        if (!prev) return [];
        return prev.map(updateTask);
      });
      
      // Also update future reminders if needed
      setFutureReminders(prev => {
        if (!prev) return [];
        return prev.map(updateTask);
      });
      
      // If this is the active timer task, update it too
      if (activeTimerTask && activeTimerTask.id === selectedTaskForSubtasks.id) {
        setActiveTimerTask({
          ...activeTimerTask,
          subtasks: processedSubtasks,
          hasSubtasks: processedSubtasks.length > 0,
          _lastUpdated: Date.now()
        });
      }
      
      // If this is the highest priority task, update it too
      if (highestPriorityTask && highestPriorityTask.id === selectedTaskForSubtasks.id) {
        setHighestPriorityTask({
          ...highestPriorityTask,
          subtasks: processedSubtasks,
          hasSubtasks: processedSubtasks.length > 0,
          _lastUpdated: Date.now()
        });
      }
      
      console.log('Subtasks saved successfully:', processedSubtasks.length);
      
      // Recalculate highest priority task after subtasks change
      findHighestPriorityTask();
    } catch (error) {
      console.error('Error saving subtasks:', error);
      Alert.alert('Error', 'Failed to save subtasks');
    }
  }, [
    selectedTaskForSubtasks, 
    activeTimerTask, 
    highestPriorityTask, 
    setReminders, 
    setFutureReminders, 
    setActiveTimerTask, 
    setHighestPriorityTask, 
    findHighestPriorityTask
  ]);
  
  // Handle task reschedule
// Modify your handleTaskReschedule function to handle null results
const handleTaskReschedule = useCallback(async (task) => {
  if (!task || !task.id) {
    console.error('Cannot reschedule: invalid task object');
    return;
  }
  
  try {
    // Get the current reschedule count
    const taskRef = db.collection("reminders").doc(task.id);
    const taskDoc = await taskRef.get();
    const currentTask = taskDoc.exists ? taskDoc.data() : task;
    const rescheduleCount = (currentTask.rescheduleCount || 0) + 1;
    
    // Use NotificationManager for rescheduling
    const result = await NotificationManager.rescheduleTask({
      ...task,
      rescheduleCount,
      intervals: [task.timerState?.duration || task.interval || 5]
    });
    
    // Generate fallback values if result is null
    const notificationId = result?.notificationId || `task_${task.id}`;
    const nextReminderTime = result?.nextReminderTime || new Date(Date.now() + (task.interval || 5) * 60 * 1000).toISOString();
    
    // Update the task with new reschedule info
    await taskRef.update({
      rescheduleCount,
      notificationId: notificationId,
      nextReminderTime: nextReminderTime,
      'timerState.isActive': true,
      'timerState.startTime': new Date(),
      'timerState.duration': task.interval || 5,
      'timerState.isCompleted': false,
      completed: false
    });
    
    // Update local state
    setReminders(prev => {
      const filteredReminders = prev.filter(t => t.id !== task.id);
      
      const updatedTask = { 
        ...task, 
        rescheduleCount,
        notificationId: notificationId,
        nextReminderTime: nextReminderTime,
        timerState: {
          isActive: true,
          startTime: new Date().toISOString(),
          duration: task.interval || 5,
          isCompleted: false
        },
        completed: false
      };
    
      setActiveTimerTask(updatedTask);
      return [updatedTask, ...filteredReminders];
    });
    
    setTaskReminderModalVisible(false);
    
  } catch (error) {
    console.error('Error rescheduling task:', error);
    Alert.alert('Error', 'Failed to reschedule task. Please try again.');
    setTaskReminderModalVisible(false);
  }
}, [setReminders, setTaskReminderModalVisible, setActiveTimerTask]);
  
  // Handle task click
  const handleTaskClick = useCallback((task) => {
    // Show the edit modal when a task is clicked
    setSelectedTask(task);
    setModalVisible(true);
  }, [setSelectedTask, setModalVisible]);
  
  // Start entry animation
  const startEntryAnimation = useCallback(() => {
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
          Animated.timing(contentFadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        ]),
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(buttonsFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        ]),
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(footerFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        ]),
      ]),
    ]).start();
  }, [headerFadeAnim, contentFadeAnim, buttonsFadeAnim, footerFadeAnim]);
  
  // Initialize all custom hooks - after all callback definitions
  // This ensures that all callback references used by these hooks are already defined
  
  // Initialize the task handlers
  const {
    handleTaskSaved,
    handleSaveTaskNote,
    updateTaskPriority
  } = useTaskHandlers(
    user, 
    setReminders,
    setFutureReminders,
    setShowFutureTasks,
    setSelectedTask,
    setModalVisible,
    setTaskReminderModalVisible,
    setCurrentReminderTask,
    setIsQuestCompletedVisible,
    fadeAnims,
    setDeletingTaskId,
    triggerXPGain
  );
  
  // Initialize useInitialization hook
  const {
    checkIfNewUser,
    fetchUserName,
    fetchReminders,
    checkForAllTimerTasksRequiringAttention,
    checkForExpiredTimerTasks,
    checkForPendingTimerTasks
  } = useInitialization(
    user,
    setIsLoading,
    setReminders,
    setFutureReminders,
    setOverdueTasks,
    setShowOverdueNotification,
    setUserName,
    setIsNewUser,
    unsubscribeListeners,
    null, // checkBackgroundCompletedTasks
    setCurrentReminderTask,
    setTaskReminderModalVisible,
    setActiveTimerTask
  );
  
  // Initialize notification subscriptions
  const {
    startTaskTimer,
    handleTaskCompletion,
    handleTaskReschedule: handleSubscriptionTaskReschedule,
    highestPriorityTask: notificationHighestPriorityTask,
    findAndSetHighestPriorityTask
  } = useNotificationSubscriptions(
    reminders,
    setCurrentReminderTask,
    setTaskReminderModalVisible,
    user,
    handleTaskComplete
  );
  
  // Initialize animation handlers
  const {
    toggleFutureTasks,
    animateHelpButton,
    fadeOut
  } = useAnimationHandlers(
    fadeAnim, 
    setShowFutureTasks, 
    helpButtonAnim, 
    isNewUser,
    taskListFade // Pass the taskListFade animation value
  );
  
  // Handle input change placeholder - define before useModalHandlers
  const handleInputChange = useCallback((text) => {
    // This will be overridden by useTaskAddition, but needs to exist before useModalHandlers
    console.log('Input changed:', text);
  }, []);
  
  // Initialize modal handlers
  const {
    openTaskInputModal,
    closeTaskInputModal,
    showHelpModal,
    closeHelpModal,
    handleViewSubtasks,
    handleLongPress,
  } = useModalHandlers({
    setTaskInputModalVisible,
    setNewTaskText: handleInputChange, // This will be properly set after useTaskAddition
    setTaskPriority: () => {}, // Placeholder
    setRepetitionInterval: () => {}, // Placeholder
    setScheduledDate: () => {}, // Placeholder
    setSubtasks,
    setHelpModalVisible,
    setModalVisible,
    setSelectedTask,
  });
  
  // Initialize task addition
  const {
    newTaskText,
    taskPriority,
    repetitionInterval,
    scheduledDate,
    loading: additionLoading,
    setTaskPriority,
    setRepetitionInterval,
    setScheduledDate,
    handleInputChange: actualHandleInputChange,
    handleDateChange,
    resetDate,
    handleAddTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    MAX_SUBTASKS,
    handleAddTaskFromModal
  } = useTaskAddition(user, setReminders, setFutureReminders);
  
  // Use overdue tasks hook
  const {
    overdueTasks: overdueTasksList,
    showNotification: overdueShowNotification,
    setShowNotification: overdueSetShowNotification,
    handleCarryOver: handleCarryOverTasks,
    handleDelete: handleDeleteOverdueTasks,
  } = useOverdueTasks(user);
  
  // Platform-specific styles memoization
  const platformSpecificStyles = useMemo(() => {
    return Platform.select({
      ios: {
        shadow: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        buttonHighlight: {
          opacity: 0.7,
        }
      },
      android: {
        shadow: {
          elevation: 4,
        },
        buttonHighlight: {
          opacity: 0.5,
        }
      }
    });
  }, []);
  
  // Header section memoization
  const HeaderSection = useMemo(() => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setIsMenuVisible(true)}
        activeOpacity={Platform.OS === 'ios' ? 0.7 : 0.5}
      >
        <FontAwesome name="bars" size={24} color="#F7e8d3" />
      </TouchableOpacity>

      <View style={styles.headerTextContainer}>
        <Text style={styles.title}>
          {t('home.greeting', { name: userName || t('home.defaultName') })}
        </Text>
        <Text style={styles.subtitle}>
        {t('home.subtitle', { day: new Date().toLocaleDateString(i18n.language === 'ja' ? 'ja-JP' : 'en-US', { weekday: 'long' }) })}
      </Text>
      </View>

      <TouchableOpacity
        onPress={() => setHelpModalVisible(true)}
        style={[styles.helpButton, { transform: [{ scale: helpButtonScale }] }]}
        activeOpacity={Platform.OS === 'ios' ? 0.7 : 0.5}
      >
        <Ionicons name="help-circle-outline" size={24} color="#f7e8d3" />
      </TouchableOpacity>
    </View>
  ), [userName, helpButtonScale, setHelpModalVisible, setIsMenuVisible, t]);

  // In useEffect to check for navigation params:
useEffect(() => {
  if (navigation.getState().routes.find(r => r.name === 'Home')?.params?.updatedWallpaper) {
    const newWallpaper = navigation.getState().routes.find(r => r.name === 'Home').params.updatedWallpaper;
    setWallpaperSetting(newWallpaper);
    setWallpaperSource(getWallpaperSource(newWallpaper));
    
    // Clear the params to prevent re-processing
    navigation.setParams({ updatedWallpaper: undefined });
  }
}, [navigation]);

// In useEffect to fetch wallpaper from Firestore:
useEffect(() => {
  const fetchWallpaperSetting = async () => {
    if (user) {
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists && userDoc.data().wallpaperSetting) {
          const setting = userDoc.data().wallpaperSetting;
          setWallpaperSetting(setting);
          setWallpaperSource(getWallpaperSource(setting));
        }
      } catch (error) {
        console.error('Error fetching wallpaper setting:', error);
      }
    }
  };

  if (isFocused) {
    fetchWallpaperSetting();
  }
}, [isFocused, user]);
  

  // Check for expired timers when app is focused
  useEffect(() => {
    if (isFocused && user && checkForAllTimerTasksRequiringAttention) {
      console.log('App focused, checking for expired timer tasks');
      
      const checkExpiredTimers = async () => {
        try {
          const foundExpiredTask = await checkForAllTimerTasksRequiringAttention();
          
          if (foundExpiredTask) {
            console.log('Found and displayed expired timer task on app focus');
          } else {
            console.log('No expired timer tasks found on app focus');
          }
        } catch (error) {
          console.error('Error checking for expired timer tasks on focus:', error);
        }
      };
      
      checkExpiredTimers();
    }
  }, [isFocused, user, checkForAllTimerTasksRequiringAttention]);

  // Track app state changes for foreground/background handling
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Inform NotificationManager about app state changes
      if (NotificationManager.recordAppStateChange) {
        NotificationManager.recordAppStateChange(nextAppState);
      }
      
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        
        // Check for expired timer tasks
        if (user && checkForAllTimerTasksRequiringAttention) {
          checkForAllTimerTasksRequiringAttention()
            .then(hasExpiredTasks => {
              console.log(hasExpiredTasks ? 
                'Found expired timer tasks' : 
                'No expired timer tasks found');
            })
            .catch(error => {
              console.error('Error checking for expired timer tasks:', error);
            });
        }
      }
      
      appStateRef.current = nextAppState;
      setAppStateVisible(nextAppState);
    });
  
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, [user, checkForAllTimerTasksRequiringAttention]);

  // Handle rescheduled tasks when navigation focus changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      // Check if we have route params for a rescheduled task
      const params = navigation.getState().routes.find(r => r.name === 'Home')?.params;
      
      if (params?.rescheduleTaskId) {
        // Find the task in reminders
        try {
          const taskRef = doc(db, "reminders", params.rescheduleTaskId);
          const taskDoc = await getDoc(taskRef);
          
          if (taskDoc.exists()) {
            const task = { id: taskDoc.id, ...taskDoc.data() };
            
            // Only set as active if it has an active timer
            if (task.timerState?.isActive) {
              setActiveTimerTask(task);
              console.log('Setting active timer for rescheduled task:', task.id);
            }
          }
        } catch (error) {
          console.error('Error finding rescheduled task:', error);
        }
      }
    });
  
    return unsubscribe;
  }, [navigation, setActiveTimerTask]);

  // Initialize app data - The most important effect
  useEffect(() => {
    let mounted = true;

    const initializeHomeScreen = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
    
      try {
        await checkIfNewUser();
        await fetchUserName();
        const unsubscribe = fetchReminders();
        
        if (mounted) {
          // Check for any expired timers that require attention
          await checkForAllTimerTasksRequiringAttention();
          
          if (unsubscribeListeners.current && typeof unsubscribeListeners.current.push === 'function') {
            unsubscribeListeners.current.push(unsubscribe);
          }
          setIsLoading(false);
          setIsInitializing(false);
          startEntryAnimation();
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        if (mounted) {
          Alert.alert("Error", "Failed to load data. Please try again.");
          setIsLoading(false);
          setIsInitializing(false);
        }
      }
    };

    initializeHomeScreen();

    return () => {
      mounted = false;
      if (unsubscribeListeners.current && Array.isArray(unsubscribeListeners.current)) {
        unsubscribeListeners.current.forEach(unsubscribe => {
          if (typeof unsubscribe === 'function') unsubscribe();
        });
        unsubscribeListeners.current = [];
      }
    };
  }, [
    user, 
    checkIfNewUser, 
    fetchUserName, 
    fetchReminders, 
    checkForAllTimerTasksRequiringAttention, 
    unsubscribeListeners, 
    setIsLoading, 
    setIsInitializing, 
    startEntryAnimation
  ]);

  // Set up priority task when reminders change
  useEffect(() => {
    findHighestPriorityTask();
  }, [reminders, findHighestPriorityTask]);

  // Initialize notification system
  useEffect(() => {
    let responseSubscription = null;
    
    const setupNotifications = async () => {
      try {
        console.log('Setting up notifications...');
        
        // Initialize NotificationManager
        if (NotificationManager.initializeNotifications) {
          await NotificationManager.initializeNotifications();
        }
        
        // Set up notification response listener
        if (NotificationManager.addNotificationResponseReceivedListener) {
          responseSubscription = NotificationManager.addNotificationResponseReceivedListener(
            async response => {
              try {
                const data = response.notification.request.content.data || {};
                if (data.taskId && data.type === 'timer-completion') {
                  // Fetch the task and show the modal
                  const taskRef = doc(db, "reminders", data.taskId);
                  const taskDoc = await getDoc(taskRef);
                  
                  if (taskDoc.exists()) {
                    const task = { id: data.taskId, ...taskDoc.data() };
                    setCurrentReminderTask(task);
                    setTaskReminderModalVisible(true);
                  }
                }
              } catch (error) {
                console.error('Error handling notification response:', error);
              }
            }
          );
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };
    
    setupNotifications();
    
    return () => {
      if (responseSubscription && typeof NotificationManager.removeNotificationSubscription === 'function') {
        NotificationManager.removeNotificationSubscription(responseSubscription);
      }
    };
  }, [setCurrentReminderTask, setTaskReminderModalVisible]);
  
  // Optimized rendering for loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingText}>{t('home.loading')}</Text>
      </View>
    );
  }

  // Main render with optimized layout
  return (
    <>
      {wallpaperSetting.value === 'black' ? (
        <View style={[styles.container, { backgroundColor: '#000000' }]}>
          <View style={styles.overlay}>
            {HeaderSection}
            <Animated.View style={[styles.headerSeparator, { opacity: headerFadeAnim }]} />

            {/* Active Timer Component */}
            {activeTimerTask && (
              <Animated.View style={{ opacity: contentFadeAnim }}>
                <ActiveTimer 
                  task={activeTimerTask} 
                  onTimerComplete={handleTimerComplete} 
                />
              </Animated.View>
            )}

            <Animated.View style={[styles.fullscreenRemindersArea, { opacity: taskListFade }]}>
              <TaskList
                tasks={showFutureTasks ? futureReminders : reminders}
                showFutureTasks={showFutureTasks}
                onComplete={handleTaskComplete}
                onDelete={handleDeleteTask}
                onEdit={handleEdit}
                onAddSubtask={handleAddSubtask}
                fadeAnims={fadeAnims}
                deletingTaskId={deletingTaskId}
                onTaskPress={handleTaskClick}
                activeTimerTaskId={activeTimerTask?.id}
                highestPriorityTaskId={highestPriorityTask?.id}
              />
            </Animated.View>

            <Animated.View style={[styles.footerContainer, { opacity: footerFadeAnim }]}>
              <Animated.View style={{ opacity: buttonsFadeAnim, width: '100%' }}>
                <NavigationButtons
                  onNotesPress={() => navigation.navigate("Notes")}
                  onToggleFutureTasks={toggleFutureTasks}
                  showFutureTasks={showFutureTasks}
                />
                <BottomActionButtons
                  onProgressPress={() => setProgressReflectionsVisible(true)}
                  onAddTaskPress={openTaskInputModal}
                />
              </Animated.View>
            </Animated.View>
          </View>

          {/* XP Animations */}
          {xpGainAnimations.map(animation => (
            <XPGainAnimation
              key={animation.id}
              xpAmount={animation.xp}
              style={{
                transform: [
                  { translateX: animation.position.left },
                  { translateY: animation.position.top }
                ],
                position: 'absolute'
              }}
            />
          ))}

          {/* All modals - now consolidated into a single place instead of duplicated */}
          <SubtaskModal
            visible={subtaskModalVisible}
            onClose={() => setSubtaskModalVisible(false)}
            onSave={handleSaveSubtasks}
            task={selectedTaskForSubtasks}
          />

          <TaskInputModal
            visible={taskInputModalVisible}
            onClose={closeTaskInputModal}
            onSubmit={handleAddTaskFromModal}
            newTaskText={newTaskText}
            taskPriority={taskPriority}
            repetitionInterval={repetitionInterval}
            scheduledDate={scheduledDate}
            subtasks={subtasks}
            setSubtasks={setSubtasks}
            loading={loading}
            showDatePicker={showDatePicker}
            onTextChange={actualHandleInputChange}
            onPriorityChange={setTaskPriority}
            onIntervalChange={setRepetitionInterval}
            onDatePress={() => setShowDatePicker(true)}
            onDateChange={handleDateChange}
            onDatePickerClose={() => setShowDatePicker(false)}
            onResetDate={resetDate}
            onAddSubtask={addSubtask}
            onUpdateSubtask={updateSubtask}
            onDeleteSubtask={deleteSubtask}
            getFlagColor={getFlagColor}
            MAX_SUBTASKS={MAX_SUBTASKS}
          />

          {selectedTask && (
            <EditTaskModal
              visible={modalVisible}
              task={selectedTask}
              onClose={() => {
                setModalVisible(false);
                setSelectedTask(null);
              }}
              onSave={handleEdit}
            />
          )}

          <QuestCompletedModal 
            visible={isQuestCompletedVisible}
            onClose={() => setIsQuestCompletedVisible(false)}
          />

          <HelpModal 
            visible={isHelpModalVisible} 
            onClose={() => setHelpModalVisible(false)} 
          />

<MenuScreen
  isVisible={isMenuVisible}
  onClose={() => setIsMenuVisible(false)}
  highestPriorityTask={highestPriorityTask}
  onTimerComplete={handleTimerComplete}
  wallpaperSetting={wallpaperSetting} // Pass the wallpaper setting
/>

          <ProgressReflections 
            visible={isProgressReflectionsVisible}
            onClose={() => setProgressReflectionsVisible(false)}
          />

          <OverdueNotification 
            visible={showOverdueNotification}
            overdueTasksCount={overdueTasksList.length}
            overdueTasks={overdueTasksList}
            onCarryOver={handleCarryOverTasks}
            onDelete={handleDeleteOverdueTasks}
            onDismiss={() => setShowOverdueNotification(false)}
          />

          <TaskReminderModal
            visible={taskReminderModalVisible}
            task={currentReminderTask}
            dismissible={!(currentReminderTask?.timerState?.completedInForeground)}
            onDismiss={() => setTaskReminderModalVisible(false)}
            onComplete={() => {
              handleTaskComplete(currentReminderTask);
              setTaskReminderModalVisible(false);
              setTimeout(() => findHighestPriorityTask(), 500);
            }}
            onReschedule={() => handleTaskReschedule(currentReminderTask)}
            onDelete={() => {
              handleDeleteTask(currentReminderTask);
              setTaskReminderModalVisible(false);
              setTimeout(() => findHighestPriorityTask(), 500);
            }}
            onUpdateTimer={handleTimerStatusUpdate}
          />
        </View>
      ) : (
        <ImageBackground 
          source={wallpaperSource} 
          style={styles.container}
          resizeMode={Platform.OS === 'android' ? 'cover' : undefined}
          fadeDuration={0}
        >
          {/* Same content structure, reusing the components */}
          <View style={styles.overlay}>
            {HeaderSection}
            <Animated.View style={[styles.headerSeparator, { opacity: headerFadeAnim }]} />

            {activeTimerTask && (
              <Animated.View style={{ opacity: contentFadeAnim }}>
                <ActiveTimer 
                  task={activeTimerTask} 
                  onTimerComplete={handleTimerComplete} 
                />
              </Animated.View>
            )}

<Animated.View 
  style={[
    styles.fullscreenRemindersArea, 
    { opacity: taskListFade }
  ]}
>
  <TaskList
    tasks={showFutureTasks ? futureReminders : reminders}
    showFutureTasks={showFutureTasks}
    onComplete={handleTaskComplete}
    onDelete={handleDeleteTask}
    onEdit={handleEdit}
    onAddSubtask={handleAddSubtask}
    fadeAnims={fadeAnims}
    deletingTaskId={deletingTaskId}
    onTaskPress={handleTaskClick}
    activeTimerTaskId={activeTimerTask?.id}
    highestPriorityTaskId={highestPriorityTask?.id}
  />
</Animated.View>

            <Animated.View style={[styles.footerContainer, { opacity: footerFadeAnim }]}>
              <Animated.View style={{ opacity: buttonsFadeAnim, width: '100%' }}>
                <NavigationButtons
                  onNotesPress={() => navigation.navigate("Notes")}
                  onToggleFutureTasks={toggleFutureTasks}
                  showFutureTasks={showFutureTasks}
                />
                <BottomActionButtons
                  onProgressPress={() => setProgressReflectionsVisible(true)}
                  onAddTaskPress={openTaskInputModal}
                />
              </Animated.View>
            </Animated.View>
          </View>

          {/* XP Animations */}
          {xpGainAnimations.map(animation => (
            <XPGainAnimation
              key={animation.id}
              xpAmount={animation.xp}
              style={{
                transform: [
                  { translateX: animation.position.left },
                  { translateY: animation.position.top }
                ],
                position: 'absolute'
              }}
            />
          ))}

          {/* All modals - referencing the same components to avoid duplication */}
          <SubtaskModal
            visible={subtaskModalVisible}
            onClose={() => setSubtaskModalVisible(false)}
            onSave={handleSaveSubtasks}
            task={selectedTaskForSubtasks}
          />

          <TaskInputModal
            visible={taskInputModalVisible}
            onClose={closeTaskInputModal}
            onSubmit={handleAddTaskFromModal}
            newTaskText={newTaskText}
            taskPriority={taskPriority}
            repetitionInterval={repetitionInterval}
            scheduledDate={scheduledDate}
            subtasks={subtasks}
            setSubtasks={setSubtasks}
            loading={loading}
            showDatePicker={showDatePicker}
            onTextChange={actualHandleInputChange}
            onPriorityChange={setTaskPriority}
            onIntervalChange={setRepetitionInterval}
            onDatePress={() => setShowDatePicker(true)}
            onDateChange={handleDateChange}
            onDatePickerClose={() => setShowDatePicker(false)}
            onResetDate={resetDate}
            onAddSubtask={addSubtask}
            onUpdateSubtask={updateSubtask}
            onDeleteSubtask={deleteSubtask}
            getFlagColor={getFlagColor}
            MAX_SUBTASKS={MAX_SUBTASKS}
          />

          {selectedTask && (
            <EditTaskModal
              visible={modalVisible}
              task={selectedTask}
              onClose={() => {
                setModalVisible(false);
                setSelectedTask(null);
              }}
              onSave={handleEdit}
            />
          )}

          <QuestCompletedModal 
            visible={isQuestCompletedVisible}
            onClose={() => setIsQuestCompletedVisible(false)}
          />

          <HelpModal 
            visible={isHelpModalVisible} 
            onClose={() => setHelpModalVisible(false)} 
          />

<MenuScreen
  isVisible={isMenuVisible}
  onClose={() => setIsMenuVisible(false)}
  highestPriorityTask={highestPriorityTask}
  onTimerComplete={handleTimerComplete}
  wallpaperSetting={wallpaperSetting}
  preRender={true} // New prop to enable pre-rendering
/>

          <ProgressReflections 
            visible={isProgressReflectionsVisible}
            onClose={() => setProgressReflectionsVisible(false)}
          />

          <OverdueNotification 
            visible={showOverdueNotification}
            overdueTasksCount={overdueTasksList.length}
            overdueTasks={overdueTasksList}
            onCarryOver={handleCarryOverTasks}
            onDelete={handleDeleteOverdueTasks}
            onDismiss={() => setShowOverdueNotification(false)}
          />

          <TaskReminderModal
            visible={taskReminderModalVisible}
            task={currentReminderTask}
            dismissible={!(currentReminderTask?.timerState?.completedInForeground)}
            onDismiss={() => setTaskReminderModalVisible(false)}
            onComplete={() => {
              handleTaskComplete(currentReminderTask);
              setTaskReminderModalVisible(false);
              setTimeout(() => findHighestPriorityTask(), 500);
            }}
            onReschedule={() => handleTaskReschedule(currentReminderTask)}
            onDelete={() => {
              handleDeleteTask(currentReminderTask);
              setTaskReminderModalVisible(false);
              setTimeout(() => findHighestPriorityTask(), 500);
            }}
            onUpdateTimer={handleTimerStatusUpdate}
          />
        </ImageBackground>
      )}
    </>
  );
};

export default React.memo(HomeScreen);