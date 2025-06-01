import * as Notifications from 'expo-notifications';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import from centralized Firebase implementation
import { auth, db, FieldValue } from '../firebase/init';

// Create a notification lock to prevent duplicates
const notificationLocks = new Map();

// Define constants
export const NOTIFICATION_INTERVALS = [5, 10, 15, 30];
export const DEFAULT_INTERVAL = 5;

// Set up notification channels for Android
const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6347',
      sound: true,
    });
  }
};

// Configure notifications for iOS and Android
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH
  }),
});

// More robust helper function to check if a notification was recently sent
async function wasNotificationRecentlySent(taskId) {
  if (!taskId) return false;
  
  try {
    // First check in-memory locks
    if (notificationLocks.has(taskId)) {
      const lockInfo = notificationLocks.get(taskId);
      // If lock is less than 10 seconds old, consider it a duplicate
      if (Date.now() - lockInfo.timestamp < 10000) {
        console.log(`In-memory lock found for task ${taskId}, age: ${(Date.now() - lockInfo.timestamp)/1000}s`);
        return true;
      }
    }
    
    // Then check persistent storage
    const recentNotificationKey = `recent_notification_${taskId}`;
    const recentNotificationData = await AsyncStorage.getItem(recentNotificationKey);
    
    if (recentNotificationData) {
      const { timestamp } = JSON.parse(recentNotificationData);
      // If notification was sent in the last 10 seconds, it's a duplicate
      if (Date.now() - timestamp < 10000) {
        console.log(`Found recent notification for task ${taskId}, age: ${(Date.now() - timestamp)/1000}s`);
        return true;
      }
    }
    
    // Finally, check if there's already a pending notification
    const pendingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const existingNotification = pendingNotifications.find(
      n => n.identifier === `task_${taskId}` || 
           (n.content.data && n.content.data.taskId === taskId)
    );
    
    if (existingNotification) {
      console.log(`Found existing scheduled notification for task ${taskId}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking recent notifications:', error);
    return false;
  }
}

// Helper function to mark a notification as sent
async function markNotificationAsSent(taskId) {
  if (!taskId) return false;
  
  try {
    // Set both in-memory and persistent locks
    notificationLocks.set(taskId, {
      timestamp: Date.now(),
      status: 'sent'
    });
    
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

// Request permissions for notifications
async function requestNotificationPermissions() {
  try {
    console.log('Requesting notification permissions...');
    
    if (Platform.OS === 'ios') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
            allowsCriticalAlerts: true,
            provideAppNotificationSettings: true,
          },
        });
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for notification!');
        return false;
      }
      
      await setupNotificationCategories();
      
    } else {
      // Android permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted!');
        return false;
      }
      
      // Set up Android channels
      await setupNotificationChannels();
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Set up notification categories for iOS action buttons
async function setupNotificationCategories() {
  if (Platform.OS !== 'ios') return true;
  
  try {
    await Notifications.setNotificationCategoryAsync('task-reminder', [
      {
        identifier: 'complete',
        buttonTitle: 'Complete',
        options: {
          isAuthenticationRequired: false,
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'reschedule',
        buttonTitle: 'Reschedule',
        options: {
          isAuthenticationRequired: false,
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'delete',
        buttonTitle: 'Delete',
        options: {
          isDestructive: true,
          isAuthenticationRequired: false,
          opensAppToForeground: true,
        },
      },
    ]);
    
    // Set up other categories like break-prompt
    await Notifications.setNotificationCategoryAsync('break-prompt', [
      {
        identifier: 'yes',
        buttonTitle: 'Yes, take a break',
        options: { isDestructive: false, isAuthenticationRequired: false },
      },
      {
        identifier: 'no',
        buttonTitle: 'No, continue working',
        options: { isDestructive: false, isAuthenticationRequired: false },
      },
    ]);
    
    await Notifications.setNotificationCategoryAsync('break-end', [
      {
        identifier: 'resume',
        buttonTitle: "I'm ready",
        options: { isDestructive: false, isAuthenticationRequired: false },
      },
      {
        identifier: 'extend',
        buttonTitle: 'Need more time',
        options: { isDestructive: false, isAuthenticationRequired: false },
      },
    ]);
    
    return true;
  } catch (error) {
    console.error('Error setting up notification categories:', error);
    return false;
  }
}

// Wrapper functions for Notifications subscription handling
function addNotificationReceivedListener(listener) {
  return Notifications.addNotificationReceivedListener(async notification => {
    const data = notification.request.content.data;
    // Mark notification as sent when received to prevent duplicates
    if (data && data.taskId) {
      await markNotificationAsSent(data.taskId);
    }
    
    // Call the original listener
    if (typeof listener === 'function') {
      listener(notification);
    }
  });
}

function addNotificationResponseReceivedListener(listener) {
  return Notifications.addNotificationResponseReceivedListener(async response => {
    const data = response.notification.request.content.data;
    // Mark notification as sent when responded to
    if (data && data.taskId) {
      await markNotificationAsSent(data.taskId);
    }
    
    // Call the original listener
    if (typeof listener === 'function') {
      listener(response);
    }
  });
}

function removeNotificationSubscription(subscription) {
  if (subscription && typeof subscription.remove === 'function') {
    subscription.remove();
  }
}

function registerTaskAsync(taskName) {
  return Notifications.registerTaskAsync(taskName);
}

function setNotificationCategoryAsync(categoryId, actions) {
  return Notifications.setNotificationCategoryAsync(categoryId, actions);
}

// Initialize notifications
async function initialize() {
  console.log('Initializing notification system...');
  await cancelAllNotifications(); // Clear any existing notifications
  clearNotificationLocks(); // Clear in-memory locks
  return requestNotificationPermissions();
}

// Alias for initialize
function initializeNotifications() {
  return initialize();
}

// Schedule a notification for when a task timer is complete
async function scheduleTaskCompletionNotification(task) {
  if (!task?.id || !task.text) {
    console.log('Invalid task data for notification');
    return null;
  }
  
  // Check if there's already a notification being processed for this task
  if (await wasNotificationRecentlySent(task.id)) {
    console.log(`Notification already processed for task ${task.id}. Skipping duplicate.`);
    return { notificationId: null, skipped: true };
  }
  
  try {
    // Mark this notification as being processed immediately
    await markNotificationAsSent(task.id);
    
    // Cancel any existing notifications for this task
    await cancelNotification(`task_${task.id}`);
    
    // Reset notification delivery state
    const taskRef = db.collection("reminders").doc(task.id);
    await taskRef.update({ notificationDelivered: false });
    
    // Calculate trigger time
    const triggerTime = new Date();
    const interval = task.interval || DEFAULT_INTERVAL;
    triggerTime.setMinutes(triggerTime.getMinutes() + parseInt(interval));
    
    // Create the notification content
    const title = task.rescheduleCount > 0 
      ? "Task Rescheduled" 
      : "Time's Up!";
    
    const body = task.rescheduleCount > 0
      ? `This is the ${getOrdinalSuffix(task.rescheduleCount)} time for "${task.text}"`
      : `Have you completed "${task.text}"?`;
    
    // Create consistent identifier
    const identifier = `task_${task.id}`;
    
    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      identifier: identifier, 
      content: {
        title,
        body,
        sound: true,
        badge: 1,
        priority: 'high',
        data: {
          taskId: task.id,
          priority: task.priority,
          interval: interval,
          rescheduleCount: task.rescheduleCount || 0,
          type: 'timer-completion',
          action: 'open',
          timestamp: Date.now()
        },
        categoryIdentifier: Platform.OS === 'ios' ? 'task-reminder' : undefined,
        channelId: Platform.OS === 'android' ? 'task-reminders' : undefined
      },
      trigger: { date: triggerTime },
    });
    
    // Update task in Firestore with timer state
    await taskRef.update({
      notificationId: identifier,
      nextReminderTime: triggerTime.toISOString(),
      'timerState.startTime': new Date().toISOString(),
      'timerState.duration': parseInt(interval),
      'timerState.isActive': true,
      'timerState.notificationStatus': 'scheduled'
    });
    
    // Return notification data
    return {
      notificationId: identifier,
      nextReminderTime: triggerTime.toISOString()
    };
  } catch (error) {
    console.error('Error scheduling task completion notification:', error);
    return null;
  }
}

// Alias for scheduleTaskCompletionNotification
function scheduleTaskNotification(task) {
  return scheduleTaskCompletionNotification(task);
}

// Helper to get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return num + "st";
  }
  if (j === 2 && k !== 12) {
    return num + "nd";
  }
  if (j === 3 && k !== 13) {
    return num + "rd";
  }
  return num + "th";
}

// Cancel a notification
async function cancelNotification(notificationId) {
  if (!notificationId) return false;
  
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    // Also try cancelling by the task ID format if a bare ID was provided
    if (!notificationId.startsWith('task_')) {
      await Notifications.cancelScheduledNotificationAsync(`task_${notificationId}`);
    }
    return true;
  } catch (error) {
    console.error('Error cancelling notification:', error);
    return false;
  }
}

// Get all pending notifications
async function getAllPendingNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    return [];
  }
}

// Alias for getAllPendingNotifications
function getPendingNotifications() {
  return getAllPendingNotifications();
}

// Cancel all notifications
async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
    // Clear all notification locks
    clearNotificationLocks();
    return true;
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
    return false;
  }
}

// Get lock status for debugging
function getNotificationLockStatus(taskId) {
  return notificationLocks.has(taskId) ? notificationLocks.get(taskId) : null;
}

// Clear notification locks
function clearNotificationLocks() {
  notificationLocks.clear();
  console.log('Notification locks cleared');
}

// Complete a task
async function completeTask(task) {
  if (!task?.id) {
    console.error('Invalid task object for completion');
    return false;
  }
  
  try {
    // Check for recent notifications to prevent duplicates
    if (await wasNotificationRecentlySent(task.id)) {
      console.log(`Recent activity detected for task ${task.id}, proceeding with caution`);
    } else {
      // Mark this task as processed to prevent duplicates
      await markNotificationAsSent(task.id);
    }
    
    // Cancel the notification if it exists
    if (task.notificationId) {
      await cancelNotification(task.notificationId);
    }
    
    // Update task document with completion status
    const taskRef = db.collection("reminders").doc(task.id);
    await taskRef.update({
      completed: true,
      completedAt: FieldValue.serverTimestamp(),
      'timerState.isActive': false,
      'timerState.completedAt': FieldValue.serverTimestamp(),
      'timerState.notificationStatus': 'completed',
      notificationDelivered: true,
      notificationId: null
    });
    
    return true;
  } catch (error) {
    console.error('Error completing task:', error);
    return false;
  }
}

// Delete a task
async function deleteTask(task) {
  if (!task?.id) {
    console.error('Invalid task object for deletion');
    return false;
  }
  
  try {
    // Cancel the notification if it exists
    if (task.notificationId) {
      await cancelNotification(task.notificationId);
    }
    
    // Delete the task document
    await db.collection("reminders").doc(task.id).delete();
    
    // Clear lock
    notificationLocks.delete(task.id);
    
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

// Alias for deleteTask
function deleteReminder(taskId) {
  return deleteTask({ id: taskId });
}

// Reschedule a task
async function rescheduleTask(task) {
  if (!task?.id) {
    console.error('Invalid task object for rescheduling');
    return null;
  }
  
  try {
    // Check if notification was recently sent
    if (await wasNotificationRecentlySent(task.id)) {
      console.log(`Notification recently processed for task ${task.id}. Skipping duplicate.`);
      return null;
    }
    
    // Mark this task as being processed immediately
    await markNotificationAsSent(task.id);
    
    // Get the current reschedule count
    const taskRef = db.collection("reminders").doc(task.id);
    const taskDoc = await taskRef.get();
    const currentTask = taskDoc.exists ? taskDoc.data() : task;
    const rescheduleCount = (currentTask.rescheduleCount || 0) + 1;
    
    // Use task's interval or default
    const interval = task.intervals?.[0] || task.interval || DEFAULT_INTERVAL;
    
    // Calculate new trigger time
    const triggerTime = new Date();
    triggerTime.setMinutes(triggerTime.getMinutes() + parseInt(interval));
    
    // Cancel existing notification if any
    if (task.notificationId) {
      await cancelNotification(task.notificationId);
    }
    
    // Use consistent identifier
    const identifier = `task_${task.id}`;
    
    // Schedule a new notification
    await Notifications.scheduleNotificationAsync({
      identifier: identifier,
      content: {
        title: "Task Rescheduled",
        body: `This is the ${getOrdinalSuffix(rescheduleCount)} time for "${task.text || currentTask.text}"`,
        sound: true,
        badge: 1,
        priority: 'high',
        data: {
          taskId: task.id,
          priority: task.priority || currentTask.priority,
          interval,
          rescheduleCount,
          type: 'timer-completion',
          action: 'open',
          timestamp: Date.now()
        },
        categoryIdentifier: Platform.OS === 'ios' ? 'task-reminder' : undefined,
        channelId: Platform.OS === 'android' ? 'task-reminders' : undefined
      },
      trigger: { date: triggerTime },
    });
    
    // Update task document
    await taskRef.update({
      rescheduleCount,
      notificationId: identifier,
      nextReminderTime: triggerTime.toISOString(),
      'timerState.isActive': true,
      'timerState.startTime': FieldValue.serverTimestamp(),
      'timerState.duration': interval,
      'timerState.isCompleted': false,
      'timerState.notificationStatus': 'scheduled',
      notificationDelivered: false,
      completed: false
    });
    
    // Return updated task data
    return {
      notificationId: identifier,
      rescheduleCount,
      nextReminderTime: triggerTime.toISOString()
    };
  } catch (error) {
    console.error('Error rescheduling task:', error);
    return null;
  }
}

// Alias for rescheduleTask
function rescheduleTaskNotification(taskId, intervalIndex) {
  // Get interval from index
  const interval = NOTIFICATION_INTERVALS[intervalIndex] || DEFAULT_INTERVAL;
  
  return rescheduleTask({
    id: taskId,
    interval: interval
  });
}

// Check if a task timer has completed
async function checkTaskTimer(taskId) {
  try {
    if (!taskId) return false;
    
    const taskRef = db.collection("reminders").doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) return false;
    
    const taskData = taskDoc.data();
    if (!taskData.timerState?.isActive) return false;
    
    // Handle different timestamp formats
    let startTime;
    if (typeof taskData.timerState.startTime === 'string') {
      startTime = new Date(taskData.timerState.startTime);
    } else if (taskData.timerState.startTime && taskData.timerState.startTime.seconds) {
      startTime = new Date(taskData.timerState.startTime.seconds * 1000);
    } else {
      startTime = new Date();
    }
    
    const duration = taskData.timerState.duration || taskData.interval || DEFAULT_INTERVAL;
    const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));
    
    // Check if timer has completed
    const hasCompleted = new Date() >= endTime;
    
    if (hasCompleted && !taskData.notificationDelivered) {
      // Check if we recently processed this task
      if (await wasNotificationRecentlySent(taskId)) {
        console.log(`Task ${taskId} was recently processed, skipping duplicate`);
        return true;
      }
      
      // Mark this task as being processed
      await markNotificationAsSent(taskId);
      
      // Determine if app is in foreground
      const isInForeground = AppState.currentState === 'active';
      
      // Update the task state
      await taskRef.update({
        'timerState.isActive': false,
        'timerState.isCompleted': true,
        'timerState.completedAt': FieldValue.serverTimestamp(),
        'timerState.completedInForeground': isInForeground,
        notificationDelivered: isInForeground // Only mark as delivered if in foreground
      });
      
      // If app is in background, send a notification
      if (!isInForeground) {
        // Cancel any existing notifications first
        await cancelNotification(`task_${taskId}`);
        
        // Use consistent identifier
        const identifier = `task_${taskId}`;
        
        // Schedule new notification
        await Notifications.scheduleNotificationAsync({
          identifier: identifier,
          content: {
            title: "Time's Up!",
            body: `Have you completed "${taskData.text}"?`,
            data: { 
              taskId,
              type: 'timer-completion',
              action: 'open',
              timestamp: Date.now()
            },
            sound: true,
            priority: 'high',
            badge: 1,
            categoryIdentifier: Platform.OS === 'ios' ? 'task-reminder' : undefined,
            channelId: Platform.OS === 'android' ? 'task-reminders' : undefined
          },
          trigger: null, // Send immediately
        });
        
        // Update task with notification ID
        await taskRef.update({
          notificationId: identifier,
          'timerState.notificationStatus': 'completed'
        });
      }
    }
    
    return hasCompleted;
  } catch (error) {
    console.error('Error checking task timer:', error);
    return false;
  }
}

// Check for task completion modal
async function shouldShowTaskCompletionModal(taskId) {
  try {
    if (!taskId) return false;
    
    const taskRef = db.collection("reminders").doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) return false;
    
    const taskData = taskDoc.data();
    
    // If task is completed, don't show modal
    if (taskData.completed) return false;
    
    // Check if timer is completed but not handled yet
    return taskData.timerState?.isCompleted && 
           !taskData.modalDisplayed;
  } catch (error) {
    console.error('Error checking if task completion modal should show:', error);
    return false;
  }
}

// Mark modal as displayed
async function markModalDisplayed(taskId, displayed = true) {
  try {
    if (!taskId) return false;
    
    const taskRef = db.collection("reminders").doc(taskId);
    await taskRef.update({
      modalDisplayed: displayed
    });
    
    return true;
  } catch (error) {
    console.error('Error marking modal as displayed:', error);
    return false;
  }
}

// Get task from Firestore
async function getTask(taskId) {
  try {
    if (!taskId) return null;
    
    const taskRef = db.collection("reminders").doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) return null;
    
    return { 
      id: taskId, 
      ...taskDoc.data() 
    };
  } catch (error) {
    console.error('Error getting task:', error);
    return null;
  }
}

// Get all active tasks
async function getActiveTasks() {
  try {
    const tasksQuery = db.collection("reminders")
      .where("completed", "==", false)
      .where("timerState.isActive", "==", true);
    
    const taskDocs = await tasksQuery.get();
    return taskDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting active tasks:', error);
    return [];
  }
}

// Check and update task timer
async function checkAndUpdateTaskTimer(task) {
  if (!task?.id) return false;
  return checkTaskTimer(task.id);
}

// Handle timer completion
async function handleTimerComplete(task, isInForeground = true) {
  try {
    if (!task?.id) {
      console.error('Invalid task for timer completion:', task);
      return false;
    }
    
    // Check if we recently processed this task
    if (await wasNotificationRecentlySent(task.id)) {
      console.log(`Task ${task.id} was recently processed, skipping duplicate`);
      return true;
    }
    
    // Mark this task as being processed
    await markNotificationAsSent(task.id);
    
    console.log(`Handling timer completion for task ${task.id}, foreground: ${isInForeground}`);
    
    // Update the timer state in Firestore
    const taskRef = db.collection("reminders").doc(task.id);
    await taskRef.update({
      'timerState.isActive': false,
      'timerState.isCompleted': true,
      'timerState.completedAt': FieldValue.serverTimestamp(),
      'timerState.completedInForeground': isInForeground
    });
    
    // If app is in foreground, we don't need to send a notification
    if (isInForeground) {
      // Mark this so the modal can be shown
      await taskRef.update({
        notificationDelivered: true
      });
      
      console.log('Timer completed in foreground, UI will handle display:', task.id);
      return true;
    } else {
      // Send notification for background completion
      // First cancel any existing notifications
      if (task.notificationId) {
        await cancelNotification(task.notificationId);
      }
      
      // Use consistent identifier
      const identifier = `task_${task.id}`;
      
      // Schedule a new immediate notification
      await Notifications.scheduleNotificationAsync({
        identifier: identifier,
        content: {
          title: "Time's Up!",
          body: `Have you completed "${task.text}"?`,
          data: { 
            taskId: task.id,
            type: 'timer-completion',
            action: 'open',
            timestamp: Date.now()
          },
          sound: true,
          priority: 'high',
          badge: 1,
          categoryIdentifier: Platform.OS === 'ios' ? 'task-reminder' : undefined,
          channelId: Platform.OS === 'android' ? 'task-reminders' : undefined
        },
        trigger: null, // Send immediately
      });
      
      // Update task with notification ID
      await taskRef.update({
        notificationId: identifier,
        'timerState.notificationStatus': 'completed'
      });
      
      console.log('Timer completed in background, notification sent:', task.id);
      return true;
    }
  } catch (error) {
    console.error('Error handling timer completion:', error);
    return false;
  }
}

// For compatibility with other code that might call this
async function handleTaskCompletion(task) {
  return completeTask(task);
}

// Check all active tasks
async function checkAllActiveTasks() {
  try {
    console.log('Checking all active tasks...');
    
    // Get all active timer tasks
    const activeTasks = await getActiveTasks();
    let tasksUpdated = 0;
    const completedTasks = [];
    
    // Process each active task
    for (const task of activeTasks) {
      // Skip if notification was recently sent for this task
      if (await wasNotificationRecentlySent(task.id)) {
        console.log(`Skipping recently processed task: ${task.id}`);
        continue;
      }
      
      // Check if this task's timer has completed
      const timerCompleted = await checkTaskTimer(task.id);
      
      if (timerCompleted) {
        completedTasks.push(task);
        tasksUpdated++;
      }
    }
    
    console.log(`Checked ${activeTasks.length} active tasks, ${tasksUpdated} were updated`);
    return completedTasks;
  } catch (error) {
    console.error('Error checking all active tasks:', error);
    return [];
  }
}

// Record app state changes for notification handling
function recordAppStateChange(newState) {
  console.log(`App state changed to ${newState}`);
  
  if (newState === 'active') {
    // App came to foreground - reset badge count
    Notifications.setBadgeCountAsync(0)
      .catch(err => console.error('Error resetting badge count:', err));
  }
}

// Functions from the other notifications file
// Create a task with timer
async function createTaskWithTimer(taskData) {
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

    // Check if a task with this ID is already being processed
    if (taskData.id && await wasNotificationRecentlySent(taskData.id)) {
      console.log(`Task ${taskData.id} is already being processed. Avoiding duplicate.`);
      return taskData.id;
    }

    const docRef = await reminderRef.add(taskWithTimer);
    const taskId = docRef.id;
    
    // Mark task as being processed to prevent duplicates
    await markNotificationAsSent(taskId);
    
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
}

// Update user stats
async function updateUserStats(userId, field, value) {
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
}

// Check if a task is the highest priority
async function isHighestPriorityTask(taskId) {
  const highestPriorityTask = await getHighestPriorityTask();
  return highestPriorityTask?.id === taskId;
}

// Get the highest priority task
async function getHighestPriorityTask() {
  try {
    const querySnapshot = await db.collection("reminders")
      .where("completed", "==", false)
      .orderBy("priority")
      .get();
    
    if (querySnapshot.docs.length === 0) return null;
    
    const task = querySnapshot.docs[0];
    return { id: task.id, ...task.data() };
  } catch (error) {
    console.error("Error getting highest priority task:", error);
    return null;
  }
}

// Update task
async function updateTask(taskId, updatedData) {
  try {
    const taskRef = db.collection("reminders").doc(taskId);
    const taskDoc = await taskRef.get();
    
    if (!taskDoc.exists) {
      throw new Error("Task not found");
    }

    // Check if this task was recently processed
    if (await wasNotificationRecentlySent(taskId)) {
      console.log(`Task ${taskId} was recently processed, proceeding with caution`);
    }

    const existingTask = taskDoc.data();
    const wasHighestPriority = await isHighestPriorityTask(taskId);
    
    const timerState = {
      ...existingTask.timerState,
      duration: updatedData.intervals?.[0] || existingTask.timerState.duration
    };

    if (wasHighestPriority && 
        updatedData.intervals?.[0] !== existingTask.intervals?.[0]) {
      // Cancel existing notification
      await cancelNotification(taskId);
      
      // Mark task as being processed
      await markNotificationAsSent(taskId);
      
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
}

// Schedule task notifications for multiple tasks
async function scheduleTaskNotifications(tasks) {
  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Sort tasks by priority
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Lowest': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Schedule notification for highest priority task only
    if (sortedTasks.length > 0) {
      const highestPriorityTask = sortedTasks[0];
      
      // Check if this task was recently processed
      if (await wasNotificationRecentlySent(highestPriorityTask.id)) {
        console.log(`Highest priority task ${highestPriorityTask.id} was recently processed, skipping`);
      } else {
        // Mark as processed and schedule notification
        await markNotificationAsSent(highestPriorityTask.id);
        await scheduleTaskNotification(highestPriorityTask);
      }
    }

    return true;
  } catch (error) {
    console.error('Error scheduling multiple notifications:', error);
    return false;
  }
}

// Clean up notifications
async function cleanupNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
    clearNotificationLocks();
    console.log("All notifications cleaned up");
  } catch (error) {
    console.error("Error cleaning up notifications:", error);
  }
}

// Fetch leaderboard data
async function fetchLeaderboardData() {
  try {
    // Query users and their stats together
    const userStatsRef = db.collection('userStats');
    const userStatsSnapshot = await userStatsRef.get();
    
    // Get all users to map their names
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();
    const usersMap = {};
    
    usersSnapshot.forEach(doc => {
      usersMap[doc.id] = doc.data().displayName || 'Anonymous User';
    });

    // Combine the data
    const leaderboardData = userStatsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        name: usersMap[doc.id] || 'Anonymous User',
        tasksCompleted: doc.data().tasksCompleted || 0,
        totalXP: doc.data().totalXP || 0
      }))
      .filter(user => user.tasksCompleted > 0) // Only show users who have completed tasks
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted); // Sort by tasks completed

    return leaderboardData;
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    throw error;
  }
}

// Export all functions
export default {
  // Core initialization and permissions
  initialize,
  initializeNotifications,
  requestNotificationPermissions,
  setupNotificationCategories,
  setupNotificationChannels,
  
  // Notification listeners and subscriptions
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  removeNotificationSubscription,
  registerTaskAsync,
  setNotificationCategoryAsync,
  
  // Scheduling and handling notifications
  scheduleTaskNotification,
  scheduleTaskCompletionNotification,
  scheduleTaskNotifications,
  cancelNotification,
  cancelScheduledNotificationAsync: cancelNotification,
  getAllPendingNotifications,
  getPendingNotifications,
  cancelAllNotifications,
  cleanupNotifications,
  
  // Task management
  completeTask,
  rescheduleTask,
  rescheduleTaskNotification,
  deleteTask,
  deleteReminder,
  handleTaskCompletion,
  handleTimerComplete,
  createTaskWithTimer,
  updateTask,
  updateUserStats,
  
  // Task checking and status
  checkTaskTimer,
  checkAllActiveTasks,
  shouldShowTaskCompletionModal,
  markModalDisplayed,
  getTask,
  getActiveTasks,
  checkAndUpdateTaskTimer,
  getHighestPriorityTask,
  isHighestPriorityTask,
  
  // Notification lock management
  getNotificationLockStatus,
  clearNotificationLocks,
  
  // Duplicate prevention helpers
  wasNotificationRecentlySent,
  markNotificationAsSent,
  
  // Stats and leaderboard
  fetchLeaderboardData,
  
  // App state handling
  recordAppStateChange,
  
  // Constants
  NOTIFICATION_INTERVALS,
  DEFAULT_INTERVAL
};