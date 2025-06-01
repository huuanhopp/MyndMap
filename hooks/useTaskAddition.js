import { useState, useCallback, useRef } from 'react';
import { Alert, Animated } from 'react-native';
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../screens/firebaseConfig';

export const useTaskAddition = (user, setReminders, setFutureReminders) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [taskPriority, setTaskPriority] = useState('Lowest');
  const [repetitionInterval, setRepetitionInterval] = useState('5');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fadeAnims, setFadeAnims] = useState({});
  const processedTaskIds = useRef(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const MAX_SUBTASKS = 5;

  const handleInputChange = useCallback((text) => {
    setNewTaskText(text);
  }, []);

  const handleDateChange = useCallback((date) => {
    setScheduledDate(date);
  }, []);

  const resetDate = useCallback(() => {
    setScheduledDate(new Date());
  }, []);

  const updateRemindersState = useCallback((taskWithId, isFutureTask) => {
    if (processedTaskIds.current.has(taskWithId.id)) {
      console.log('Preventing duplicate task addition:', taskWithId.id);
      return;
    }

    processedTaskIds.current.add(taskWithId.id);

    if (isFutureTask) {
      setFutureReminders(prevFuture => {
        const existingTask = prevFuture.find(task => task.id === taskWithId.id);
        if (existingTask) return prevFuture;
        return [...prevFuture, taskWithId];
      });
    } else {
      setReminders(prev => {
        const existingTask = prev.find(task => task.id === taskWithId.id);
        if (existingTask) return prev;
        return [...prev, taskWithId];
      });
    }
  }, [setReminders, setFutureReminders]);

  const handleAddTask = useCallback(async () => {
    console.log('Task Creation Started:', {
      text: newTaskText,
      scheduledDate: scheduledDate,
      priority: taskPriority
    });

    if (!user?.uid) {
      console.log('Task Creation Failed: No user ID');
      Alert.alert("Error", "You must be logged in to create tasks");
      return false;
    }

    if (!newTaskText.trim()) {
      console.log('Task Creation Failed: Empty task text');
      Alert.alert("Error", "Task name cannot be empty");
      return false;
    }

    try {
      setLoading(true);
      const now = new Date();
      const interval = parseInt(repetitionInterval);
      const endTime = new Date(now.getTime() + (interval * 60000));

      const processedSubtasks = subtasks.map((subtask, index) => ({
        ...subtask,
        id: `subtask-${Date.now()}-${index}`,
        completed: false
      }));

      // Enhanced task creation with better data structure
      const newTask = {
        text: newTaskText.trim(),
        priority: taskPriority,
        interval: interval, // Add direct interval property
        intervals: [interval],
        scheduledFor: scheduledDate.toISOString(),
        dueDate: scheduledDate.toISOString(), // Add dueDate for consistency
        createdAt: serverTimestamp(), // Use Firestore timestamp
        updatedAt: serverTimestamp(), // Add updatedAt field
        userId: user.uid,
        completed: false,
        deleted: false, // Explicitly mark as not deleted
        subtasks: processedSubtasks,
        hasSubtasks: processedSubtasks.length > 0,
        timerState: {
          isActive: true,
          startTime: serverTimestamp(),
          duration: interval,
          notificationStatus: 'scheduled',
          scheduledFor: endTime.toISOString()
        },
        rescheduleCount: 0,
        animateIn: true
      };

      console.log('Attempting to create task in Firebase:', {
        taskText: newTask.text,
        scheduledFor: newTask.scheduledFor,
        userId: newTask.userId
      });

      const docRef = await addDoc(collection(db, "reminders"), newTask);
      
      console.log('Task created in Firebase:', {
        taskId: docRef.id,
        success: true
      });

      // Create a version with client-side timestamps for immediate UI update
      const taskWithId = {
        ...newTask,
        id: docRef.id,
        key: `${docRef.id}-${Date.now()}`,
        createdAt: now.toISOString(), // Client-side timestamp for UI
        updatedAt: now.toISOString(),
        timerState: {
          ...newTask.timerState,
          startTime: now.toISOString() // Client-side timestamp for UI
        }
      };

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const taskDate = new Date(taskWithId.scheduledFor);
      taskDate.setHours(0, 0, 0, 0);

      console.log('Task Classification:', {
        taskId: taskWithId.id,
        currentDate: currentDate.toISOString(),
        taskDate: taskDate.toISOString(),
        isFutureTask: taskDate > currentDate
      });

      updateRemindersState(taskWithId, taskDate > currentDate);

      setNewTaskText('');
      setTaskPriority('Lowest');
      setRepetitionInterval('5');
      setScheduledDate(new Date());
      setSubtasks([]);
      setShowSuggestions(false);

      console.log('Task Creation Completed Successfully');
      return true;
    } catch (error) {
      console.error('Task Creation Error:', {
        error: error.message,
        stack: error.stack
      });
      Alert.alert("Error", "Failed to add task. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, newTaskText, taskPriority, repetitionInterval, scheduledDate, subtasks, updateRemindersState]);

  const handleAddTaskFromModal = useCallback(async () => {
    try {
      return await handleAddTask();
    } catch (error) {
      console.error("Error in handleAddTaskFromModal:", error);
      Alert.alert("Error", "Failed to add task. Please try again.");
      return false;
    }
  }, [handleAddTask]);

  const addSubtask = useCallback(() => {
    if (subtasks.length >= MAX_SUBTASKS) {
      Alert.alert("Maximum Subtasks", `You can only add up to ${MAX_SUBTASKS} subtasks.`);
      return;
    }
    const newSubtask = {
      id: `new-subtask-${Date.now()}`,
      text: '',
      microTask: '',
      completed: false
    };
    setSubtasks(prev => [...prev, newSubtask]);
  }, [subtasks]);

  const updateSubtask = useCallback((index, field, value) => {
    setSubtasks(prev => prev.map((subtask, i) => 
      i === index ? { ...subtask, [field]: value } : subtask
    ));
  }, []);

  const deleteSubtask = useCallback((index) => {
    setSubtasks(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    newTaskText,
    taskPriority,
    repetitionInterval,
    scheduledDate,
    subtasks,
    loading,
    searchHistory,
    showSuggestions,
    fadeAnims,
    setFadeAnims,
    setNewTaskText,
    setTaskPriority,
    setRepetitionInterval,
    setScheduledDate,
    setSubtasks,
    handleInputChange,
    handleDateChange,
    resetDate,
    handleAddTask,
    handleAddTaskFromModal,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    MAX_SUBTASKS,
    fadeAnim
  };
};