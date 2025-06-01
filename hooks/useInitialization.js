import { useCallback } from 'react';
import { Alert, Animated } from 'react-native';
// Import from centralized Firebase implementation
import { db, FieldValue } from '../firebase/init';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sortTasks, calculateTaskScore } from '../screens/TaskAlgorithm';
import NotificationManager from '../notifications/notifications';

export const useInitialization = (
  user,
  setIsLoading,
  setReminders,
  setFutureReminders,
  setOverdueTasks,
  setShowOverdueNotification,
  setUserName,
  setIsNewUser,
  unsubscribeListeners,
  // Optional parameters with explicit default values
  checkBackgroundCompletedTasks = null,
  setCurrentReminderTask = null,
  setTaskReminderModalVisible = null,
  setActiveTimerTask = null
) => {
  // Helper function to create initialized reminder objects
  const createInitializedReminder = useCallback((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Initialize animation and UI state properties
      animateIn: false,
      fadeAnim: new Animated.Value(1),
      highlighted: false,
      // Ensure timer state exists with all required properties
      timerState: {
        isActive: false,
        startTime: null,
        duration: data.interval || data.intervals?.[0] || 5,
        notificationStatus: 'pending',
        isCompleted: false, // Add this line to ensure isCompleted always exists
        modalShown: false,  // Add this to track if a modal has been shown
        ...data.timerState
      }
    };
  }, []);

  // Check if user is new
  const checkIfNewUser = useCallback(async () => {
    if (user) {
      try {
        const userRef = db.collection("users").doc(user.uid);
        const userDoc = await userRef.get();
        if (userDoc.exists && !userDoc.data().hasSeenHomeScreen) {
          setIsNewUser(true);
          await userRef.update({ hasSeenHomeScreen: true });
        }
      } catch (error) {
        console.error('Error checking if user is new:', error);
      }
    }
  }, [user, setIsNewUser]);

  // Fetch user name
  const fetchUserName = useCallback(async () => {
    if (user) {
      try {
        const userRef = db.collection("users").doc(user.uid);
        const unsubscribe = userRef.onSnapshot((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            setUserName(userData.displayName || "");
          }
        });
        
        if (unsubscribeListeners && unsubscribeListeners.current) {
          unsubscribeListeners.current.push(unsubscribe);
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    }
  }, [user, setUserName, unsubscribeListeners]);

  // Find active timer task
  const findActiveTimerTask = useCallback(async (tasks) => {
    if (!setActiveTimerTask || !tasks || tasks.length === 0) return;
    
    try {
      // Look for a task with an active timer
      const activeTask = tasks.find(task => 
        task.timerState && task.timerState.isActive === true
      );
      
      if (activeTask) {
        console.log('[INITIALIZATION] Found active timer task, restoring:', activeTask.id);
        setActiveTimerTask(activeTask);
      }
    } catch (error) {
      console.error('[INITIALIZATION] Error finding active timer task:', error);
    }
  }, [setActiveTimerTask]);

  // Check for expired timer tasks
  const checkForExpiredTimerTasks = useCallback(async () => {
    if (!user || !setCurrentReminderTask || !setTaskReminderModalVisible) return false;
    
    try {
      // Query for tasks with completed timers that need user action
      const expiredQuery = db.collection("reminders")
        .where("userId", "==", user.uid)
        .where("completed", "==", false)
        .where("deleted", "in", [false, null])
        .where("timerState.isActive", "==", false)
        .where("timerState.isCompleted", "==", true)
        .where("timerState.modalShown", "in", [false, null]); // Add this condition
      
      // Execute the query
      const expiredSnapshot = await expiredQuery.get();
      
      if (!expiredSnapshot.empty) {
        console.log(`[INITIALIZATION] Found ${expiredSnapshot.docs.length} expired timer tasks`);
        
        // Get the first expired task
        const expiredDoc = expiredSnapshot.docs[0];
        const expiredTask = createInitializedReminder(expiredDoc);
        
        // Check if this task has been recently processed
        const isRecentlyProcessed = await NotificationManager.wasNotificationRecentlySent(expiredTask.id);
        
        if (isRecentlyProcessed) {
          console.log('[INITIALIZATION] Task was recently processed, skipping:', expiredTask.id);
          return false;
        }
        
        // Mark notification as sent to prevent duplicates
        await NotificationManager.markNotificationAsSent(expiredTask.id);
        
        // Mark this task as having shown a modal
        const taskRef = db.collection("reminders").doc(expiredTask.id);
        await taskRef.update({
          'timerState.modalShown': true,
          'timerState.lastUpdated': FieldValue.serverTimestamp()
        });
        
        // Show reminder modal for this task
        setCurrentReminderTask(expiredTask);
        setTaskReminderModalVisible(true);
        console.log('[INITIALIZATION] Displaying notification for expired timer task:', expiredTask.id);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[INITIALIZATION] Error checking for expired timer tasks:', error);
      return false;
    }
  }, [user, setCurrentReminderTask, setTaskReminderModalVisible, createInitializedReminder]);

  // Check for pending timer tasks
  const checkForPendingTimerTasks = useCallback(async () => {
    if (!user || !setCurrentReminderTask || !setTaskReminderModalVisible) return false;
    
    try {
      // Query for tasks that have completed timers but not been actioned
      const pendingQuery = db.collection("reminders")
        .where("userId", "==", user.uid)
        .where("completed", "==", false)
        .where("deleted", "in", [false, null])
        .where("timerState.isActive", "==", false)
        .where("timerState.completedAt", "!=", null)
        .where("timerState.modalShown", "in", [false, null]); // Add this condition
      
      const pendingSnapshot = await pendingQuery.get();
      
      if (!pendingSnapshot.empty) {
        // Get the first pending task
        const pendingDoc = pendingSnapshot.docs[0];
        const pendingTask = createInitializedReminder(pendingDoc);
        
        // Check if this task has been recently processed
        const isRecentlyProcessed = await NotificationManager.wasNotificationRecentlySent(pendingTask.id);
        
        if (isRecentlyProcessed) {
          console.log('[INITIALIZATION] Task was recently processed, skipping:', pendingTask.id);
          return false;
        }
        
        // Mark notification as sent to prevent duplicates
        await NotificationManager.markNotificationAsSent(pendingTask.id);
        
        // Mark this task as having shown a modal
        const taskRef = db.collection("reminders").doc(pendingTask.id);
        await taskRef.update({
          'timerState.modalShown': true,
          'timerState.lastUpdated': FieldValue.serverTimestamp()
        });
        
        // Show reminder modal for this task
        setCurrentReminderTask(pendingTask);
        setTaskReminderModalVisible(true);
        console.log('[INITIALIZATION] Found pending timer task, showing notification:', pendingTask.id);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[INITIALIZATION] Error checking for pending timer tasks:', error);
      return false;
    }
  }, [user, setCurrentReminderTask, setTaskReminderModalVisible, createInitializedReminder]);

  // Comprehensive check for all timer tasks requiring attention
  const checkForAllTimerTasksRequiringAttention = useCallback(async () => {
    if (!user || !setCurrentReminderTask || !setTaskReminderModalVisible) return false;
    
    try {
      // First check for explicitly completed (isCompleted=true) tasks
      const expiredFound = await checkForExpiredTimerTasks();
      if (expiredFound) return true;
      
      // Then check for tasks with completedAt but not explicitly marked complete
      const pendingFound = await checkForPendingTimerTasks();
      if (pendingFound) return true;
      
      // Finally, check for tasks that were completed in the background
      const backgroundQuery = db.collection("reminders")
        .where("userId", "==", user.uid)
        .where("completed", "==", false)
        .where("deleted", "in", [false, null])
        .where("timerState.backgroundCompleted", "==", true)
        .where("timerState.modalShown", "in", [false, null]); // Add this condition
      
      const backgroundSnapshot = await backgroundQuery.get();
      
      if (!backgroundSnapshot.empty) {
        const backgroundDoc = backgroundSnapshot.docs[0];
        const backgroundTask = createInitializedReminder(backgroundDoc);
        
        // Check if this task has been recently processed
        const isRecentlyProcessed = await NotificationManager.wasNotificationRecentlySent(backgroundTask.id);
        
        if (isRecentlyProcessed) {
          console.log('[INITIALIZATION] Task was recently processed, skipping:', backgroundTask.id);
          return false;
        }
        
        // Mark notification as sent to prevent duplicates
        await NotificationManager.markNotificationAsSent(backgroundTask.id);
        
        // Mark this task as having shown a modal
        const taskRef = db.collection("reminders").doc(backgroundTask.id);
        await taskRef.update({
          'timerState.modalShown': true,
          'timerState.lastUpdated': FieldValue.serverTimestamp()
        });
        
        setCurrentReminderTask(backgroundTask);
        setTaskReminderModalVisible(true);
        console.log('[INITIALIZATION] Found background completed task, showing notification:', backgroundTask.id);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[INITIALIZATION] Error checking for timer tasks requiring attention:', error);
      return false;
    }
  }, [
    user, 
    setCurrentReminderTask, 
    setTaskReminderModalVisible, 
    checkForExpiredTimerTasks, 
    checkForPendingTimerTasks,
    createInitializedReminder
  ]);

  // Main fetch reminders function
  const fetchReminders = useCallback(async () => {
    if (!user) return () => {};
    
    // Start loading state
    setIsLoading(true);
    
    try {
      // First load from cache if available to show something immediately
      try {
        const cachedRemindersJson = await AsyncStorage.getItem('cachedReminders');
        if (cachedRemindersJson) {
          const cachedData = JSON.parse(cachedRemindersJson);
          // Only use cache if it's recent (less than 5 minutes old)
          if (Date.now() - cachedData.timestamp < 300000) {
            if (Array.isArray(cachedData.reminders)) {
              setReminders(cachedData.reminders);
              // Try to find active timer task in cached data
              if (setActiveTimerTask) {
                findActiveTimerTask(cachedData.reminders);
              }
            }
            if (Array.isArray(cachedData.futureReminders)) {
              setFutureReminders(cachedData.futureReminders);
            }
            
            // This allows the UI to render while waiting for fresh data
            setIsLoading(false);
          }
        }
      } catch (cacheError) {
        console.error('[INITIALIZATION] Error loading cached reminders:', cacheError);
        // Continue even if cache failed - we'll fetch from Firestore
      }
      
      // Prepare to fetch only non-deleted, non-completed tasks
      const q = db.collection("reminders")
        .where("userId", "==", user.uid)
        .where("completed", "==", false)
        .where("deleted", "in", [false, null]) // Include both false and tasks without this field
        .orderBy("createdAt", "desc"); // Latest first
      
      // Set up the listener for real-time updates
      const unsubscribe = q.onSnapshot((querySnapshot) => {
        // Show loading state only for initial fetch
        setIsLoading(false);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const currentReminders = [];
        const scheduledReminders = [];
        
        querySnapshot.forEach((doc) => {
          const taskData = doc.data();
          
          // Skip any tasks that are marked as deleted
          // (this is a backup check in case the query filter doesn't work)
          if (taskData.deleted === true) {
            return;
          }
          
          const task = {
            id: doc.id,
            ...taskData
          };
          
          // Calculate score for proper sorting if the function exists
          if (typeof calculateTaskScore === 'function') {
            task.score = calculateTaskScore(task);
          }
          
          // Determine if it's a future task
          let taskDate;
          if (task.scheduledFor) {
            taskDate = new Date(task.scheduledFor);
          } else if (task.dueDate) {
            taskDate = new Date(task.dueDate);
          } else {
            taskDate = new Date(task.createdAt);
          }
          
          taskDate.setHours(0, 0, 0, 0);
          
          if (taskDate > today) {
            scheduledReminders.push(task);
          } else {
            currentReminders.push(task);
          }
        });
        
        // Sort both lists using our priority algorithm
        const sortedCurrent = sortTasks(currentReminders);
        const sortedFuture = sortTasks(scheduledReminders);
        
        // Update state with the fresh data
        setReminders(sortedCurrent);
        setFutureReminders(sortedFuture);
        
        // Check for active timer task in the sorted current tasks
        if (setActiveTimerTask) {
          findActiveTimerTask(sortedCurrent);
        }
        
        // Cache the results for faster loading next time
        try {
          AsyncStorage.setItem('cachedReminders', JSON.stringify({
            reminders: sortedCurrent,
            futureReminders: sortedFuture,
            timestamp: Date.now()
          }));
        } catch (cacheError) {
          console.error('[INITIALIZATION] Error caching reminders:', cacheError);
        }
        
        // Check for any expired timer tasks requiring attention
        // This is a key enhancement to show the TaskReminderModal when needed
        if (setCurrentReminderTask && setTaskReminderModalVisible) {
          checkForAllTimerTasksRequiringAttention();
        }
        
        // Still check for background completed tasks if the function exists (backward compatibility)
        if (typeof checkBackgroundCompletedTasks === 'function' && 
            typeof setCurrentReminderTask === 'function' && 
            typeof setTaskReminderModalVisible === 'function') {
          checkBackgroundCompletedTasks()
            .then(completedTasks => {
              if (completedTasks && completedTasks.length > 0) {
                // Show notification for the first completed task
                setCurrentReminderTask(completedTasks[0]);
                setTaskReminderModalVisible(true);
              }
            })
            .catch(error => {
              console.error('[INITIALIZATION] Error checking background tasks:', error);
            });
        }
      }, error => {
        console.error('[INITIALIZATION] Error fetching reminders:', error);
        setIsLoading(false);
      });
      
      // Store unsubscribe function for cleanup
      if (unsubscribeListeners && unsubscribeListeners.current) {
        unsubscribeListeners.current.push(unsubscribe);
      }
      
      return unsubscribe;
    } catch (error) {
      console.error('[INITIALIZATION] Error setting up reminders listener:', error);
      setIsLoading(false);
      return () => {};
    }
  }, [
    user, 
    setReminders, 
    setFutureReminders, 
    setIsLoading, 
    checkBackgroundCompletedTasks,
    setCurrentReminderTask,
    setTaskReminderModalVisible,
    setActiveTimerTask,
    findActiveTimerTask,
    checkForAllTimerTasksRequiringAttention,
    unsubscribeListeners
  ]);
  
  // Check for overdue tasks
  const checkForOverdueTasks = useCallback(async () => {
    if (!user || !setOverdueTasks || !setShowOverdueNotification) return;
    
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      
      const overdueQuery = db.collection("reminders")
        .where("userId", "==", user.uid)
        .where("completed", "==", false)
        .where("deleted", "in", [false, null]);
      
      const overdueSnapshot = await overdueQuery.get();
      const overdueTasks = [];
      
      overdueSnapshot.forEach((doc) => {
        const task = doc.data();
        let dueDate;
        
        if (task.dueDate) {
          dueDate = new Date(task.dueDate);
        } else if (task.scheduledFor) {
          dueDate = new Date(task.scheduledFor);
        } else {
          return; // Skip tasks without due dates
        }
        
        dueDate.setHours(0, 0, 0, 0);
        
        // Check if task is overdue
        if (dueDate < now) {
          overdueTasks.push({
            id: doc.id,
            ...task
          });
        }
      });
      
      if (overdueTasks.length > 0) {
        setOverdueTasks(overdueTasks);
        setShowOverdueNotification(true);
      }
    } catch (error) {
      console.error('[INITIALIZATION] Error checking for overdue tasks:', error);
    }
  }, [user, setOverdueTasks, setShowOverdueNotification]);
  
  return {
    checkIfNewUser,
    fetchUserName,
    fetchReminders,
    checkForAllTimerTasksRequiringAttention,
    checkForExpiredTimerTasks,
    checkForPendingTimerTasks,
    checkForOverdueTasks
  };
};

export default useInitialization;