import * as Notifications from 'expo-notifications';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getDocument, updateDocument } from '../screens/firebase-services';
import NotificationManager from '../notifications/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: 'high'
  }),
});

export const useNotificationSubscriptions = (
  reminders,
  setCurrentReminderTask,
  setShowTaskReminderModal,
  user,
  onTaskComplete,
  onTaskDelete
) => {
  const [highestPriorityTask, setHighestPriorityTask] = useState(null);
  const notificationHandled = useRef({});

  const findAndSetHighestPriorityTask = useCallback(() => {
    if (!reminders || reminders.length === 0) {
      setHighestPriorityTask(null);
      return;
    }

    const priorityOrder = {
      'Urgent': 4,
      'High': 3,
      'Medium': 2,
      'Lowest': 1
    };

    const highestPriority = reminders.reduce((highest, current) => {
      // Skip completed tasks
      if (current.completed) return highest;
      
      // If no highest task yet, use current
      if (!highest) return current;
      
      // Compare priority levels
      const currentPriorityLevel = priorityOrder[current.priority] || 0;
      const highestPriorityLevel = priorityOrder[highest.priority] || 0;
      
      if (currentPriorityLevel > highestPriorityLevel) {
        return current;
      }
      
      // If same priority, use the one with earlier deadline
      if (currentPriorityLevel === highestPriorityLevel && 
          current.scheduledFor && highest.scheduledFor) {
        const currentDate = new Date(current.scheduledFor);
        const highestDate = new Date(highest.scheduledFor);
        return currentDate < highestDate ? current : highest;
      }
      
      return highest;
    }, null);

    setHighestPriorityTask(highestPriority);
  }, [reminders]);

  const startTaskTimer = useCallback(async (task) => {
    if (!task?.id) return;
    try {
      console.log('Starting timer for task:', task.id);
      await NotificationManager.scheduleTaskNotification(task);
    } catch (error) {
      console.error('Error starting task timer:', error);
    }
  }, []);

  const handleNotification = useCallback((notification) => {
    const data = notification.request?.content.data;
    const taskId = data?.taskId;
    if (!taskId || notificationHandled.current[taskId]) return;

    const task = reminders.find(t => t.id === taskId);
    if (task) {
      notificationHandled.current[taskId] = true;
      setCurrentReminderTask(task);
      setShowTaskReminderModal(true);
      // Clear handled flag after a delay
      setTimeout(() => {
        delete notificationHandled.current[taskId];
      }, 1000);
    }
  }, [reminders, setCurrentReminderTask, setShowTaskReminderModal]);

  const handleTaskCompletion = async (taskId) => {
    try {
      // Use a lock while processing to prevent duplicates
      const isRecentlyProcessed = await NotificationManager.wasNotificationRecentlySent(taskId);
      if (isRecentlyProcessed) {
        console.log('Task was recently processed, avoiding duplicate completion');
        return true;
      }
      
      // Get the task data using standardized method
      const task = await getDocument("reminders", taskId);
      
      if (!task) {
        console.error('Task not found:', taskId);
        return false;
      }
      
      // Mark as being processed to prevent duplicates
      await NotificationManager.markNotificationAsSent(taskId);
      
      // Complete the task
      await NotificationManager.completeTask(task);
      
      // Update user statistics
      if (user && user.uid) {
        try {
          await NotificationManager.updateUserStats(user.uid, 'tasksCompleted', 1);
          await NotificationManager.updateUserStats(user.uid, 'totalXP', 10);
        } catch (statsError) {
          console.error('Error updating user stats:', statsError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  };  

  const handleTaskReschedule = async (taskId, intervalIndex = 0) => {
    try {
      // Use a lock while processing to prevent duplicates
      const isRecentlyProcessed = await NotificationManager.wasNotificationRecentlySent(taskId);
      if (isRecentlyProcessed) {
        console.log('Task was recently processed, avoiding duplicate reschedule');
        return true;
      }
      
      // Mark as being processed to prevent duplicates
      await NotificationManager.markNotificationAsSent(taskId);
      
      // Reschedule the task
      await NotificationManager.rescheduleTaskNotification(taskId, intervalIndex);
      
      return true;
    } catch (error) {
      console.error('Error rescheduling task:', error);
      return false;
    }
  };

  // Update highest priority task whenever reminders change
  useEffect(() => {
    findAndSetHighestPriorityTask();
  }, [reminders, findAndSetHighestPriorityTask]);

  useEffect(() => {
    const subscription = NotificationManager.addNotificationReceivedListener(handleNotification);
    const responseSubscription = NotificationManager.addNotificationResponseReceivedListener(
      response => handleNotification(response.notification)
    );

    return () => {
      if (subscription) {
        NotificationManager.removeNotificationSubscription(subscription);
      }
      if (responseSubscription) {
        NotificationManager.removeNotificationSubscription(responseSubscription);
      }
    };
  }, [handleNotification]);

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        await NotificationManager.initialize();
        console.log('Notification system initialized successfully');
      } catch (error) {
        console.error('Error initializing notification system:', error);
      }
    };

    if (user?.uid) {
      initializeSystem();
    }
  }, [user?.uid]);

  // Handle task deletion
  const handleTaskDeletion = useCallback(async (task) => {
    if (!task?.id) return;
    try {
      // Cancel any existing notification
      if (task.notificationId) {
        await NotificationManager.cancelNotification(task.notificationId);
      }
      
      // Call external delete handler if provided
      if (onTaskDelete && typeof onTaskDelete === 'function') {
        await onTaskDelete(task);
      }
      
      // Close modal if open
      setShowTaskReminderModal(false);
      
      // Recalculate highest priority task
      setTimeout(() => {
        findAndSetHighestPriorityTask();
      }, 300);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [onTaskDelete, findAndSetHighestPriorityTask]);

  return {
    startTaskTimer,
    handleTaskCompletion,
    handleTaskReschedule,
    handleTaskDeletion,
    highestPriorityTask,
    findAndSetHighestPriorityTask
  };
};

export default useNotificationSubscriptions;