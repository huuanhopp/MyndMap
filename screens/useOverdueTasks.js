import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { 
  db, 
  createDocument, 
  updateDocument, 
  deleteDocument, 
  getDocument, 
  queryDocuments 
} from '../screens/firebase-services';

export const useOverdueTasks = (user) => {
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCarryOver = async () => {
    if (isProcessing) return;
    if (!overdueTasks.length || !user?.uid) {
      console.log("No tasks to carry over or user not authenticated");
      return;
    }

    setIsProcessing(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      console.log("Starting carry over process for tasks:", overdueTasks);

      const validTasks = [];
      const promises = [];
      
      // Using the standardized approach
      for (const task of overdueTasks) {
        // Get the document to verify ownership
        const taskDoc = await getDocument("reminders", task.id);
        
        if (taskDoc && taskDoc.userId === user.uid) {
          validTasks.push(task);
          
          // Use standardized updateDocument method
          promises.push(
            updateDocument("reminders", task.id, {
              scheduledFor: todayISO,
              highlighted: true,
              lastModified: new Date().toISOString(),
              carriedOver: true
            })
          );
          console.log(`Task ${task.id} queued for carry over`);
        }
      }

      if (validTasks.length === 0) {
        console.log("No valid tasks found to carry over");
        setOverdueTasks([]);
        setShowNotification(false);
        return;
      }

      // Execute all updates
      await Promise.all(promises);
      console.log(`Successfully carried over ${validTasks.length} tasks`);

      // Clear the overdue tasks after successful operation
      setOverdueTasks([]);
      setShowNotification(false);

      Alert.alert(
        "Success",
        `${validTasks.length} task${validTasks.length === 1 ? '' : 's'} carried over to today.`,
        [{ text: "OK" }]
      );

    } catch (error) {
      console.error("Error carrying over tasks:", error);
      Alert.alert(
        "Error",
        "Failed to carry over tasks. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.uid || !overdueTasks.length) return;

    try {
      // Force refresh of overdue tasks first using standardized approach
      const conditions = [
        ["userId", "==", user.uid],
        ["completed", "==", false]
      ];
      
      const currentTasks = await queryDocuments("reminders", conditions);
      const tasksToDelete = [];

      // Double check if tasks should be deleted
      for (const task of currentTasks) {
        if (overdueTasks.some(t => t.id === task.id)) {
          tasksToDelete.push(task);
        }
      }

      console.log("Attempting to delete tasks:", tasksToDelete.map(t => t.id));

      // Delete each task using standardized deleteDocument method
      const deletePromises = [];
      for (const task of tasksToDelete) {
        try {
          deletePromises.push(deleteDocument("reminders", task.id));
          console.log(`Queued deletion for task: ${task.id}`);
        } catch (deleteError) {
          console.error(`Failed to queue task ${task.id} for deletion:`, deleteError);
        }
      }
      
      // Execute all deletions
      await Promise.all(deletePromises);

      // Force a fresh check for any remaining overdue tasks
      await checkOverdueTasks();
      
      Alert.alert("Success", "Tasks deleted successfully");
    } catch (error) {
      console.error("Error in handleDelete:", error);
      Alert.alert("Error", "Some tasks could not be deleted. Please try again.");
    }
  };

  const checkOverdueTasks = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Use standardized queryDocuments method
      const conditions = [
        ["userId", "==", user.uid],
        ["completed", "==", false]
      ];
      
      const tasks = await queryDocuments("reminders", conditions);
      const overdueList = [];

      // Process results
      for (const task of tasks) {
        const taskDate = new Date(task.scheduledFor);
        taskDate.setHours(0, 0, 0, 0);
        
        if (taskDate < now) {
          console.log("Found overdue task with data:", task);
          overdueList.push(task);
        }
      }

      setOverdueTasks(overdueList);
      setShowNotification(overdueList.length > 0);
      
    } catch (error) {
      console.error("Error checking overdue tasks:", error);
      setOverdueTasks([]);
      setShowNotification(false);
    }
  }, [user?.uid]);


  // Check for overdue tasks when user changes
  useEffect(() => {
    if (user?.uid) {
      checkOverdueTasks();
    }
  }, [user?.uid, checkOverdueTasks]);

  return {
    overdueTasks,
    showNotification,
    setShowNotification,
    handleCarryOver,
    handleDelete,
    checkOverdueTasks,
    isProcessing
  };
};