import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  AppState, 
  TouchableOpacity, 
  Animated, 
  LayoutAnimation, 
  Platform,
  UIManager
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTaskTimer } from '../hooks/useTaskTimer';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Enhanced logging function for tracking notification flow in ActiveTimer
function logTimerAction(action, taskId, details = {}) {
  const timestamp = new Date().toISOString();
  const logMessage = {
    timestamp,
    action,
    taskId,
    component: 'ActiveTimer',
    ...details
  };
  
  console.log(`[TIMER][${timestamp}][${action}][Task: ${taskId}]`, JSON.stringify(details, null, 2));
}

// Enhanced function to check for recent notifications
async function wasNotificationRecentlySent(taskId) {
  try {
    const recentNotificationKey = `recent_notification_${taskId}`;
    const recentNotificationData = await AsyncStorage.getItem(recentNotificationKey);
    
    if (recentNotificationData) {
      const parsedData = JSON.parse(recentNotificationData);
      const timestamp = parsedData.timestamp;
      const age = (Date.now() - timestamp) / 1000;
      
      // If notification was sent in the last 5 seconds, it's a duplicate
      if (Date.now() - timestamp < 5000) {
        logTimerAction('DUPLICATE_PREVENTED', taskId, { 
          age: `${age.toFixed(1)}s`,
          lastSent: new Date(timestamp).toISOString(),
          source: parsedData.source || 'Unknown'
        });
        return true;
      }
      
      logTimerAction('PREVIOUS_NOTIFICATION_EXPIRED', taskId, {
        age: `${age.toFixed(1)}s`,
        lastSent: new Date(timestamp).toISOString()
      });
    } else {
      logTimerAction('NO_RECENT_NOTIFICATION', taskId);
    }
    return false;
  } catch (error) {
    console.error('[TIMER][ERROR] Error checking recent notifications:', error);
    return false;
  }
}

// Enhanced function to mark notification as sent
async function markNotificationAsSent(taskId) {
  try {
    const recentNotificationKey = `recent_notification_${taskId}`;
    const timestamp = Date.now();
    
    // Store stack trace to identify the source
    const stackTrace = new Error().stack;
    
    await AsyncStorage.setItem(recentNotificationKey, JSON.stringify({
      timestamp,
      source: 'ActiveTimer',
      stack: stackTrace
    }));
    
    logTimerAction('MARKED_AS_SENT', taskId, {
      sentAt: new Date(timestamp).toISOString(),
      stack: stackTrace.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
    });
    
    return true;
  } catch (error) {
    console.error('[TIMER][ERROR] Error marking notification as sent:', error);
    return false;
  }
}

// Make the priority color function available globally to prevent undefined errors
const getPriorityColor = (priority) => {
  const priorityColors = {
    Urgent: "#FF1744",
    High: "#FF9100",
    Medium: "#00C853",
    Lowest: "#00B0FF"
  };
  return priorityColors[priority] || "#00B0FF";
};

// Enhanced Particle Animation Component with continuous movement
const ParticleAnimation = ({ count = 15 }) => {
  const [particles, setParticles] = useState([]);
  
  // Initialize particles on component mount
  useEffect(() => {
    const initialParticles = Array(count).fill().map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    
    setParticles(initialParticles);
    
    // Animation interval independent of timer
    const animationInterval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;
          
          // Boundary check and bounce
          if (newX < 0 || newX > 100) {
            particle.speedX *= -1;
            newX = particle.x + particle.speedX;
          }
          
          if (newY < 0 || newY > 100) {
            particle.speedY *= -1;
            newY = particle.y + particle.speedY;
          }
          
          return {
            ...particle,
            x: newX,
            y: newY
          };
        })
      );
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(animationInterval);
  }, [count]);

  return (
    <View style={particleStyles.container}>
      {particles.map(particle => (
        <View
          key={particle.id}
          style={[
            particleStyles.particle,
            {
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              backgroundColor: '#1a1a1a', // Dark particle color for better visibility
            },
          ]}
        />
      ))}
    </View>
  );
};

