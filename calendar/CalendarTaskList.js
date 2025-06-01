import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Animated, Platform, ActivityIndicator } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import styles from '../styles/CalendarScreenStyles.js';
import { getEnergyColor, getPriorityColor, getMoodIcon, getTimeBlockColor } from './CalendarUtils.js';

const CalendarTaskList = ({ 
  tasks, 
  onEditTask, 
  isLoading, 
  selected, 
  navigation, 
  fadeAnim, 
  t 
}) => {
  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#FF0000',
      high: '#FF6B6B',
      medium: '#4ECDC4',
      low: '#95A5A6'
    };
    return colors[priority] || colors.medium;
  };

  // Get mood icon
  const getMoodIcon = (mood) => {
    const icons = {
      great: 'smile-o',
      good: 'smile-o',
      neutral: 'meh-o',
      difficult: 'frown-o',
      overwhelming: 'frown-o'
    };
    return icons[mood] || 'meh-o';
  };

  // Get time block color
  const getTimeBlockColor = (timeBlock) => {
    const colors = {
      '15min': '#4CAF50',
      '30min': '#2196F3',
      '1hour': '#9C27B0'
    };
    return colors[timeBlock] || '#757575';
  };

  // Add this inside your component file as a fallback
    const getEnergyColor = (level) => {
    const colors = {
      high: '#FF6B6B',
      medium: '#4ECDC4',
      low: '#95A5A6'
    };
    return colors[level] || colors.medium;
  };

  // Render task item
  const renderTaskItem = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity 
        style={[styles.taskItem, { borderLeftColor: getEnergyColor(item.energyLevel) }]}
        onPress={() => onEditTask(item)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            <View style={[styles.energyIndicator, { backgroundColor: getEnergyColor(item.energyLevel) }]} />
            <Text style={styles.taskText} numberOfLines={2}>{item.text}</Text>
          </View>
          <View style={styles.taskBadges}>
            <View style={[styles.timeBlock, { backgroundColor: getTimeBlockColor(item.timeBlock) }]}>
              <Text style={styles.timeBlockText}>{item.timeBlock}</Text>
            </View>
            <FontAwesome name={getMoodIcon(item.mood)} size={16} color="#F7e8d3" />
          </View>
        </View>
        
        <View style={styles.taskFooter}>
          <Text style={styles.energyLevelText}>
            {t(`calendarScreen.energyLevels.${item.energyLevel || 'medium'}`)}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>
              {t(`calendarScreen.priority.${item.priority || 'medium'}`)}
            </Text>
          </View>
        </View>
        
        {item.subtasks && item.subtasks.length > 0 && (
          <View style={styles.subtasksIndicator}>
            <FontAwesome name="tasks" size={12} color="#F7e8d3" />
            <Text style={styles.subtasksText}>
              {item.subtasks.length} {t('calendarScreen.subtasks')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  // Render empty component
  const renderEmptyComponent = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#F7e8d3" />
      ) : (
        <>
          <FontAwesome name="calendar-check-o" size={40} color="#F7e8d3" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>{t('calendarScreen.noTasks')}</Text>
          <TouchableOpacity 
            style={styles.emptyAddButton}
            onPress={() => {
              navigation.navigate('Home', { 
                screen: 'HomeScreen', 
                params: { 
                  openAddTask: true,
                  preselectedDate: selected
                }
              });
            }}
          >
            <Text style={styles.emptyAddButtonText}>{t('calendarScreen.addTask')}</Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderTaskItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmptyComponent}
      contentContainerStyle={[
        styles.taskListContent,
        tasks.length === 0 && styles.emptyListContent
      ]}
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      maxToRenderPerBatch={12}
      windowSize={10}
      removeClippedSubviews={Platform.OS === 'android'}
      ListFooterComponent={<View style={{ height: 80 }} />}
    />
  );
};

export default CalendarTaskList;