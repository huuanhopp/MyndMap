import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationManager from '../notifications/notifications';
import { db, firestore, updateDocument, getDocument, queryDocuments } from '../screens/firebase-services';

/**
 * Custom hook for managing task timers
 * @param {Object} task - The task to manage timing for
 * @param {Function} onTimerComplete - Callback function when timer completes
 * @returns {Object} Timer state and control functions
 */
export const useTaskTimer = (task, onTimerComplete) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Use refs to retain current values in callbacks
  const timerRef = useRef(null);
  const taskRef = useRef(null);
  const completionHandlerRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const lastActiveTimeRef = useRef(Date.now());
  
  // Store the completion handler in a ref to avoid dependency issues
  useEffect(() => {
    completionHandlerRef.current = onTimerComplete;
  }, [onTimerComplete]);
  
  // Clean up function to clear current timer
  const clearCurrentTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  // Handle timer completion
  const handleTimerComplete = useCallback(async (completedTask, isInForeground = true) => {
    console.log(`[TIMER] Timer completed for task ${completedTask?.id}, in foreground: ${isInForeground}`);
    
    // Prevent duplicate handling
    if (await NotificationManager.wasNotificationRecentlySent(completedTask.id)) {
      console.log(`[TIMER] Preventing duplicate notification for task ${completedTask.id}`);
      return;
    }
    
    // Mark notification as sent to prevent duplicates
    await NotificationManager.markNotificationAsSent(completedTask.id);
    
    // Always update Firestore to mark timer as completed
    await updateDocument("reminders", completedTask.id, {
      'timerState.isActive': false,
      'timerState.isCompleted': true,
      'timerState.completedAt': new Date(),
      'timerState.lastUpdated': new Date(),
    });
    
    // Only show system notification if app is in background
    if (!isInForeground) {
      console.log(`[TIMER] App in background, scheduling system notification for task ${completedTask.id}`);
      
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time's Up!",
            body: `Have you completed "${completedTask.text}"?`,
            data: { 
              taskId: completedTask.id,
              type: 'timer-completion',
              action: 'open'
            },
            sound: true,
            priority: 'high',
            badge: 1,
          },
          trigger: null, // Send immediately
        });
      } catch (error) {
        console.error(`[TIMER] Error scheduling notification for task ${completedTask.id}:`, error);
      }
    }
    
    // Call the completion handler regardless of app state
    if (completionHandlerRef.current) {
      console.log(`[TIMER] Calling completion handler for task ${completedTask.id}`);
      completionHandlerRef.current(completedTask, isInForeground);
    }
  }, []);
  
  // Calculate remaining time for a task
  const calculateRemainingTime = useCallback((targetTask) => {
    if (!targetTask) return 0;
    
    const interval = targetTask.timerState?.duration || targetTask.interval;
    if (!interval) return 0;
    
    let totalSeconds = interval * 60;
    
    if (targetTask.timerState?.startTime) {
      let startTime;
      
      // Handle different formats of startTime
      if (typeof targetTask.timerState.startTime === 'string') {
        startTime = new Date(targetTask.timerState.startTime);
      } else if (targetTask.timerState.startTime.seconds) {
        // Handle Firestore Timestamp
        startTime = new Date(targetTask.timerState.startTime.seconds * 1000);
      } else {
        startTime = new Date();
      }
      
      const currentTime = new Date();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      totalSeconds = Math.max(0, (interval * 60) - elapsedSeconds);
    }
    
    return totalSeconds;
  }, []);
  
  // Set up the timer interval
  const startTimerInterval = useCallback((newTask) => {
    // Clear any existing timer first
    clearCurrentTimer();
    
    // Validate task and interval data
    if (!newTask?.timerState?.isActive) {
      setIsTimerActive(false);
      return;
    }
    
    const interval = newTask.timerState?.duration || newTask.interval;
    if (!interval) {
      console.warn(`[TIMER] No interval found for task ${newTask?.id}`);
      setIsTimerActive(false);
      return;
    }
    
    // Calculate remaining time based on start time
    const totalSeconds = calculateRemainingTime(newTask);
    
    // If timer already expired, handle completion
    if (totalSeconds <= 0) {
      console.log(`[TIMER] Timer already expired for task ${newTask.id}`);
      setTimeRemaining(0);
      setIsTimerActive(false);
      
      // Handle timer completion
      setTimeout(() => {
        handleTimerComplete(newTask, AppState.currentState === 'active');
      }, 0);
      return;
    }
    
    // Initialize timer state
    setTimeRemaining(totalSeconds);
    setIsTimerActive(true);
    setIsPaused(false);
    taskRef.current = newTask;
    
    // Set up interval for countdown
    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearCurrentTimer();
          setIsTimerActive(false);
          
          // Get the current task state
          const taskToComplete = taskRef.current;
          
          // Check app state to determine notification strategy
          const currentAppState = AppState.currentState;
          const isInForeground = currentAppState === 'active';
          
          // IMPORTANT: Ensure we always call the completion handler
          setTimeout(() => {
            if (taskToComplete) {
              handleTimerComplete(taskToComplete, isInForeground);
            }
          }, 0);
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [clearCurrentTimer, calculateRemainingTime, handleTimerComplete]);
  
  // Start timer for a given task
  const startTimer = useCallback((newTask) => {
    if (!newTask) return;
    
    // If we have the same task but interval changed, restart timer
    if (taskRef.current?.id === newTask?.id) {
      // Get interval values (check both sources)
      const oldInterval = taskRef.current.timerState?.duration || taskRef.current.interval;
      const newInterval = newTask.timerState?.duration || newTask.interval;
      
      // If interval changed, reset and restart the timer
      if (oldInterval !== newInterval && newInterval) {
        // Clear existing timer
        clearCurrentTimer();
        
        // Create updated task with new interval
        const updatedTask = {
          ...newTask,
          timerState: {
            ...newTask.timerState,
            isActive: true,
            startTime: new Date().toISOString(),
            duration: newInterval
          }
        };
        
        // Start fresh timer with new duration
        startTimerInterval(updatedTask);
        return;
      }
      
      // If same interval and timer is active, don't restart
      if (isTimerActive) {
        return;
      }
    }
    
    // Handle paused state
    if (newTask?.timerState?.isPaused) {
      taskRef.current = newTask;
      setIsPaused(true);
      setIsTimerActive(false);
      
      // Calculate remaining time based on pause time
      const remainingSeconds = calculateRemainingTime(newTask);
      setTimeRemaining(remainingSeconds);
      return;
    }
    
    // Start new timer
    startTimerInterval(newTask);
  }, [isTimerActive, clearCurrentTimer, startTimerInterval, calculateRemainingTime]);
  
  // Pause the timer
  const pauseTimer = useCallback(() => {
    if (!isTimerActive || !taskRef.current) return;
    
    clearCurrentTimer();
    setIsPaused(true);
    setIsTimerActive(false);
    
    // Store the pause state in Firestore if task exists
    if (taskRef.current?.id) {
      updateDocument("reminders", taskRef.current.id, {
        'timerState.isPaused': true,
        'timerState.pausedAt': new Date(),
        'timerState.lastUpdated': new Date(),
      }).catch(err => console.error(`[TIMER] Error pausing timer: ${err}`));
    }
  }, [isTimerActive, clearCurrentTimer]);
  
  // Resume the timer
  const resumeTimer = useCallback(() => {
    if (!isPaused || !taskRef.current) return;
    
    setIsPaused(false);
    setIsTimerActive(true);
    
    // Calculate new duration based on time spent paused
    const now = new Date();
    const task = taskRef.current;
    
    // Update in Firestore
    if (task?.id) {
      // Update the task's timer state in Firestore
      updateDocument("reminders", task.id, {
        'timerState.isActive': true,
        'timerState.isPaused': false,
        'timerState.startTime': new Date(),
        'timerState.lastUpdated': new Date(),
      }).catch(err => console.error(`[TIMER] Error resuming timer: ${err}`));
      
      // Create an updated task object for the timer
      const updatedTask = {
        ...task,
        timerState: {
          ...task.timerState,
          isActive: true,
          isPaused: false,
          startTime: now.toISOString()
        }
      };
      
      // Start the timer with the updated task
      startTimerInterval(updatedTask);
    }
  }, [isPaused, startTimerInterval]);
  
  // Reset timer functionality
  const resetTimer = useCallback(() => {
    clearCurrentTimer();
    setTimeRemaining(0);
    setIsTimerActive(false);
    setIsPaused(false);
    
    // Update Firestore if we have a task
    if (taskRef.current?.id) {
      updateDocument("reminders", taskRef.current.id, {
        'timerState.isActive': false,
        'timerState.isPaused': false,
        'timerState.lastUpdated': new Date(),
      }).catch(err => console.error(`[TIMER] Error resetting timer: ${err}`));
    }
    
    taskRef.current = null;
  }, [clearCurrentTimer]);
  
  // Check for tasks that completed in the background
  const checkBackgroundCompletedTasks = useCallback(async () => {
    if (!task?.userId) return [];
    
    try {
      // Use standardized queryDocuments method
      const conditions = [
        ["userId", "==", task.userId],
        ["completed", "==", false],
        ["deleted", "in", [false, null]],
        ["timerState.isCompleted", "==", true],
        ["timerState.modalShown", "in", [false, null]]
      ];
      
      const completedTasks = await queryDocuments("reminders", conditions);
      return completedTasks;
    } catch (error) {
      console.error(`[TIMER] Error checking background completed tasks: ${error}`);
      return [];
    }
  }, [task?.userId]);
  
  // Handle AppState changes for background/foreground transitions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      const now = Date.now();
      const currentTask = taskRef.current;
      
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App is going to background
        console.log(`[TIMER] App going to background with task ${currentTask?.id}`);
        lastActiveTimeRef.current = now;
        
        // Store current timer state in Firestore if active
        if (isTimerActive && currentTask?.id) {
          updateDocument("reminders", currentTask.id, {
            'timerState.lastBackgroundTime': new Date(),
            'timerState.lastUpdated': new Date(),
          }).catch(err => console.error(`[TIMER] Error storing background time: ${err}`));
        }
      } 
      else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App is coming to foreground
        console.log(`[TIMER] App coming to foreground with task ${currentTask?.id}`);
        const timeInBackground = now - lastActiveTimeRef.current;
        
        // Clear notifications when app comes to foreground
        Notifications.dismissAllNotificationsAsync().catch(err => {
          console.error(`[TIMER] Error dismissing notifications: ${err}`);
        });
        
        Notifications.setBadgeCountAsync(0).catch(err => {
          console.error(`[TIMER] Error resetting badge count: ${err}`);
        });
        
        // If timer was active and we have a task, adjust the time
        if (isTimerActive && currentTask && timeInBackground > 2000) {
          // Reload task data from Firestore to get latest state
          getDocument("reminders", currentTask.id)
            .then(updatedTask => {
              if (updatedTask) {
                
                // Check if a background task already completed this timer
                if (updatedTask.timerState?.isCompleted) {
                  // If completed in background, trigger completion handler
                  resetTimer();
                  setTimeout(() => {
                    if (completionHandlerRef.current) {
                      // Pass false for isInForeground since it completed in background
                      completionHandlerRef.current(updatedTask, false);
                    }
                  }, 0);
                  return;
                }
                
                // Restart timer with updated task data
                if (updatedTask.timerState?.isActive) {
                  startTimer(updatedTask);
                } else if (updatedTask.timerState?.isPaused) {
                  // If task was paused while in background
                  taskRef.current = updatedTask;
                  setIsPaused(true);
                  setIsTimerActive(false);
                  setTimeRemaining(calculateRemainingTime(updatedTask));
                }
              }
            })
            .catch(err => console.error(`[TIMER] Error reloading task: ${err}`));
        }
      }
      
      appState.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, [isTimerActive, startTimer, resetTimer, calculateRemainingTime]);
  
  // Start timer when task changes
  useEffect(() => {
    if (!task) {
      resetTimer();
      return;
    }
    
    // Only restart timer if task ID changes or timer state changes
    if (
      task?.id !== taskRef.current?.id ||
      task?.timerState?.isActive !== taskRef.current?.timerState?.isActive ||
      task?.timerState?.isPaused !== taskRef.current?.timerState?.isPaused ||
      task?.timerState?.startTime !== taskRef.current?.timerState?.startTime
    ) {
      console.log(`[TIMER] Starting/updating timer for task ${task.id}`);
      startTimer(task);
    }
  }, [task, startTimer, resetTimer]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearCurrentTimer();
    };
  }, [clearCurrentTimer]);
  
  return {
    timeRemaining,
    isTimerActive,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    checkBackgroundCompletedTasks
  };
};

export default useTaskTimer;