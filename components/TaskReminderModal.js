import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import ParticleAnimation from '../screens/ParticleAnimation';
import NotificationManager from '../notifications/notifications';

// Simple border component for action feedback
const BorderView = ({ color, show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;
  
  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        borderWidth: 6,
        borderColor: color,
        borderRadius: 16,
        backgroundColor: 'rgba(30, 30, 30, 1)', // Change to solid color
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
      }}
    />
  );
};

const TaskReminderModal = ({
  visible,
  task,
  onDismiss,
  onComplete,
  onReschedule,
  onDelete,
  dismissible = true,
  xpReward = 5
}) => {
  const { t } = useTranslation();
  
  // Simple fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // State for content visibility
  const [showContent, setShowContent] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [animationState, setAnimationState] = useState({
    showCompleteBorder: false,
    showRescheduleBorder: false,
    showDeleteBorder: false,
    color: 'transparent'
  });
  
  // Track if an action has been taken
  const [actionTaken, setActionTaken] = useState(false);
  
  // Use refs for reliable state tracking 
  const actionTypeRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const modalVisibleRef = useRef(false);
  const actionTakenRef = useRef(false);
  const taskRef = useRef(null);

  // Update ref values when props/state change
  useEffect(() => {
    modalVisibleRef.current = visible;
    actionTakenRef.current = actionTaken;
    taskRef.current = task;
  }, [visible, actionTaken, task]);

  // Mark the modal as displayed in Firestore when it becomes visible
  useEffect(() => {
    if (visible && task?.id) {
      NotificationManager.markModalDisplayed(task.id, true)
        .catch(err => console.error('Error marking modal as displayed:', err));
    }
  }, [visible, task?.id]);

  // Simple fade in when visible changes
  useEffect(() => {
    if (visible && !actionTakenRef.current) {
      // Reset state
      isAnimatingRef.current = false;
      actionTypeRef.current = null;
      setActionTaken(false);
      setShowContent(true);
      
      // Simple fade in
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      // Show particles after a delay
      const particleTimer = setTimeout(() => {
        if (modalVisibleRef.current) {
          setShowParticles(true);
        }
      }, 300);
      
      // Clean up timers
      return () => {
        clearTimeout(particleTimer);
      };
    } else if (!visible) {
      // Reset state when hidden
      setActionTaken(false);
      isAnimatingRef.current = false;
      setShowContent(false);
      setShowParticles(false);
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  // Simple fade out
  const fadeOut = (callback) => {
    setShowParticles(false);
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setShowContent(false);
      
      if (callback) {
        setTimeout(() => {
          if (typeof callback === 'function') {
            callback();
          }
        }, 50);
      }
      
      isAnimatingRef.current = false;
    });
  };

  // Handle border display completion
  const handleBorderComplete = () => {
    // Store current state before resetting
    const currentAction = {
      isComplete: animationState.showCompleteBorder,
      isReschedule: animationState.showRescheduleBorder,
      isDelete: animationState.showDeleteBorder
    };
    
    const currentTask = taskRef.current;
    
    // Reset border state
    setAnimationState({
      showCompleteBorder: false,
      showRescheduleBorder: false,
      showDeleteBorder: false,
      color: 'transparent'
    });
    
    // Fade out and execute callback
    fadeOut(() => {
      // Execute the appropriate callback based on action type
      if (currentAction.isComplete && onComplete && currentTask) {
        // Call NotificationManager directly to ensure consistency
        NotificationManager.completeTask(currentTask)
          .then(() => {
            if (onComplete) onComplete(currentTask);
          })
          .catch(err => console.error('Error completing task from modal:', err));
          
      } else if (currentAction.isReschedule && onReschedule && currentTask) {
        // Call NotificationManager directly to ensure consistency
        NotificationManager.rescheduleTask(currentTask)
          .then(result => {
            if (onReschedule) onReschedule(currentTask);
          })
          .catch(err => console.error('Error rescheduling task from modal:', err));
          
      } else if (currentAction.isDelete && onDelete && currentTask) {
        // Call NotificationManager directly to ensure consistency
        NotificationManager.deleteTask(currentTask)
          .then(() => {
            if (onDelete) onDelete(currentTask);
          })
          .catch(err => console.error('Error deleting task from modal:', err));
          
      } else if (onDismiss) {
        // Just dismiss the modal if no specific action or task
        onDismiss();
      }
    });
  };

  // Handle dismiss action
  const handleDismiss = () => {
    // Only allow dismiss if dismissible and not already animating
    if (!dismissible || isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    setActionTaken(true);
    actionTypeRef.current = 'dismiss';
    
    // Fade out and call onDismiss
    fadeOut(onDismiss);
  };

  // Handle complete action
  const handleComplete = () => {
    // Prevent multiple rapid clicks
    if (isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    setActionTaken(true);
    actionTypeRef.current = 'complete';
    
    // Show completion border
    setAnimationState({
      showCompleteBorder: true,
      showRescheduleBorder: false,
      showDeleteBorder: false,
      color: '#00C853'
    });
  };

  // Handle reschedule action
  const handleReschedule = () => {
    // Prevent multiple rapid clicks
    if (isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    setActionTaken(true);
    actionTypeRef.current = 'reschedule';
    
    // Show reschedule border
    setAnimationState({
      showCompleteBorder: false,
      showRescheduleBorder: true,
      showDeleteBorder: false,
      color: '#FFA000'
    });
  };

  // Handle delete action
  const handleDelete = () => {
    // Prevent multiple rapid clicks
    if (isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    setActionTaken(true);
    actionTypeRef.current = 'delete';
    
    // Show delete border
    setAnimationState({
      showCompleteBorder: false,
      showRescheduleBorder: false,
      showDeleteBorder: true,
      color: '#D32F2F'
    });
  };

  // Calculate XP reward with penalty for rescheduling
  const calculateXP = () => {
    const baseXP = xpReward;
    const rescheduleCount = task?.rescheduleCount || 0;
    const penalty = Math.min(rescheduleCount, baseXP - 1); // Ensure at least 1 XP remains
    return Math.max(1, baseXP - penalty);
  };

  // Get appropriate icon, message, and color based on reschedule count
  const getRescheduleInfo = () => {
    const count = task?.rescheduleCount || 0;
    
    if (count === 0) {
      return {
        icon: "bell",
        message: "Time's up! Have you completed this task?",
        color: getPriorityColor()
      };
    } else if (count === 1) {
      return {
        icon: "history",
        message: "You've rescheduled this task once. Ready to complete it now?",
        color: "#FFA000"
      };
    } else {
      return {
        icon: "exclamation-circle",
        message: `You've rescheduled this task ${count} times. Focus and try to complete it!`,
        color: "#FF1744"
      };
    }
  };

  // Get priority color for styling
  const getPriorityColor = () => {
    const priorityColors = {
      Urgent: "#FF1744",
      High: "#FF9100",
      Medium: "#00C853",
      Lowest: "#00B0FF"
    };
    return priorityColors[task?.priority] || "#00B0FF";
  };

  const reminderInfo = getRescheduleInfo();
  const xpAmount = calculateXP();

  if (!visible || !task) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => {
        if (dismissible) {
          handleDismiss();
        }
      }}
    >
      {/* Main container */}
      <View style={styles.container}>
        {/* Background layer */}
        <View style={[styles.modalOverlay, { backgroundColor: '#F7E8D3' }]} />
        
        {/* Particle animation layer */}
        {showParticles && (
          <View style={{ zIndex: 2, ...StyleSheet.absoluteFillObject, backgroundColor: '#F7E8D3'}}>
            <ParticleAnimation count={60} />
          </View>
        )}
        
        {/* Modal Content with simple fade */}
        {showContent && (
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContent,
                { 
                  opacity: fadeAnim,
                  zIndex: 3
                }
              ]}
            >
              {/* Border for action feedback */}
              <BorderView 
                color={animationState.color}
                show={animationState.showCompleteBorder || 
                      animationState.showRescheduleBorder || 
                      animationState.showDeleteBorder}
                onComplete={handleBorderComplete}
              />
              
              <View style={[styles.headerBar, { backgroundColor: reminderInfo.color }]} />
              
              <View style={styles.iconContainer}>
                <FontAwesome 
                  name={reminderInfo.icon} 
                  size={40} 
                  color={reminderInfo.color} 
                />
              </View>
              
              <Text style={styles.title}>{t('taskReminder.title', 'Task Reminder')}</Text>
              
              <Text style={styles.taskText}>{task.text}</Text>
              
              <Text style={styles.messageText}>{reminderInfo.message}</Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={handleComplete}
                  activeOpacity={0.8}
                  disabled={isAnimatingRef.current}
                >
                  <FontAwesome name="check-circle" size={22} color="#fff" />
                  <Text style={styles.buttonText}>
                    {t('taskReminder.complete', 'Complete')} (+{xpAmount} XP)
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.rescheduleButton]}
                  onPress={handleReschedule}
                  activeOpacity={0.8}
                  disabled={isAnimatingRef.current}
                >
                  <FontAwesome name="clock-o" size={22} color="#fff" />
                  <Text style={styles.buttonText}>{t('taskReminder.reschedule', 'Reschedule')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                  disabled={isAnimatingRef.current}
                >
                  <FontAwesome name="trash" size={22} color="#fff" />
                  <Text style={styles.buttonText}>{t('taskReminder.delete', 'Delete')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        )}
        
        {/* Dismissible background touch area */}
        {dismissible && !isAnimatingRef.current && (
          <TouchableOpacity
            style={styles.dismissBackground}
            activeOpacity={1}
            onPress={handleDismiss}
            disabled={isAnimatingRef.current}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  headerBar: {
    height: 6,
    width: '40%',
    borderRadius: 3,
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F7E8D3',
    marginBottom: 12,
    textAlign: 'center',
  },
  taskText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#F7E8D3',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  messageText: {
    fontSize: 16,
    color: '#F7E8D3',
    opacity: 0.8,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#00C853',
  },
  rescheduleButton: {
    backgroundColor: '#FFA000',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  dismissBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  }
});

export default TaskReminderModal;