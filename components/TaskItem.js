import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';

const TaskItem = ({
  task,
  isHighestPriority,
  onComplete,
  onDelete,
  onEdit,
  showFutureTasks,
  fadeAnim,
  onAddSubtask,
  isDeleting,
  onPress,
}) => {
  const { t } = useTranslation();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const hasSubtasks = task?.subtasks?.length > 0;

  // Get the color based on task priority
  const getPriorityColor = () => {
    const flagColors = {
      Urgent: "#FF1744",
      High: "#FF9100",
      Medium: "#00C853", 
      Lowest: "#00B0FF",
    };
    return flagColors[task?.priority] || "#00B0FF";
  };

  // Initialize animations for task interactions
  const animations = useMemo(() => ({
    fadeTaskCompletion: new Animated.Value(1),
    fadeIn: new Animated.Value(task?.animateIn ? 0 : 1),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(1),
  }), []);

  // Handle initial fade-in animation for new tasks
  useEffect(() => {
    if (task?.animateIn) {
      Animated.timing(animations.fadeIn, {
        toValue: 1,
        duration: 500, 
        useNativeDriver: true,
      }).start();
    }
  }, []);

  // Handle deletion animation
  useEffect(() => {
    if (isDeleting) {
      Animated.parallel([
        Animated.timing(animations.opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animations.scale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isDeleting]);

  // Handle subtask visibility toggling and addition
  const handleSubtasksPress = () => {
    if (hasSubtasks) {
      setShowSubtasks(!showSubtasks);
    } else {
      onAddSubtask(task);
    }
  };

  // Handle task press (for starting timer)
  const handleTaskPress = () => {
    if (onPress) {
      onPress(task);
    }
  };

  // Render the timer interval indicator
  const getReminderIntervalIcon = () => {
    const interval = task?.intervals?.[0] || task?.interval;
    if (!interval) return null;
  
    return (
      <View style={[
        styles.reminderIntervalContainer,
        isHighestPriority ? styles.iconContainerHighPriority : styles.iconContainerRegular
      ]}>
        <FontAwesome 
          name="clock-o" 
          size={16} 
          color={isHighestPriority ? "#1a1a1a" : "#f7e8d3"} 
        />
        <Text style={[
          styles.reminderIntervalText,
          isHighestPriority ? styles.highestPriorityText : styles.regularText
        ]}>
          {interval}m
        </Text>
      </View>
    );
  };

  // Render the priority flag indicator
  const getPriorityFlagIcon = () => {
    return (
      <View style={[
        styles.priorityFlagContainer,
        isHighestPriority ? styles.priorityFlagHighPriority : styles.priorityFlagRegular
      ]}>
        <FontAwesome 
          name="flag" 
          size={14}
          color={getPriorityColor()} 
        />
      </View>
    );
  };

  if (!task) return null;
  
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={handleTaskPress}
      disabled={isDeleting}
    >
      <Animated.View style={[
        styles.taskItemWrapper,
        {
          opacity: animations.opacity,
          transform: [{ scale: animations.scale }]
        }
      ]}>
        <View style={[
          styles.taskItem,
          isHighestPriority ? 
            [styles.highestPriorityTask, { borderLeftColor: getPriorityColor() }] : 
            styles.regularTask,
        ]}>
          <View style={styles.taskDetails}>
            <View style={styles.mainContentContainer}>
              <View style={styles.taskTextContainer}>
                <Text style={[
                  styles.taskItemText,
                  isHighestPriority ? styles.highestPriorityText : styles.regularText,
                ]}>
                  {task.text}
                </Text>
                
                {/* Show reschedule count if any */}
                {task.rescheduleCount > 0 && (
                  <View style={styles.rescheduleContainer}>
                    <FontAwesome name="history" size={12} color={isHighestPriority ? "#1a1a1a" : "#f7e8d3"} />
                    <Text style={[
                      styles.rescheduleText,
                      isHighestPriority ? styles.highestPriorityText : styles.regularText
                    ]}>
                      {t('taskItem.rescheduled', { count: task.rescheduleCount })}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.rightContentContainer}>
                {getReminderIntervalIcon()}
                {getPriorityFlagIcon()}
              </View>
            </View>
            
            {showFutureTasks && task.scheduledFor && (
              <Text style={[
                styles.scheduledDateText, 
                isHighestPriority ? styles.highestPriorityText : styles.regularText
              ]}>
                {new Date(task.scheduledFor).toLocaleDateString()}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={[
            styles.actionButtonsContainer,
            isHighestPriority ? styles.actionButtonsContainerHighPriority : styles.actionButtonsContainerRegular
          ]}>
            <TouchableOpacity 
              onPress={() => onComplete?.(task)} 
              style={[
                styles.actionButton,
                styles.completeButton,
                isHighestPriority ? styles.actionButtonHighPriority : styles.actionButtonRegular
              ]}
              activeOpacity={0.7}
            >
              <FontAwesome
                name="check-square-o"
                size={16}
                color={isHighestPriority ? "#1a1a1a" : "#f7e8d3"}
              />
              <Text style={[
                styles.actionButtonText,
                isHighestPriority ? styles.highestPriorityText : styles.regularText
              ]}>
                Complete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSubtasksPress}
              style={[
                styles.actionButton,
                styles.subtaskButton,
                isHighestPriority ? styles.actionButtonHighPriority : styles.actionButtonRegular
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.subtaskButtonContent}>
                <FontAwesome
                  name={hasSubtasks ? (showSubtasks ? "chevron-up" : "chevron-down") : "list"}
                  size={16}
                  color={isHighestPriority ? "#1a1a1a" : "#f7e8d3"}
                />
                <Text style={[
                  styles.actionButtonText,
                  isHighestPriority ? styles.highestPriorityText : styles.regularText
                ]}>
                  {hasSubtasks ? `${task.subtasks.length} Step${task.subtasks.length === 1 ? '' : 's'}` : 'Add Steps'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => onDelete?.(task)} 
              style={[
                styles.actionButton,
                styles.deleteButton,
                isHighestPriority ? styles.actionButtonHighPriority : styles.actionButtonRegular
              ]}
              activeOpacity={0.7}
            >
              <FontAwesome
                name="trash"
                size={16}
                color={isHighestPriority ? "#1a1a1a" : "#f7e8d3"}
              />
              <Text style={[
                styles.actionButtonText,
                isHighestPriority ? styles.highestPriorityText : styles.regularText
              ]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>

          {/* Subtasks Section */}
          {hasSubtasks && showSubtasks && (
            <View style={[
              styles.subtasksContainer,
              isHighestPriority ? styles.subtasksContainerHighPriority : styles.subtasksContainerRegular
            ]}>
              <View style={[
                styles.subtasksDivider,
                isHighestPriority ? styles.subtasksDividerHighPriority : styles.subtasksDividerRegular
              ]} />
              {task.subtasks.map((subtask, index) => (
                <View key={subtask.id} style={[
                  styles.subtaskItem,
                  isHighestPriority ? styles.subtaskItemHighPriority : styles.subtaskItemRegular
                ]}>
                  <View style={styles.subtaskHeader}>
                    <Text style={[
                      styles.subtaskNumber,
                      isHighestPriority ? styles.highestPriorityText : styles.regularText
                    ]}>
                      {index + 1}
                    </Text>
                    <Text style={[
                      styles.subtaskText,
                      isHighestPriority ? styles.highestPriorityText : styles.regularText
                    ]}>
                      {subtask.text}
                    </Text>
                  </View>
                  
                  {subtask.microtasks?.length > 0 && (
                    <View style={styles.microtasksList}>
                      {subtask.microtasks.map(microtask => (
                        <View key={microtask.id} style={styles.microtaskItem}>
                          <View style={[
                            styles.microtaskDot,
                            isHighestPriority ? styles.microtaskDotHighPriority : styles.microtaskDotRegular
                          ]} />
                          <Text style={[
                            styles.microtaskText,
                            isHighestPriority ? styles.highestPriorityText : styles.regularText
                          ]}>
                            {microtask.text}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              <TouchableOpacity 
                onPress={() => onAddSubtask(task)}
                style={[
                  styles.editSubtasksButton,
                  isHighestPriority ? styles.editButtonHighPriority : styles.editButtonRegular
                ]}
              >
                <FontAwesome 
                  name="pencil" 
                  size={14} 
                  color={isHighestPriority ? "#1a1a1a" : "#f7e8d3"} 
                />
                <Text style={[
                  styles.editSubtasksText,
                  isHighestPriority ? styles.highestPriorityText : styles.regularText
                ]}>
                  Edit Steps
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskItemWrapper: {
    marginVertical: 6,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  taskItem: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    position: 'relative',
  },
  highestPriorityTask: {
    backgroundColor: '#F7E8D3', // Cream background color for highest priority
    borderLeftWidth: 4,
    // borderLeftColor set dynamically
  },
  regularTask: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
  },
  taskDetails: {
    padding: 12,
  },
  mainContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  taskItemText: {
    fontSize: 16,
    color: '#F7E8D3',
    fontWeight: '500',
  },
  highestPriorityText: {
    color: '#1a1a1a', // Black text for highest priority task (on cream background)
  },
  regularText: {
    color: '#F7E8D3', // Light text for regular tasks (on dark background)
  },
  rescheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rescheduleText: {
    fontSize: 12,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  rightContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIntervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  iconContainerHighPriority: {
    backgroundColor: 'rgba(26, 26, 26, 0.1)', // Subtle dark background on cream
  },
  iconContainerRegular: {
    backgroundColor: 'rgba(247, 232, 211, 0.1)', // Subtle light background on dark
  },
  reminderIntervalText: {
    marginLeft: 4,
    fontSize: 14,
  },
  priorityFlagContainer: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 4,
  },
  priorityFlagHighPriority: {
    backgroundColor: 'rgba(26, 26, 26, 0.1)', // Subtle dark background on cream
  },
  priorityFlagRegular: {
    backgroundColor: 'rgba(247, 232, 211, 0.1)', // Subtle light background on dark
  },
  scheduledDateText: {
    fontSize: 12,
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
  },
  actionButtonsContainerHighPriority: {
    borderTopColor: 'rgba(26, 26, 26, 0.1)', // Dark divider on cream background
  },
  actionButtonsContainerRegular: {
    borderTopColor: 'rgba(247, 232, 211, 0.1)', // Light divider on dark background
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  actionButtonHighPriority: {
    backgroundColor: 'rgba(26, 26, 26, 0.1)', // Subtle dark background for buttons on cream
  },
  actionButtonRegular: {
    backgroundColor: 'rgba(247, 232, 211, 0.1)', // Subtle light background for buttons on dark
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
  },
  completeButton: {
    // Base style that applies to both variants
  },
  subtaskButton: {
    // Base style that applies to both variants
  },
  deleteButton: {
    // Base style that applies to both variants
  },
  subtaskButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtasksContainer: {
    padding: 12,
  },
  subtasksContainerHighPriority: {
    backgroundColor: 'rgba(26, 26, 26, 0.05)', // Very subtle dark background on cream
  },
  subtasksContainerRegular: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Subtle dark overlay on dark background
  },
  subtasksDivider: {
    height: 1,
    marginBottom: 12,
  },
  subtasksDividerHighPriority: {
    backgroundColor: 'rgba(26, 26, 26, 0.1)', // Dark divider on cream
  },
  subtasksDividerRegular: {
    backgroundColor: 'rgba(247, 232, 211, 0.1)', // Light divider on dark
  },
  subtaskItem: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },
  subtaskItemHighPriority: {
    backgroundColor: 'rgba(26, 26, 26, 0.1)', // Subtle dark background on cream
  },
  subtaskItemRegular: {
    backgroundColor: 'rgba(247, 232, 211, 0.1)', // Subtle light background on dark
  },
  subtaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtaskNumber: {
    width: 24,
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
  },
  microtasksList: {
    marginLeft: 24,
    marginTop: 8,
  },
  microtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  microtaskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  microtaskDotHighPriority: {
    backgroundColor: '#1a1a1a',
  },
  microtaskDotRegular: {
    backgroundColor: '#F7E8D3',
  },
  microtaskText: {
    fontSize: 12,
  },
  editSubtasksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginTop: 8,
    borderRadius: 8,
  },
  editButtonHighPriority: {
    backgroundColor: 'rgba(26, 26, 26, 0.1)', // Subtle dark background on cream
  },
  editButtonRegular: {
    backgroundColor: 'rgba(247, 232, 211, 0.1)', // Subtle light background on dark
  },
  editSubtasksText: {
    marginLeft: 6,
    fontSize: 14,
  }
});

// Optimize re-renders using React.memo
export default React.memo(TaskItem, (prevProps, nextProps) => {
  // First check essential properties to force updates
  if (prevProps.task?.priority !== nextProps.task?.priority ||
      prevProps.task?.text !== nextProps.task?.text ||
      prevProps.task?.interval !== nextProps.task?.interval ||
      prevProps.task?.intervals?.[0] !== nextProps.task?.intervals?.[0] || // Check first interval too
      prevProps.isHighestPriority !== nextProps.isHighestPriority) {
    return false; // Force re-render when these key properties change
  }
  
  // Then check additional properties
  return (
    prevProps.task?.id === nextProps.task?.id &&
    prevProps.showFutureTasks === nextProps.showFutureTasks &&
    prevProps.isDeleting === nextProps.isDeleting &&
    prevProps.task?.rescheduleCount === nextProps.task?.rescheduleCount &&
    prevProps.task?.subtasks?.length === nextProps.task?.subtasks?.length &&
    JSON.stringify(prevProps.task?.subtasks) === JSON.stringify(nextProps.task?.subtasks)
  );
});