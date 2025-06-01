// useNotificationHandler.js
import { useEffect, useCallback, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { doc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../screens/firebaseConfig';
import { registerForPushNotificationsAsync, parseNotificationData } from '../screens/notificationUtils.js';
import NotificationSystem from '../notifications/NotificationSystem';

/**
 * Custom hook for handling all notification-related functionality
 */
export const useNotificationHandler = (
  user,
  reminders,
  setCurrentReminderTask,
  setTaskReminderModalVisible,
  handleTaskComplete,
  handleDeleteTask,
  handleTaskReschedule
) => {
  const [notificationToken, setNotificationToken] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(false);
  
  /**
   * Initialize notifications and request permissions
   */
  const initializeNotifications = useCallback(async () => {
    try {
      // Initialize notification system
      await NotificationSystem.initialize();
      
      // Register for push notifications
      const token = await registerForPushNotificationsAsync();
      setNotificationToken(token);
      setNotificationPermission(!!token);
      
      return !!token;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }, []);
  
  /**
   * Handle a notification response (when user taps notification)
   */
  const handleNotificationResponse = useCallback(async (response) => {
    try {
      const data = parseNotificationData(response.notification);
      
      if (!data.taskId) return;
      
      // Find task in state first for better performance
      let task = reminders.find(t => t.id === data.taskId);
      
      // If not found in state, try to get from Firestore
      if (!task) {
        const taskDoc = await getDoc(doc(db, "reminders", data.taskId));
        if (!taskDoc.exists()) {
          console.log('Task no longer exists:', data.taskId);
          return;
        }
        
        task = {
          ...taskDoc.data(),
          id: taskDoc.id
        };
      }
      
      // Handle action based on notification data
      switch (data.action) {
        case 'complete':
          handleTaskComplete(task);
          break;
        
        case 'reschedule':
          handleTaskReschedule(task);
          break;
        
        case 'delete':
          handleDeleteTask(task);
          break;
        
        default:
          // Default action is to show the reminder modal
          setCurrentReminderTask(task);
          setTaskReminderModalVisible(true);
          break;
      }
    } catch (error) {
      console.error('Error handling notification response:', error);
    }
  }, [reminders, handleTaskComplete, handleTaskReschedule, handleDeleteTask, setCurrentReminderTask, setTaskReminderModalVisible]);
  
  /**
   * Check for any tasks with timers that should have completed
   * during the time the app was closed
   */
  const checkPendingTimers = useCallback(async () => {
    if (!Array.isArray(reminders) || !user?.uid) return;
    
    const now = new Date();
    
    // Find tasks with active timers
    const tasksWithActiveTimers = reminders.filter(task => 
      task.timerState?.isActive && 
      task.timerState?.startTime && 
      task.timerState?.duration
    );
    
    for (const task of tasksWithActiveTimers) {
      try {
        // Calculate if timer should have ended
        const startTime = new Date(task.timerState.startTime);
        const durationMs = parseInt(task.timerState.duration) * 60 * 1000;
        const endTime = new Date(startTime.getTime() + durationMs);
        
        // If timer should have ended
        if (endTime < now) {
          // Update timer state in Firestore
          await updateDoc(doc(db, "reminders", task.id), {
            'timerState.isActive': false,
            'timerState.completedAt': serverTimestamp()
          });
          
          // Show the reminder modal
          setCurrentReminderTask(task);
          setTaskReminderModalVisible(true);
          
          // Only process one at a time to avoid multiple modals
          break;
        }
      } catch (error) {
        console.error('Error checking pending timer for task:', task.id, error);
      }
    }
  }, [reminders, user, setCurrentReminderTask, setTaskReminderModalVisible]);
  
  // Set up notification listeners when component mounts
  useEffect(() => {
    // Initialize notifications
    initializeNotifications();
    
    // Set up notification received listener (app in foreground)
// In useNotificationHandler.js, update the notification received listener
const receivedSubscription = NotificationSystem.addNotificationReceivedListener(async notification => {
  const { taskId } = notification.request.content.data || {};
  
  if (!taskId) return;
  
  // Check if this notification was recently handled
  const isRecentlyProcessed = await NotificationSystem.wasNotificationRecentlySent(taskId);
  if (isRecentlyProcessed) {
    console.log(`[NOTIFICATION_HANDLER] Task ${taskId} was recently processed, skipping duplicate notification`);
    return;
  }
  
  // Mark as processing to prevent duplicates
  await NotificationSystem.markNotificationAsSent(taskId);
  
  // Find the task in our state
  const task = reminders.find(t => t.id === taskId);
  if (task) {
    setCurrentReminderTask(task);
    setTaskReminderModalVisible(true);
  }
});
    
    // Set up notification response listener (user interaction)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    
    // Check for pending timers on mount
    checkPendingTimers();
    
    // Clean up subscriptions on unmount
    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [initializeNotifications, reminders, handleNotificationResponse, checkPendingTimers]);
  
  return {
    notificationToken,
    notificationPermission,
    initializeNotifications,
    checkPendingTimers
  };
};

export default useNotificationHandler;