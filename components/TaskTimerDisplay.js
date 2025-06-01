import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../screens/firebaseConfig';

const TaskTimerDisplay = ({ currentTask, onTimerComplete }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const completedRef = useRef(false);
  const isMountedRef = useRef(true);

useEffect(() => {
  const handleTimer = async () => {
    if (currentTask?.timerState?.isActive) {
      try {
        // Schedule notification through your system
        await NotificationSystem.scheduleTaskNotification({
          ...currentTask,
          intervals: [currentTask.timerState.duration]
        });
      } catch (error) {
        console.error('Error scheduling notification:', error);
      }
    }
  };

  handleTimer();

  return () => {
    if (currentTask?.timerState?.notificationId) {
      NotificationSystem.cancelNotification(currentTask.timerState.notificationId);
    }
  };
}, [currentTask?.timerState?.isActive]);

  useEffect(() => {
    console.log('Timer Effect - Current Task:', {
      taskId: currentTask?.id,
      timerState: currentTask?.timerState,
      isActive: currentTask?.timerState?.isActive,
      startTime: currentTask?.timerState?.startTime,
      duration: currentTask?.timerState?.duration
    });

    completedRef.current = false;
    setTimeLeft(null);

    if (currentTask?.timerState?.isActive && 
        currentTask?.timerState?.startTime && 
        currentTask?.timerState?.duration) {
      
      const updateTimer = async () => {
        if (!isMountedRef.current || completedRef.current) return;
        
        const startTime = new Date(currentTask.timerState.startTime).getTime();
        const duration = currentTask.timerState.duration * 60 * 1000;
        const endTime = startTime + duration;
        const now = new Date().getTime();
        const remaining = endTime - now;

        console.log('Timer Update:', {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          remaining: Math.floor(remaining / 1000),
          isCompleted: completedRef.current
        });

        if (remaining <= 0 && !completedRef.current) {
          console.log('Timer Complete:', currentTask.id);
          clearInterval(intervalId);
          setTimeLeft(null);
          completedRef.current = true;
          
          try {
            if (isMountedRef.current) {
              await updateDoc(doc(db, "reminders", currentTask.id), {
                'timerState.isActive': false,
                'timerState.notificationStatus': 'completed',
                'timerState.completedAt': new Date().toISOString()
              });

              if (onTimerComplete) {
                onTimerComplete(currentTask);
              }
            }
          } catch (error) {
            console.error('Error handling timer completion:', error);
          }
          return;
        }

        if (remaining > 0 && isMountedRef.current) {
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setTimeLeft({ minutes, seconds });
        }
      };

      const id = setInterval(updateTimer, 1000);
      setIntervalId(id);
      updateTimer();

      return () => {
        isMountedRef.current = false;
        console.log('Cleaning up timer:', currentTask.id);
        if (id) {
          clearInterval(id);
          setIntervalId(null);
        }
      };
    }
  }, [currentTask?.id]);

useEffect(() => {
  const scheduleNotification = async (task) => {
    const trigger = task.timerState.duration * 60; // Convert minutes to seconds
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: task.text,
        data: { task },
        sound: true,
      },
      trigger: { seconds: trigger },
    });
  };

  const cancelNotification = async (taskId) => {
    await Notifications.cancelScheduledNotificationAsync(taskId);
  };

  if (currentTask?.timerState?.isActive) {
    scheduleNotification(currentTask);
  }

  return () => {
    if (currentTask?.id) {
      cancelNotification(currentTask.id);
    }
  };
}, [currentTask?.timerState?.isActive]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (!currentTask?.timerState?.isActive || !timeLeft || completedRef.current) {
    console.log('Timer not showing because:', {
      task: currentTask?.id,
      hasTimeLeft: !!timeLeft,
      isActive: currentTask?.timerState?.isActive,
      isCompleted: completedRef.current
    });
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.timerCard}>
        <View style={styles.iconContainer}>
          <FontAwesome name="clock-o" size={20} color="#f7e8d3" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.timeText}>
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </Text>
          <Text style={styles.labelText} numberOfLines={1} ellipsizeMode="tail">
            {currentTask.text}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  timerCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6347',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f7e8d3',
    marginBottom: 4,
  },
  labelText: {
    fontSize: 12,
    color: '#f7e8d3',
    opacity: 0.8,
  }
});

export default TaskTimerDisplay;