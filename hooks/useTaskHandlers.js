import { useCallback } from 'react';
import { Alert } from 'react-native';
import { db } from '../screens/firebase-init';

/**
 * Hook to handle task operations including completion, deletion, and editing
 */
export const useTaskHandlers = (
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
) => {
  // Handle saving a new task
  const handleTaskSaved = useCallback((newTask) => {
    // Update local state with the new task
    setReminders(prevTasks => {
      // If no previous tasks, create new array
      if (!prevTasks) return [newTask];
      
      // Check if task is scheduled for the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let taskDate = null;
      if (newTask.scheduledFor) {
        taskDate = new Date(newTask.scheduledFor);
      } else if (newTask.dueDate) {
        taskDate = new Date(newTask.dueDate);
      }
      
      if (taskDate && taskDate > today) {
        // Add to future tasks
        setFutureReminders(prev => [newTask, ...(prev || [])]);
        // Optionally show future tasks tab
        setShowFutureTasks(true);
        return prevTasks;
      }
      
      // Add to current tasks
      return [newTask, ...prevTasks];
    });
  }, [setReminders, setFutureReminders, setShowFutureTasks]);

  // Handle task completion
  const handleTaskComplete = useCallback(async (task) => {
    if (!task?.id) {
      console.error('Cannot complete: invalid task object');
      return;
    }

    try {
      // Set deleting ID for animation
      setDeletingTaskId(task.id);
      
      // Mark the task as completed in Firestore
      await db.collection("reminders").doc(task.id).update({
        completed: true,
        completedAt: new Date(),
        'timerState.isActive': false
      });
      
      // Remove the task from the UI
      setReminders(prevTasks => prevTasks.filter(t => t.id !== task.id));
      setFutureReminders(prevTasks => prevTasks.filter(t => t.id !== task.id));
      
      // Close any open modal
      setModalVisible(false);
      setTaskReminderModalVisible(false);
      setCurrentReminderTask(null);
      
      // Show completion animation and trigger XP gain
      const position = {
        top: Math.random() * 200 + 100,
        left: Math.random() * 200 + 50,
      };
      triggerXPGain(task, position);
      
      // Optionally show quest completion modal if criteria are met
      // For now, we'll use a simple condition for testing
      if (task.priority === 'Urgent' || task.priority === 'High') {
        setTimeout(() => {
          setIsQuestCompletedVisible(true);
        }, 500);
      }
      
      // Clear deleting ID after animation
      setTimeout(() => {
        setDeletingTaskId(null);
      }, 300);
      
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
      setDeletingTaskId(null);
    }
  }, [
    setReminders, 
    setFutureReminders, 
    setDeletingTaskId, 
    setModalVisible, 
    setTaskReminderModalVisible, 
    setCurrentReminderTask, 
    setIsQuestCompletedVisible,
    triggerXPGain
  ]);

  // Handle task deletion
  const handleDeleteTask = useCallback(async (task) => {
    if (!task?.id) {
      console.error('Cannot delete: invalid task object');
      return;
    }

    try {
      // Set deleting ID for animation
      setDeletingTaskId(task.id);
      
      // Delete the task from Firestore
      await db.collection("reminders").doc(task.id).delete();
      
      // Remove the task from the UI
      setReminders(prevTasks => prevTasks.filter(t => t.id !== task.id));
      setFutureReminders(prevTasks => prevTasks.filter(t => t.id !== task.id));
      
      // Close any open modal
      setModalVisible(false);
      setTaskReminderModalVisible(false);
      setCurrentReminderTask(null);
      
      // Clear deleting ID after animation
      setTimeout(() => {
        setDeletingTaskId(null);
      }, 300);
      
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
      setDeletingTaskId(null);
    }
  }, [
    setReminders, 
    setFutureReminders, 
    setDeletingTaskId, 
    setModalVisible, 
    setTaskReminderModalVisible, 
    setCurrentReminderTask
  ]);

  // Handle saving a task note
  const handleSaveTaskNote = useCallback(async (taskId, note) => {
    if (!taskId) {
      console.error('Cannot save note: invalid task ID');
      return;
    }

    try {
      // Update the task note in Firestore
      await db.collection("reminders").doc(taskId).update({
        note: note,
        updatedAt: new Date()
      });
      
      // Update the note in the UI
      setReminders(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, note } : task
        )
      );
      
      setFutureReminders(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, note } : task
        )
      );
      
    } catch (error) {
      console.error('Error saving task note:', error);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    }
  }, [setReminders, setFutureReminders]);

  // Handle task priority update
  const updateTaskPriority = useCallback(async (taskId, priority) => {
    if (!taskId) {
      console.error('Cannot update priority: invalid task ID');
      return;
    }

    try {
      // Update the task priority in Firestore
      await db.collection("reminders").doc(taskId).update({
        priority: priority,
        updatedAt: new Date()
      });
      
      // Update the priority in the UI
      setReminders(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, priority } : task
        )
      );
      
      setFutureReminders(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, priority } : task
        )
      );
      
    } catch (error) {
      console.error('Error updating task priority:', error);
      Alert.alert('Error', 'Failed to update priority. Please try again.');
    }
  }, [setReminders, setFutureReminders]);

  return {
    handleTaskSaved,
    handleTaskComplete,
    handleDeleteTask,
    handleSaveTaskNote,
    updateTaskPriority
  };
};

export default useTaskHandlers;