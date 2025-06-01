import { useState, useRef } from 'react';
import { Animated } from 'react-native';

export const useHomeScreenState = () => {
  // Loading and initialization states
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  // Task-related states
  const [reminders, setReminders] = useState([]);
  const [futureReminders, setFutureReminders] = useState([]);
  const [showFutureTasks, setShowFutureTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [currentReminderTask, setCurrentReminderTask] = useState(null);
  const [highestPriorityTask, setHighestPriorityTask] = useState(null);
  const [overdueTasks, setOverdueTasks] = useState([]);

  // User-related states
  const [isNewUser, setIsNewUser] = useState(false);
  const [userName, setUserName] = useState("");

  // Task input and suggestions states
  const [subtasks, setSubtasks] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Modal visibility states
  const [modalVisible, setModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHelpModalVisible, setHelpModalVisible] = useState(false);
  const [isProgressReflectionsVisible, setProgressReflectionsVisible] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [taskInputModalVisible, setTaskInputModalVisible] = useState(false);
  const [taskReminderModalVisible, setTaskReminderModalVisible] = useState(false);
  const [showOverdueTasksModal, setShowOverdueTasksModal] = useState(false);
  const [isSubtasksModalVisible, setIsSubtasksModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isQuestCompletedVisible, setIsQuestCompletedVisible] = useState(false);
  const [isSubtaskModalVisible, setSubtaskModalVisible] = useState(false);
  const [isTaskNoteModalVisible, setTaskNoteModalVisible] = useState(false);
  const [showTaskReminderModal, setShowTaskReminderModal] = useState(false);

  // Task modification states
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [selectedTaskForSubtask, setSelectedTaskForSubtask] = useState(null);
  const [subtasksToEdit, setSubtasksToEdit] = useState([]);
  const [selectedTaskForNote, setSelectedTaskForNote] = useState(null);

  // Animation states
  const fadeAnims = useRef({}).current;
  const helpButtonAnim = useRef(new Animated.Value(1)).current;
  const listFadeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [xpGainAnimations, setXpGainAnimations] = useState([]);

  // Timer and date states
  const [alertInterval, setAlertInterval] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Cleanup
  const unsubscribeListeners = useRef([]);

  return {
    // Loading states
    isLoading,
    setIsLoading,
    isInitializing,
    setIsInitializing,
    loading,
    setLoading,

    // Task states
    reminders,
    setReminders,
    futureReminders,
    setFutureReminders,
    showFutureTasks,
    setShowFutureTasks,
    selectedTask,
    setSelectedTask,
    deletingTaskId,
    setDeletingTaskId,
    currentReminderTask,
    setCurrentReminderTask,
    highestPriorityTask,
    setHighestPriorityTask,
    overdueTasks,
    setOverdueTasks,

    // User states
    isNewUser,
    setIsNewUser,
    userName,
    setUserName,

    // Task input and suggestions states
    subtasks,
    setSubtasks,
    showSuggestions,
    setShowSuggestions,

    // Modal states
    modalVisible,
    setModalVisible,
    isModalVisible,
    setIsModalVisible,
    isHelpModalVisible,
    setHelpModalVisible,
    isProgressReflectionsVisible,
    setProgressReflectionsVisible,
    isAlertVisible,
    setIsAlertVisible,
    taskInputModalVisible,
    setTaskInputModalVisible,
    taskReminderModalVisible,
    setTaskReminderModalVisible,
    showOverdueTasksModal,
    setShowOverdueTasksModal,
    isSubtasksModalVisible,
    setIsSubtasksModalVisible,
    isMenuVisible,
    setIsMenuVisible,
    isQuestCompletedVisible,
    setIsQuestCompletedVisible,
    isSubtaskModalVisible,
    setSubtaskModalVisible,
    isTaskNoteModalVisible,
    setTaskNoteModalVisible,
    showTaskReminderModal,
    setShowTaskReminderModal,

    // Task modification states
    selectedSubtasks,
    setSelectedSubtasks,
    selectedTaskForSubtask,
    setSelectedTaskForSubtask,
    subtasksToEdit,
    setSubtasksToEdit,
    selectedTaskForNote,
    setSelectedTaskForNote,

    // Animation states
    fadeAnims,
    helpButtonAnim,
    listFadeAnim,
    fadeAnim,
    xpGainAnimations,
    setXpGainAnimations,

    // Timer and date states
    alertInterval,
    setAlertInterval,
    alertCount,
    setAlertCount,
    showDatePicker,
    setShowDatePicker,

    // Cleanup
    unsubscribeListeners
  };
};