// Using centralized Firebase implementation
import { db, firestore, FieldValue, createDocument, updateDocument, getDocument, deleteDocument } from "../screens/firebase-services";
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from "../i18n";

export const NOTIFICATION_INTERVALS = [5, 10, 15, 30];
export const DEFAULT_INTERVAL = 5;

// Helper function to check if a notification was recently sent
async function wasNotificationRecentlySent(taskId) {
  try {
    const recentNotificationKey = `recent_notification_${taskId}`;
    const recentNotificationData = await AsyncStorage.getItem(recentNotificationKey);
    
    if (recentNotificationData) {
      const { timestamp } = JSON.parse(recentNotificationData);
      // If notification was sent in the last 5 seconds, it's a duplicate
      if (Date.now() - timestamp < 5000) {
        console.log(`Found recent notification for task ${taskId}, age: ${(Date.now() - timestamp)/1000}s`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking recent notifications:', error);
    return false;
  }
}

// Helper function to mark a notification as sent
async function markNotificationAsSent(taskId) {
  try {
    const recentNotificationKey = `recent_notification_${taskId}`;
    await AsyncStorage.setItem(recentNotificationKey, JSON.stringify({
      timestamp: Date.now()
    }));
    return true;
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    return false;
  }
}

export const initializeNotifications = async () => {
  console.log('Starting notification initialization');

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('Current notification permission status:', existingStatus);

    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('New notification permission status:', status);
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get notification permissions');
      return false;
    }

    console.log('Setting up notification handler');
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    console.log('Notification system initialized successfully');
    return true;
  } catch (error) {
    console.error('Error in initializeNotifications:', {
      errorMessage: error.message,
      errorStack: error.stack
    });
    return false;
  }
};

export const scheduleTaskNotification = async (task) => {
  try {
    if (!task?.id) {
      console.error('Invalid task for notification scheduling');
      return null;
    }
    
    // Check if notification was recently sent
    if (await wasNotificationRecentlySent(task.id)) {
      console.log(`Notification recently sent for task ${task.id}. Skipping duplicate.`);
      return null;
    }

    // Cancel any existing notification
    await cancelTaskNotification(task.id);

    // Get interval from task or use default
    const interval = task.intervals?.[0] || DEFAULT_INTERVAL;
    if (!NOTIFICATION_INTERVALS.includes(interval)) {
      console.error('Invalid interval specified:', interval);
      return null;
    }
    
    // Use consistent identifier
    const identifier = `task_${task.id}`;

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: task.rescheduleCount > 0 ? 'Task Rescheduled' : "Time's Up!",
        body: task.rescheduleCount > 0 
          ? `This task has been rescheduled ${task.rescheduleCount} times: ${task.text}`
          : `Time to work on "${task.text}"`,
        data: { 
          taskId: task.id,
          timestamp: Date.now()
        },
        sound: true,
        priority: 'high',
      },
      trigger: { 
        seconds: interval * 60 
      },
    });
    
    // Mark this notification as sent to prevent duplicates
    await markNotificationAsSent(task.id);

    // Update task in database with timer state
    await db.collection("reminders").doc(task.id).update({
      'timerState': {
        startTime: new Date().toISOString(),
        duration: interval,
        isActive: true,
        notificationId: identifier,
        notificationStatus: 'scheduled'
      }
    });

    console.log(`Scheduled notification for task ${task.id} with interval ${interval} minutes`);
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const updateUserStats = async (userId, field, value) => {
  try {
    const userStatsRef = db.collection("userStats").doc(userId);
    const statsDoc = await userStatsRef.get();

    if (!statsDoc.exists) {
      await userStatsRef.set({
        [field]: value,
        createdAt: new Date().toISOString()
      });
    } else {
      await userStatsRef.update({
        [field]: FieldValue.increment(value)
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

export const createTaskWithTimer = async (taskData) => {
  try {
    const reminderRef = db.collection("reminders");
    const now = new Date();
    
    const interval = taskData.intervals?.[0] || DEFAULT_INTERVAL;
    const endTime = new Date(now.getTime() + (interval * 60000));

    const taskWithTimer = {
      ...taskData,
      timerState: {
        startTime: now.toISOString(),
        duration: interval,
        isActive: true,
        notificationStatus: 'scheduled',
        scheduledFor: endTime.toISOString()
      },
      createdAt: now.toISOString()
    };

    const docRef = await reminderRef.add(taskWithTimer);
    const taskId = docRef.id;
    
    // Immediately schedule notification
    await scheduleTaskNotification({
      id: taskId,
      ...taskWithTimer
    });
    
    return taskId;
  } catch (error) {
    console.error("Error creating task with timer:", error);
    throw error;
  }
};

const getHighestPriorityTask = async () => {
  try {
    const querySnapshot = await db.collection("reminders")
      .where("completed", "==", false)
      .orderBy("priority")
      .get();
    
    if (querySnapshot.empty) return null;
    
    const task = querySnapshot.docs[0];
    return { id: task.id, ...task.data() };
  } catch (error) {
    console.error("Error getting highest priority task:", error);
    return null;
  }
};

export const isHighestPriorityTask = async (taskId) => {
  try {
    const highestTask = await getHighestPriorityTask();
    return highestTask && highestTask.id === taskId;
  } catch (error) {
    console.error("Error checking if task is highest priority:", error);
    return false;
  }
};

export const scheduleTaskNotifications = async (tasks) => {
  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Sort tasks by priority
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Lowest': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Schedule notification for highest priority task
    if (sortedTasks.length > 0) {
      await scheduleTaskNotification(sortedTasks[0]);
    }

    return true;
  } catch (error) {
    console.error('Error scheduling multiple notifications:', error);
    return false;
  }
};

export const cancelTaskNotification = async (taskId) => {
  try {
    const identifier = `task_${taskId}`;
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log(`Cancelled notification for task ID: ${taskId}`);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

export const rescheduleTaskNotification = async (taskId, intervalIndex) => {
  try {
    const taskRef = db.collection("reminders").doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) return false;
    
    const task = taskDoc.data();
    const interval = task.intervals?.[intervalIndex] || task.intervals?.[0] || 5;
    
    // Check if notification was recently sent
    if (await wasNotificationRecentlySent(taskId)) {
      console.log(`Notification recently sent for task ${taskId}. Proceeding with caution.`);
    }
    
    await taskRef.update({
      rescheduleCount: (task.rescheduleCount || 0) + 1,
      'timerState.startTime': new Date().toISOString(),
      'timerState.notificationStatus': 'pending'
    });

    if (await isHighestPriorityTask(taskId)) {
      await scheduleTaskNotification({
        ...task,
        id: taskId,
        intervals: [interval]
      });
    }
    
    // Mark this notification as sent to prevent duplicates
    await markNotificationAsSent(taskId);

    return true;
  } catch (error) {
    console.error("Error rescheduling notification:", error);
    throw error;
  }
};

export const deleteReminder = async (taskId) => {
  try {
    await db.collection("reminders").doc(taskId).delete();
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

export const completeTask = async (taskId) => {
  try {
    // Check if notification was recently sent
    if (await wasNotificationRecentlySent(taskId)) {
      console.log(`Recent notification detected for task ${taskId}, proceeding with caution`);
    }
    
    await cancelTaskNotification(taskId);
    
    await db.collection("reminders").doc(taskId).update({
      completed: true,
      completedAt: new Date().toISOString(),
      'timerState.isActive': false,
      'timerState.notificationStatus': 'completed'
    });
    
    // Mark notification as sent to prevent duplicates
    await markNotificationAsSent(taskId);

    const nextTask = await getHighestPriorityTask();
    if (nextTask) {
      await scheduleTaskNotification(nextTask);
    }

    return true;
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
};

export const updateTask = async (taskId, updatedData) => {
  try {
    const taskRef = db.collection("reminders").doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      throw new Error("Task not found");
    }

    const existingTask = taskDoc.data();
    const wasHighestPriority = await isHighestPriorityTask(taskId);
    
    const timerState = {
      ...existingTask.timerState,
      duration: updatedData.intervals?.[0] || existingTask.timerState.duration
    };

    if (wasHighestPriority && 
        updatedData.intervals?.[0] !== existingTask.intervals?.[0]) {
      await cancelTaskNotification(taskId);
      
      const updatedTask = {
        ...updatedData,
        id: taskId,
        timerState: {
          ...timerState,
          startTime: new Date().toISOString(),
          notificationStatus: 'pending'
        }
      };
      
      await taskRef.update(updatedTask);
      await scheduleTaskNotification(updatedTask);
    } else {
      await taskRef.update({
        ...updatedData,
        timerState
      });
    }

    return true;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};