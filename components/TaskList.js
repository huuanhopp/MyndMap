import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TaskItem from './TaskItem';
import OptimizedFlatList from './OptimizedFlatList';
import { takeMemorySnapshot } from '../utility/performanceMonitoring';
import { getCachedData, cacheData } from '../utility/dataOptimization';

/**
 * Enhanced TaskList component with improved performance, optimized rendering,
 * and proper task sorting for ADHD users
 * Uses OptimizedFlatList for memory-efficient rendering
 */
const TaskList = ({
  tasks,
  showFutureTasks = false,
  onComplete,
  onDelete,
  onEdit,
  onAddSubtask,
  fadeAnims = {},
  deletingTaskId,
  onTaskPress,
  activeTimerTaskId,
  highestPriorityTaskId
}) => {
  // IMPORTANT: Always maintain the same hook order
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [cachedTasks, setCachedTasks] = useState([]);
  const listRef = useRef(null);
  
  // Capture performance metrics in development
  useEffect(() => {
    if (__DEV__) {
      takeMemorySnapshot('TaskList_Mount');
      
      return () => {
        takeMemorySnapshot('TaskList_Unmount');
      };
    }
  }, []);
  
  // Extract unique key for each task item for optimized rendering
  const keyExtractor = useCallback((item) => {
    return item.id || `task-${Math.random()}`;
  }, []);
  
  // Calculate estimated height for FlatList optimization
  const TASK_ITEM_HEIGHT = 120; // Estimated height including margins
  
  const getItemLayout = useCallback((_, index) => ({
    length: TASK_ITEM_HEIGHT,
    offset: TASK_ITEM_HEIGHT * index,
    index,
  }), []);
  
  // Loading state component
  const renderLoadingState = useCallback(() => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF6347" />
      <Text style={styles.loadingText}>{t('generalSettings.loading', 'Loading your tasks...')}</Text>
    </View>
  ), [t]);
  
  // Empty list component with appropriate message
  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.noRemindersText}>
        {showFutureTasks
          ? t('home.noFutureTasks', "No scheduled tasks for future dates")
          : t('home.noCurrentTasks', "No active tasks")}
      </Text>
    </View>
  ), [showFutureTasks, t]);
  
  // Load cached tasks on initial render to prevent empty screen
  useEffect(() => {
    let isMounted = true;
    
    async function loadCachedTasks() {
      try {
        // Use optimized data cache with 10-minute expiration
        const { data, cached } = await getCachedData('tasks');
        
        if (isMounted && cached && Array.isArray(data)) {
          setCachedTasks(data);
        } else {
          // Fallback to legacy cache
          const cachedTasksJson = await AsyncStorage.getItem('cachedTasks');
          if (isMounted && cachedTasksJson) {
            const parsedTasks = JSON.parse(cachedTasksJson);
            setCachedTasks(parsedTasks);
          }
        }
      } catch (error) {
        console.error('Error loading cached tasks:', error);
      } finally {
        // Short timeout to ensure smooth transition
        if (isMounted) {
          setTimeout(() => setIsLoading(false), 300);
        }
      }
    }
    
    loadCachedTasks();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Cache tasks whenever they change using optimized caching
  useEffect(() => {
    if (Array.isArray(tasks) && tasks.length > 0) {
      // Use both optimized cache and legacy cache
      cacheData('tasks', tasks, 10); // 10-minute expiration
      
      // Legacy cache for backward compatibility
      AsyncStorage.setItem('cachedTasks', JSON.stringify(tasks))
        .catch(error => console.error('Error caching tasks:', error));
      
      // Clear loading state once we have real tasks
      setIsLoading(false);
    }
  }, [tasks]);
  
  // Initialize animation values for each task for smooth transitions
  const animations = useMemo(() => {
    const newAnimations = {};
    const allTasks = Array.isArray(tasks) && tasks.length > 0 ? tasks : cachedTasks;
    
    if (Array.isArray(allTasks)) {
      allTasks.forEach(task => {
        if (task?.id && !newAnimations[task.id]) {
          // Use existing animation if available, otherwise create new
          newAnimations[task.id] = fadeAnims[task.id] || new Animated.Value(1);
        }
      });
    }
    return newAnimations;
  }, [tasks, cachedTasks, fadeAnims]);
  
  // Memoize and sort the task data for optimal display for ADHD users
  const sortedTaskData = useMemo(() => {
    // Use real tasks if available, otherwise use cached tasks
    const dataSource = Array.isArray(tasks) && tasks.length > 0 ? tasks : cachedTasks;
    
    if (!Array.isArray(dataSource)) return [];
    
    // Filter out any invalid tasks
    const validTasks = dataSource.filter(task => task && task.id);
    
    // Define priority weights for sorting (highest number = highest priority)
    const priorityWeights = {
      Urgent: 40,
      High: 30,
      Medium: 20,
      Lowest: 10
    };
    
    // Create helper function for calculating task score
    const getTaskScore = (task) => {
      let score = 0;
      
      // Priority score (base weight)
      score += priorityWeights[task.priority] || 0;
      
      // Highest priority task gets a massive boost to always be on top
      if (task.id === highestPriorityTaskId) {
        score += 1000; // This ensures it's always at the top
      }
      
      // Active timer gets a significant boost
      if (task.id === activeTimerTaskId) {
        score += 500;
      }
      
      // Shorter intervals get slightly higher priority
      if (task.interval) {
        const interval = parseInt(task.interval, 10);
        if (!isNaN(interval) && interval > 0) {
          // Inverse relationship: shorter intervals → higher score
          // Max score addition of 10 for short intervals
          score += Math.min(10, 100 / interval);
        }
      }
      
      // Older tasks (created earlier) get slight boost 
      // to maintain stability when priorities are equal
      if (task.createdAt) {
        const createdTime = new Date(task.createdAt).getTime();
        if (!isNaN(createdTime)) {
          // Tiny value to ensure stable sort
          score += (1 / (Date.now() - createdTime));
        }
      }
      
      return score;
    };
    
    // Clone and sort tasks by computed priority score (descending)
    return [...validTasks].sort((a, b) => {
      return getTaskScore(b) - getTaskScore(a);
    });
  }, [tasks, cachedTasks, highestPriorityTaskId, activeTimerTaskId]);
  
  // Render individual task items with appropriate properties
  const renderTask = useCallback(({ item }) => {
    if (!item?.id) return null;
    
    const fadeAnim = animations[item.id] || new Animated.Value(1);
    const isHighestPriority = item.id === highestPriorityTaskId;
    const isActiveTimer = item.id === activeTimerTaskId;
    
    return (
      <View style={styles.taskItemContainer}>
        <TaskItem
          task={item}
          isHighestPriority={isHighestPriority}
          isActiveTimer={isActiveTimer}
          onComplete={onComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          showFutureTasks={showFutureTasks}
          fadeAnim={fadeAnim}
          onAddSubtask={onAddSubtask}
          isDeleting={deletingTaskId === item.id}
          onPress={() => onTaskPress?.(item)}
        />
      </View>
    );
  }, [
    animations,
    onComplete,
    onDelete,
    onEdit,
    onAddSubtask,
    showFutureTasks,
    deletingTaskId,
    onTaskPress,
    activeTimerTaskId,
    highestPriorityTaskId
  ]);
  
  // Prepare extra data for FlatList to detect changes
  const extraData = useMemo(() => ({
    deletingTaskId,
    activeTimerTaskId,
    highestPriorityTaskId,
    showFutureTasks,
    // Only include essential task properties for change detection
    tasksSignature: `${sortedTaskData.length}-${deletingTaskId || 'none'}-${activeTimerTaskId || 'none'}-${highestPriorityTaskId || 'none'}`
  }), [
    deletingTaskId, 
    activeTimerTaskId, 
    highestPriorityTaskId, 
    showFutureTasks, 
    sortedTaskData.length
  ]);
  
  // Guard against showing loading state when not needed
  const shouldShowLoadingState = isLoading && (!Array.isArray(cachedTasks) || cachedTasks.length === 0);
  
  // Guards against invalid tasks prop when not loading
  const shouldShowEmptyList = !isLoading && (!Array.isArray(sortedTaskData) || sortedTaskData.length === 0);
  
  // Scroll to top when highest priority task changes
  useEffect(() => {
    if (
      highestPriorityTaskId && 
      listRef.current && 
      sortedTaskData.length > 0 && 
      sortedTaskData[0]?.id === highestPriorityTaskId
    ) {
      // Use timeout to ensure layout is complete
      setTimeout(() => {
        if (listRef.current) {
          OptimizedFlatList.scrollToTop(listRef);
        }
      }, 100);
    }
  }, [highestPriorityTaskId, sortedTaskData]);
  
  // Conditional rendering based on state
  if (shouldShowLoadingState) {
    return renderLoadingState();
  }
  
  return (
    <OptimizedFlatList
      ref={listRef}
      data={sortedTaskData}
      renderItem={renderTask}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      itemHeight={TASK_ITEM_HEIGHT}
      contentContainerStyle={[
        styles.taskList,
        shouldShowEmptyList && styles.emptyListContainer
      ]}
      initialNumToRender={8}
      maxToRenderPerBatch={5}
      windowSize={5}
      updateCellsBatchingPeriod={50}
      ListEmptyComponent={renderEmptyList}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      showsVerticalScrollIndicator={true}
      indicatorStyle="white"
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={32} 
      extraData={extraData}
      
      // Performance optimizations
      progressiveLoading={sortedTaskData.length > 20}
      progressiveLoadingBatchSize={15}
      
      // Add refresh control for manual refresh
      onRefresh={() => {
        // Trigger refresh animation but rely on parent component to reload data
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
      }}
      refreshing={isLoading}
      
      // List footer for loading indicator
      ListFooterComponent={isLoading ? 
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#FF6347" />
          <Text style={styles.loadingMoreText}>{t('general.loading', 'Loading')}...</Text>
        </View> : null
      }
    />
  );
};

const styles = StyleSheet.create({
  taskList: {
    paddingHorizontal: 16,
    paddingBottom: 120, // Add padding at bottom for navigation space
    minHeight: '100%',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  taskItemContainer: {
    marginVertical: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  noRemindersText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#F7E8D3',
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#F7E8D3',
    marginTop: 16,
  },
  loadingMoreContainer: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#F7E8D3',
    opacity: 0.8,
    marginLeft: 8,
  }
});

/**
 * Optimized task comparison function for React.memo
 * Prevents unnecessary re-renders by performing efficient comparisons
 */
const areTasksEqual = (prevProps, nextProps) => {
  // Quick reference equality check
  if (prevProps === nextProps) return true;
  
  // Check if the main control props have changed
  if (
    prevProps.deletingTaskId !== nextProps.deletingTaskId ||
    prevProps.activeTimerTaskId !== nextProps.activeTimerTaskId ||
    prevProps.highestPriorityTaskId !== nextProps.highestPriorityTaskId ||
    prevProps.showFutureTasks !== nextProps.showFutureTasks
  ) {
    return false;
  }
  
  // Check if the tasks arrays are different lengths
  if ((prevProps.tasks?.length || 0) !== (nextProps.tasks?.length || 0)) {
    return false;
  }
  
  // For small arrays, do a deeper check
  if (prevProps.tasks?.length < 20) {
    // Check for deep equality on task IDs only - efficient but catches changes
    const prevIds = new Set((prevProps.tasks || []).map(t => t?.id).filter(Boolean));
    const nextIds = new Set((nextProps.tasks || []).map(t => t?.id).filter(Boolean));
    
    if (prevIds.size !== nextIds.size) return false;
    
    // Check if all IDs in prevIds exist in nextIds
    for (const id of prevIds) {
      if (!nextIds.has(id)) return false;
    }
  }
  
  return true;
};

// Export with optimized React.memo implementation
export default React.memo(TaskList, areTasksEqual);