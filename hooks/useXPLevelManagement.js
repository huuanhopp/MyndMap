import { useCallback } from 'react';

export const useModalHandlers = (
  setTaskInputModalVisible,
  setNewTaskText,
  setTaskPriority,
  setRepetitionInterval,
  setScheduledDate,
  setSubtasks,
  setShowSuggestions,
  setHelpModalVisible,
  setModalVisible,
  setIsSubtasksModalVisible,
  setSelectedSubtasks
) => {
  const openTaskInputModal = useCallback(() => {
    setTaskInputModalVisible(true);
  }, []);

  const closeTaskInputModal = useCallback(() => {
    resetModalState();
    setTaskInputModalVisible(false);
  }, []);

  const resetModalState = useCallback(() => {
    setNewTaskText('');
    setTaskPriority('Lowest');
    setRepetitionInterval('5');
    setScheduledDate(new Date());
    setSubtasks([]);
    setShowSuggestions(false);
  }, []);

  const showHelpModal = useCallback(() => {
    setHelpModalVisible(true);
  }, []);

  const closeHelpModal = useCallback(() => {
    setHelpModalVisible(false);
  }, []);

  const handleViewSubtasks = useCallback((task) => {
    setSelectedSubtasks(task.subtasks);
    setIsSubtasksModalVisible(true);
  }, []);

  const handleLongPress = useCallback((task) => {
    setSelectedTask(task);
    setModalVisible(true);
  }, []);

  return {
    openTaskInputModal,
    closeTaskInputModal,
    resetModalState,
    showHelpModal,
    closeHelpModal,
    handleViewSubtasks,
    handleLongPress
  };
};