// ADHD/Neurodivergent Strategies Database
const focusStrategies = [
  "Break your task into tiny steps. What's the smallest first action?",
  "Set a timer for just 5 minutes of work - you can stop after that if needed.",
  "Create external accountability by telling someone what you'll accomplish.",
  "Use the 'body doubling' technique - work alongside someone else who is also focused.",
  "Remove all possible distractions from your environment before starting.",
  "Try the Pomodoro technique: 25 minutes of focus, then a 5-minute break.",
  "Write down exactly what success looks like for this task.",
  "Start with the most interesting or novel part of the task.",
  "Use background noise or music without lyrics to create a focus bubble.",
  "Stimulate your senses with a fidget toy while working.",
  "Verbalize what you're doing out loud to maintain attention.",
  "Gamify the task by setting up rewards for completion milestones.",
  "Try standing or moving while working to engage your body.",
  "Use visual timers to make time passage more concrete.",
  "Implement the 'two-minute rule' - if it takes less than two minutes, do it now.",
  "Create a dedicated workspace that signals 'focus time' to your brain.",
  "Use sticky notes in your line of sight to keep task goals visible.",
  "Try task-switching between two different tasks every 15 minutes.",
  "Set a specific, measurable outcome for this focus session.",
  "Block websites and apps that typically distract you during focus time.",
  "Try 'eating the frog' - tackle your most difficult task first.",
  "Narrate the steps of your task in writing before starting.",
  "Use implementation intentions: 'When X happens, I will do Y.'",
  "Work in a different environment than usual to reset your focus.",
  "Use a focus app that grows virtual plants while you stay on task.",
  "Try the 'Swiss cheese' method - poke small holes in the task throughout the day.",
  "Match your task to your energy level - save complex work for peak hours.",
  "Use a visual progress bar or checklist to see advancement.",
  "Set a clear stopping point before starting to create a finish line.",
  "Practice 'temptation bundling' - pair a rewarding activity with your task.",
  "Schedule your focus time during your biological prime time.",
  "Use color-coding systems to organize different aspects of your task.",
  "Create a pre-focus ritual to signal to your brain it's time to concentrate.",
  "Try interval working - alternate between sitting and standing every 30 minutes.",
  "Set a specific intention for what you'll learn during this session.",
  "Use the 'five whys' technique to connect this task to your deeper motivations.",
  "Recruit your interest-based nervous system by finding a novel angle.",
  "Practice 'if-then' planning for when you feel your focus slipping.",
  "Use physical anchors like a special pen or notebook that signal 'focus time'.",
  "Schedule focus blocks that align with your medication timing, if applicable.",
  "Try the 'whiteboard method' - write your task in the center and branch out sub-tasks.",
  "Use a habit tracker to build consistency in your focus practice.",
  "Create artificial deadlines with actual consequences.",
  "Practice visualization of task completion before starting.",
  "Use a focus partner who you can quickly message when stuck.",
  "Try 'productive procrastination' - use your avoidance energy on related smaller tasks.",
  "Embrace 'good enough' - perfectionism can be paralyzing.",
  "Use the 'do something' principle - any action, no matter how small, creates momentum.",
  "Identify and plan for your specific focus saboteurs in advance.",
  "Track your metrics - note when/where/how you work best.",
  "Use the 'one touch' rule - handle things immediately when possible."
];

