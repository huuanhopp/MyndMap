import { useCallback } from 'react';

export const useModalHandlers = ({
  setTaskInputModalVisible,
  setNewTaskText,
  setTaskPriority,
  setRepetitionInterval,
  setScheduledDate,
  setSubtasks,
  setHelpModalVisible,
  setModalVisible,
  setIsSubtasksModalVisible,
  setSelectedSubtasks,
  setSelectedTask
}) => {
  const openTaskInputModal = useCallback(() => {
    setTaskInputModalVisible(true);
  }, [setTaskInputModalVisible]);

  const closeTaskInputModal = useCallback(() => {
    setTaskInputModalVisible(false);
    resetModalState();
  }, [setTaskInputModalVisible]);

  const resetModalState = useCallback(() => {
    setNewTaskText?.('');
    setTaskPriority?.('Medium');
    setRepetitionInterval?.(null);
    setScheduledDate?.(null);
    setSubtasks?.([]);
    setSelectedTask?.(null);
  }, [
    setNewTaskText,
    setTaskPriority,
    setRepetitionInterval,
    setScheduledDate,
    setSubtasks,
    setSelectedTask
  ]);

  const closeModals = useCallback(() => {
    setModalVisible?.(false);
    setTaskInputModalVisible?.(false);
    setIsSubtasksModalVisible?.(false);
    resetModalState();
  }, [
    setModalVisible,
    setTaskInputModalVisible,
    setIsSubtasksModalVisible,
    resetModalState
  ]);

  const showHelpModal = useCallback(() => {
    setHelpModalVisible(true);
  }, [setHelpModalVisible]);

  const closeHelpModal = useCallback(() => {
    setHelpModalVisible(false);
  }, [setHelpModalVisible]);

  const handleViewSubtasks = useCallback((task) => {
    if (!task) return;
    setSelectedSubtasks?.(task.subtasks || []);
    setSelectedTask?.(task);
    setIsSubtasksModalVisible?.(true);
  }, [setSelectedSubtasks, setSelectedTask, setIsSubtasksModalVisible]);

  const handleLongPress = useCallback((task) => {
    if (!task) return;
    setSelectedTask?.(task);
    setModalVisible?.(true);
  }, [setSelectedTask, setModalVisible]);

  const handleAddSubtask = useCallback((task) => {
    if (!task) return;
    setSelectedTask?.(task);
    setModalVisible?.(true);
  }, [setSelectedTask, setModalVisible]);

  // Remove handleEdit from this hook
  
  const handleDelete = useCallback(async (task, onDeleteTask) => {
    if (!task || !onDeleteTask) return;
    
    try {
      await onDeleteTask(task);
      closeModals();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [closeModals]);

  return {
    openTaskInputModal,
    closeTaskInputModal,
    resetModalState,
    closeModals,
    showHelpModal,
    closeHelpModal,
    handleViewSubtasks,
    handleLongPress,
    handleAddSubtask,
    // Not returning handleEdit anymore
    handleDelete
  };
};

export default useModalHandlers;