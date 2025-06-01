import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { scheduleTaskNotifications } from '../notifications/firebaseUtils';

export const useTaskAddition = (user, setReminders) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [taskPriority, setTaskPriority] = useState('Lowest');
  const [repetitionInterval, setRepetitionInterval] = useState('5');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [subtasks, setSubtasks] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const MAX_SUBTASKS = 3;

  const handleInputChange = (text) => {
    setNewTaskText(text);
    if (text.length > 0) {
      const filteredHistory = searchHistory.filter(item =>
        item.toLowerCase().startsWith(text.toLowerCase())
      );
      setShowSuggestions(filteredHistory.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setNewTaskText(suggestion);
    setShowSuggestions(false);
  };

  const resetDate = () => {
    setScheduledDate(new Date());
  };

  const handleDateChange = (date) => {
    setScheduledDate(date);
  };

  const addSubtask = () => {
    if (subtasks.length < MAX_SUBTASKS) {
      setSubtasks([...subtasks, { text: '', microTask: '' }]);
    } else {
      Alert.alert(
        'Subtask Limit Reached',
        'You can only add up to 3 subtasks per task.'
      );
    }
  };

  const updateSubtask = (index, field, value) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = { ...updatedSubtasks[index], [field]: value };
    setSubtasks(updatedSubtasks);
  };

  const deleteSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const checkTaskLimits = async (priority) => {
    if (!user?.uid) return false;

    const limits = { Urgent: 1, High: 2, Medium: 3, Lowest: 4 };
    const q = query(
      collection(db, "reminders"),
      where("userId", "==", user.uid),
      where("priority", "==", priority),
      where("completed", "==", false)
    );

    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size;

    if (count >= limits[priority]) {
      Alert.alert(
        'Priority Limit Reached',
        `You can only have ${limits[priority]} ${priority} priority task${limits[priority] > 1 ? 's' : ''} at a time.`
      );
      return false;
    }
    return true;
  };

  const handleAddTask = useCallback(async () => {
    if (!user?.uid) {
      Alert.alert("Authentication Error", "Please log in to add tasks.");
      return null;
    }

    if (!newTaskText.trim()) {
      Alert.alert("Error", "Task name cannot be empty");
      return null;
    }

    try {
      setLoading(true);

      const withinLimits = await checkTaskLimits(taskPriority);
      if (!withinLimits) {
        setLoading(false);
        return null;
      }

      const taskData = {
        text: newTaskText.trim(),
        priority: taskPriority,
        intervals: [parseInt(repetitionInterval)],
        scheduledFor: scheduledDate.toISOString(),
        userId: user.uid,
        completed: false,
        createdAt: new Date().toISOString(),
        timerStartedAt: new Date().toISOString(),
        notificationShown: false,
        animateIn: true,
        rescheduleCount: 0,
        subtasks: subtasks
          .filter(st => st.text.trim() !== '')
          .map(st => ({
            text: st.text.trim(),
            microTask: st.microTask.trim(),
            completed: false
          }))
      };

      const docRef = await addDoc(collection(db, "reminders"), taskData);
      const newTask = { 
        id: docRef.id,  // Ensure this is set before updating state
        ...taskData 
      };

      // Update reminders state with unique key
      setReminders(prevReminders => {
        const updatedReminders = [newTask, ...prevReminders.filter(task => task.id !== newTask.id)];
        return updatedReminders.sort((a, b) => {
          const dateA = new Date(a.scheduledFor);
          const dateB = new Date(b.scheduledFor);
          return dateA - dateB;
        });
      });

      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Add Task Error", "Failed to add task. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
}, [user, newTaskText, taskPriority, repetitionInterval, scheduledDate, subtasks, setReminders]);

  return {
    // Task data
    newTaskText,
    taskPriority,
    repetitionInterval,
    scheduledDate,
    subtasks,
    loading,
    
    // Search functionality
    searchHistory,
    showSuggestions,
    
    // Setters
    setNewTaskText,
    setTaskPriority,
    setRepetitionInterval,
    setScheduledDate,
    
    // Handlers
    handleInputChange,
    handleSuggestionPress,
    handleDateChange,
    resetDate,
    handleAddTask,
    
    // Subtask management
    addSubtask,
    updateSubtask,
    deleteSubtask,
    MAX_SUBTASKS
  };
};