const ActiveTimer = ({ task, onTimerComplete, onDelete }) => {
  if (!task) return null;

  logTimerAction('COMPONENT_RENDER', task?.id, {
    taskText: task?.text,
    timerState: task?.timerState
  });

  // State for tips section visibility
  const [showTips, setShowTips] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState(focusStrategies[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Animation values
  const tipsHeight = useRef(new Animated.Value(0)).current;
  const tipsOpacity = useRef(new Animated.Value(0)).current;
  const chevronRotation = useRef(new Animated.Value(0)).current;
  const deleteAnimation = useRef(new Animated.Value(1)).current;
  const maxTipsHeight = useRef(new Animated.Value(0)).current;
  const tipsContainerHeight = useRef(null);
  
  const {
    timeRemaining,
    isTimerActive
  } = useTaskTimer(task, handleTimerComplete);

  // Configure notification handling
  useEffect(() => {
    // Set up notification handler and permission
    async function configureNotifications() {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        logTimerAction('NOTIFICATION_PERMISSION_STATUS', task?.id, { status: existingStatus });
        
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          logTimerAction('REQUESTING_PERMISSIONS', task?.id);
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowAnnouncements: true,
              allowCriticalAlerts: true,
            },
          });
          finalStatus = status;
          logTimerAction('PERMISSION_RESULT', task?.id, { status });
        }
        
        // Configure foreground notification behavior
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          }),
        });
        
        logTimerAction('NOTIFICATION_HANDLER_CONFIGURED', task?.id);
        
        // Set up background notification handler
        const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            const data = response.notification.request.content.data;
            logTimerAction('BACKGROUND_NOTIFICATION_RESPONSE', data?.taskId, { 
              data,
              actionIdentifier: response.actionIdentifier
            });
            
            if (data.type === 'timer-completion' && data.taskId === task.id) {
              // Handle the background notification response
              logTimerAction('PROCESSING_BACKGROUND_NOTIFICATION', task.id);
            }
          }
        );
        
        return () => {
          // Clean up subscription
          logTimerAction('REMOVING_NOTIFICATION_SUBSCRIPTION', task?.id);
          backgroundSubscription.remove();
        };
      } catch (error) {
        console.error("[TIMER][ERROR] Error setting up notifications:", error);
      }
    }
    
    configureNotifications();
  }, [task?.id]);

  useEffect(() => {
    // Check if this is a completed timer that should be displayed
    if (task?.timerState?.isCompleted) {
      // Keep showing the timer, but with visual indication it's completed
      // This helps maintain continuity during the transition
      logTimerAction('TIMER_COMPLETED_STATE', task.id, { timerState: task.timerState });
      setIsCompleted(true);
    } else {
      setIsCompleted(false);
    }
  }, [task]);

  // Handle app state changes to manage notifications properly
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      logTimerAction('APP_STATE_CHANGED', task?.id, { 
        fromState: AppState.currentState, 
        toState: nextAppState 
      });
      
      if (nextAppState === 'active') {
        // App has come to the foreground - clear any pending notifications
        Notifications.dismissAllNotificationsAsync().catch(err => {
          console.error("Error dismissing notifications:", err);
        });
        Notifications.setBadgeCountAsync(0).catch(err => {
          console.error("Error resetting badge count:", err);
        });
        
        // Check pending notifications
        Notifications.getAllScheduledNotificationsAsync().then(notifications => {
          logTimerAction('PENDING_NOTIFICATIONS_CHECK', task?.id, {
            count: notifications.length,
            notifications: notifications.map(n => ({
              identifier: n.identifier,
              title: n.content.title,
              taskId: n.content.data?.taskId
            }))
          });
        });
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [task?.id]);

  // Set up custom layout animation
  const configureNextAnimation = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        duration: 100,
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
      create: {
        duration: 300,
        type: LayoutAnimation.Types.easeIn,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }, []);

  // Toggle tips visibility with animation
  const toggleTips = useCallback(() => {
    // Configure layout animation for smooth height changes
    configureNextAnimation();
    
    const newShowTips = !showTips;
    setShowTips(newShowTips);
    
    // Animate chevron rotation
    Animated.timing(chevronRotation, {
      toValue: newShowTips ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Animate tip container height and opacity
    if (newShowTips) {
      // Fade in animation
      Animated.parallel([
        Animated.timing(tipsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(tipsHeight, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Fade out animation
      Animated.parallel([
        Animated.timing(tipsOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(tipsHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [showTips, chevronRotation, tipsOpacity, tipsHeight, configureNextAnimation]);

  // Handle task deletion with animation
  const handleDelete = () => {
    setIsDeleting(true);
    
    // Animate fade out
    Animated.timing(deleteAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Call the delete handler after animation completes
      if (onDelete) {
        onDelete(task);
      }
    });
  };

  // Generate a random strategy
  const getRandomStrategy = useCallback(() => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * focusStrategies.length);
    } while (focusStrategies[randomIndex] === currentStrategy && focusStrategies.length > 1);
    
    // Use layout animation for smooth text change
    configureNextAnimation();
    setCurrentStrategy(focusStrategies[randomIndex]);
  }, [currentStrategy, configureNextAnimation]);

  // Initialize with a random strategy
  useEffect(() => {
    getRandomStrategy();
  }, []);

  // Updated timer completion handler with debug logging
  async function handleTimerComplete(completedTask, isInForeground) {
    logTimerAction('TIMER_COMPLETE', completedTask.id, {
      isInForeground,
      completedTask: {
        id: completedTask.id,
        text: completedTask.text,
        timerState: completedTask.timerState
      },
      calledFrom: new Error().stack.split('\n').slice(1, 3).join('\n')
    });

    // Check all pending notifications in the system
    try {
      const pendingNotifications = await Notifications.getAllScheduledNotificationsAsync();
      logTimerAction('PENDING_NOTIFICATIONS', completedTask.id, {
        count: pendingNotifications.length,
        notifications: pendingNotifications.map(n => ({
          identifier: n.identifier,
          title: n.content.title,
          taskId: n.content.data?.taskId,
          triggerType: n.trigger?.type,
          triggerValue: n.trigger?.seconds || (n.trigger?.date ? new Date(n.trigger.date).toISOString() : null)
        }))
      });
    } catch (e) {
      logTimerAction('PENDING_NOTIFICATIONS_ERROR', completedTask.id, { error: e.message });
    }

    // Prevent duplicate notifications
    if (await wasNotificationRecentlySent(completedTask.id)) {
      logTimerAction('DUPLICATE_PREVENTED', completedTask.id, {
        nextStep: 'Calling parent handler without scheduling notification'
      });
      
      if (onTimerComplete) {
        logTimerAction('CALLING_PARENT_HANDLER', completedTask.id);
        onTimerComplete(completedTask, isInForeground);
      }
      return;
    }

    // Mark this notification to prevent duplicates
    await markNotificationAsSent(completedTask.id);
    logTimerAction('TIMER_COMPLETE_MARKED', completedTask.id);

    // Now call the parent handler without scheduling our own notification
    if (onTimerComplete) {
      logTimerAction('CALLING_PARENT_HANDLER', completedTask.id, {
        handler: onTimerComplete.toString().substring(0, 100) + '...' // Log part of the handler function
      });
      onTimerComplete(completedTask, isInForeground);
    } else {
      logTimerAction('NO_PARENT_HANDLER', completedTask.id);
    }
  }

  const formatTime = (seconds) => {
    if (isCompleted || task?.timerState?.isCompleted) {
      return "0:00"; // Show 0:00 for completed timers
    }
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const completedTimerStyle = (isCompleted || task?.timerState?.isCompleted) ? {
    opacity: 0.8,
    borderColor: getPriorityColor(task?.priority)
  } : {};

  // Calculate chevron rotation for animation
  const chevronRotationDegree = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Calculate the translation for slide animation
  const translateY = tipsHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0]
  });

  return (
    <Animated.View 
      style={[
        styles.timerOuterContainer,
        { opacity: deleteAnimation }
      ]}
    >
      <View style={styles.priorityLabel}>
        <FontAwesome name="star" size={10} color="#1a1a1a" />
        <Text style={styles.priorityText}>FOCUS!</Text>
      </View>
      
      {/* Main Timer Container */}
      <View style={[styles.timerContainer, completedTimerStyle]}>
        <ParticleAnimation count={15} />
        
        <View style={styles.timerContent}>
          <View style={[styles.colorIndicator, { backgroundColor: getPriorityColor(task?.priority) }]} />
          
          <View style={styles.textContainer}>
            <Text style={styles.taskText} numberOfLines={1} ellipsizeMode="tail">
              {task.text}
            </Text>
            <View style={styles.timerRow}>
              <FontAwesome name="clock-o" size={16} color="#1A1A1A" style={styles.clockIcon} />
              <Text style={styles.timerText}>
                {formatTime(timeRemaining)}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.chevronButton} 
            onPress={toggleTips}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ rotate: chevronRotationDegree }] }}>
              <FontAwesome 
                name="chevron-down" 
                size={16} 
                color="#1A1A1A" 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tips Container with improved animations */}
      {showTips && (
        <Animated.View 
          style={[
            styles.tipsContainer,
            {
              opacity: tipsOpacity,
              transform: [{ translateY }]
            }
          ]}
          onLayout={(event) => {
            // Store the height of the tips container for animations
            if (tipsContainerHeight.current === null) {
              tipsContainerHeight.current = event.nativeEvent.layout.height;
              maxTipsHeight.setValue(tipsContainerHeight.current);
            }
          }}
        >
          <View style={styles.tipsHeader}>
            <Text style={styles.tipsTitle}>Tips For Getting Started</Text>
            <TouchableOpacity 
              style={styles.diceButton}
              onPress={getRandomStrategy}
              activeOpacity={0.7}
            >
              <FontAwesome name="random" size={16} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.tipText}>Break your task into smaller steps</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.tipText}>Remove distractions from your environment</Text>
            </View>
          </View>

          <View style={styles.strategyContainer}>
            <Text style={styles.strategyTitle}>Try this strategy:</Text>
            <Text style={styles.strategyText}>{currentStrategy}</Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const particleStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
});

const styles = StyleSheet.create({
  timerOuterContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    position: 'relative',
  },
  priorityLabel: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#FF6347',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  priorityText: {
    color: '#1a1a1a',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  timerContainer: {
    backgroundColor: 'rgba(247, 232, 211, 1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6347',
    shadowColor: "#FF6347",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
    height: 64,
    zIndex: 1,
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    zIndex: 2,
  },
  colorIndicator: {
    width: 4,
    height: '100%',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  taskText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginRight: 6,
    opacity: 0.8,
  },
  timerText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums']
  },
  // Delete button styling
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  // Chevron button styling
  chevronButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  // Tips container - Now with improved animations
  tipsContainer: {
    backgroundColor: 'rgba(247, 232, 211, 0.95)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FF6347',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    marginTop: -7,
    shadowColor: "#FF6347",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 0,
    overflow: 'hidden',
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  diceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.1)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  tipsList: {
    marginBottom: 14,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A1A1A',
    marginRight: 8,
    marginTop: 6,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#1A1A1A',
    flex: 1,
  },
  strategyContainer: {
    backgroundColor: 'rgba(26, 26, 26, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  strategyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  strategyText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#1A1A1A',
    fontStyle: 'italic',
  }
});

export default ActiveTimer;