import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import NotificationManager from './NotificationManager';

/**
 * Custom hook for handling task item interactions
 * Centralizes task action logic and provides consistent interfaces
 */
export const useTaskItemHandler = ({ onTaskUpdated, onTaskDeleted }) => {
  const [processingTaskId, setProcessingTaskId] = useState(null);
  
  // Handle task completion
  const handleTaskCompletion = useCallback(async (task) => {
    if (!task?.id) return;
    
    try {
      // Prevent duplicate actions
      if (processingTaskId === task.id) return;
      setProcessingTaskId(task.id);
      
      // Use notification manager to handle completion
      const result = await NotificationManager.completeTask(task);
      
      // Notify parent component
      if (result && onTaskUpdated) {
        onTaskUpdated({
          ...task,
          completed: true,
          completedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    } finally {
      setProcessingTaskId(null);
    }
  }, [processingTaskId, onTaskUpdated]);
  
  // Handle task deletion
  const handleTaskDeletion = useCallback(async (task) => {
    if (!task?.id) return;
    
    try {
      // Prevent duplicate actions
      if (processingTaskId === task.id) return;
      setProcessingTaskId(task.id);
      
      // Show confirmation dialog
      Alert.alert(
        'Delete Task',
        `Are you sure you want to delete "${task.text}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // Use notification manager to handle deletion
              const result = await NotificationManager.deleteTask(task);
              
              // Notify parent component
              if (result && onTaskDeleted) {
                onTaskDeleted(task.id);
              }
              
              setProcessingTaskId(null);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
      setProcessingTaskId(null);
    }
  }, [processingTaskId, onTaskDeleted]);
  
  // Handle task rescheduling
  const handleTaskReschedule = useCallback(async (task) => {
    if (!task?.id) return;
    
    try {
      // Prevent duplicate actions
      if (processingTaskId === task.id) return;
      setProcessingTaskId(task.id);
      
      // Use notification manager to handle rescheduling
      const result = await NotificationManager.rescheduleTask(task);
      
      // Notify parent component
      if (result && onTaskUpdated) {
        // Create updated task object
        const updatedTask = {
          ...task,
          rescheduleCount: (task.rescheduleCount || 0) + 1,
          notificationId: result.notificationId,
          nextReminderTime: result.nextReminderTime,
          timerState: {
            ...(task.timerState || {}),
            isActive: true,
            startTime: new Date().toISOString(),
            duration: task.interval,
            notificationStatus: 'scheduled'
          }
        };
        
        onTaskUpdated(updatedTask);
      }
    } catch (error) {
      console.error('Error rescheduling task:', error);
      Alert.alert('Error', 'Failed to reschedule task. Please try again.');
    } finally {
      setProcessingTaskId(null);
    }
  }, [processingTaskId, onTaskUpdated]);
  
  // Return the handlers and processing state
  return {
    processingTaskId,
    handleTaskCompletion,
    handleTaskDeletion,
    handleTaskReschedule
  };
};

export default useTaskItemHandler;