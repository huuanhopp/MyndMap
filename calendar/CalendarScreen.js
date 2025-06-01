import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  ImageBackground, 
  SafeAreaView, 
  Platform,
  Animated,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
// Import from centralized Firebase with modular API
import { 
  firestore,
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from '../firebase/init';
import { useUser } from '../hooks/userHook';
import { useTranslation } from 'react-i18next';

// Component imports
import CalendarHeader from 'react-native-calendars/src/calendar/header';
import CollapsibleCalendar from './CollapsibleCalendar';
import EnergyFilters from './EnergyFilters';
import CalendarTaskList from './CalendarTaskList';
import TaskModal from '../components/TaskModal';
import CalendarHelpModal from './CalendarHelpModal';
import AddTaskButton from './AddTaskButton';

// Utility imports
import { 
  safeParseDate, 
  formatToYYYYMMDD, 
  isConsecutiveDay, 
  getEnergyColor, 
  createCalendarMarkers,
  calculateStreak,
  filterTasksByDate
} from './CalendarUtils.js';

// Asset imports
import splashImage from '../assets/splash.png';

// Styles
import styles from '../styles/CalendarScreenStyles';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const { t } = useTranslation();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const calendarHeightAnim = useRef(new Animated.Value(1)).current;
  const taskListHeightAnim = useRef(new Animated.Value(0.5)).current;
  
  // State variables
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState({});
  const [allTasks, setAllTasks] = useState([]);
  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [taskFilter, setTaskFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false);
  
  // Animation for entry
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // We've moved these utility functions to calendarUtils.js

  // Toggle calendar collapse
  const toggleCalendarCollapse = useCallback(() => {
    const isCollapsing = !isCalendarCollapsed;
    
    Animated.parallel([
      Animated.timing(calendarHeightAnim, {
        toValue: isCollapsing ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(taskListHeightAnim, {
        toValue: isCollapsing ? 1 : 0.5,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
    
    setIsCalendarCollapsed(isCollapsing);
  }, [isCalendarCollapsed, calendarHeightAnim, taskListHeightAnim]);

  // Fetch tasks from Firestore
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Use a compound query with modular API
      const q = query(
        collection(firestore, "reminders"),
        where("userId", "==", user.uid),
        orderBy("scheduledFor", "asc")
      );

      const querySnapshot = await getDocs(q);
      const fetchedTasks = [];

      querySnapshot.forEach((doc) => {
        const taskData = doc.data();
        
        // Create a safe task object with default values
        const task = {
          id: doc.id,
          ...taskData,
          energyLevel: taskData.energyLevel || 'medium',
          mood: taskData.mood || 'neutral',
          priority: taskData.priority || 'medium',
          timeBlock: taskData.timeBlock || '15min'
        };
        
        // Only add tasks with valid scheduled dates
        const scheduledDate = safeParseDate(task.scheduledFor);
        if (scheduledDate) {
          fetchedTasks.push(task);
        }
      });

      // Process data using utility functions
      const markers = createCalendarMarkers(fetchedTasks);
      const currentStreak = calculateStreak(fetchedTasks);
      
      setStreak(currentStreak);
      setAllTasks(fetchedTasks);
      setMarkedDates(markers);
      
      // Set today as selected if no date is selected
      if (!selected) {
        const today = formatToYYYYMMDD(new Date());
        setSelected(today);
        updateDisplayedTasks(fetchedTasks, today);
      } else {
        updateDisplayedTasks(fetchedTasks, selected);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Alert.alert(t('common.error'), t('calendarScreen.error.fetchFailed'));
      setIsLoading(false);
    }
  }, [user, selected, t, updateDisplayedTasks]);

  // Focus effect to refresh data
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      return () => {}; // Cleanup if needed
    }, [fetchTasks])
  );

  // Update displayed tasks
  const updateDisplayedTasks = useCallback((tasks, selectedDate) => {
    if (!selectedDate) return;
    
    // Use utility function to filter and sort tasks
    const filteredTasks = filterTasksByDate(tasks, selectedDate, taskFilter);
    setDisplayedTasks(filteredTasks);
  }, [taskFilter]);

  // Handle day press in calendar
  const handleDayPress = useCallback((day) => {
    try {
      const selectedDate = day.dateString;
      
      // Compare with today's date to add visual indicator for past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateObj = new Date(selectedDate);
      const isPastDate = selectedDateObj < today;
      
      if (isPastDate) {
        console.log("Selected a past date");
        // We could add visual feedback here if desired
      }
      
      setSelected(selectedDate);
      updateDisplayedTasks(allTasks, selectedDate);
    } catch (error) {
      console.error("Error in handleDayPress:", error);
    }
  }, [allTasks, updateDisplayedTasks]);

  // Handle edit task
  const handleEditTask = useCallback((task) => {
    setSelectedTask(task);
    setModalVisible(true);
  }, []);

  // Handle task saved
  const handleTaskSaved = useCallback((savedTask) => {
    setModalVisible(false);
    fetchTasks();
  }, [fetchTasks]);

  // All utility functions have been moved to calendarUtils.js

  // Handle add task button
  const handleAddTask = useCallback(() => {
    navigation.navigate('Home', { 
      screen: 'HomeScreen', 
      params: { 
        openAddTask: true,
        preselectedDate: selected
      }
    });
  }, [navigation, selected]);

  // Calculate calendar height based on collapse state
  const calendarHeight = calendarHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isCalendarCollapsed ? 0 : 80, 350]
  });

  // Calculate task list flex based on collapse state
  const taskListFlex = taskListHeightAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.5, 0.95]
  });

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground source={splashImage} style={styles.container}>
          <View style={styles.overlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F7e8d3" />
              <Text style={styles.loadingText}>{t('calendarScreen.loading')}</Text>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={splashImage} style={styles.container}>
        <View style={styles.overlay}>
          {/* Header Section */}
          <CalendarHeader 
            fadeAnim={fadeAnim}
            onBackPress={() => navigation.goBack()}
            onHelpPress={() => setShowHelpModal(true)}
            title={t('calendarScreen.title')}
          />

          {/* Calendar Section */}
          <CollapsibleCalendar
            calendarHeight={calendarHeight}
            markedDates={markedDates}
            selected={selected}
            onDayPress={handleDayPress}
          />

          {/* Filters Section */}
          <EnergyFilters
            taskFilter={taskFilter}
            setTaskFilter={(filter) => {
              setTaskFilter(filter);
              updateDisplayedTasks(allTasks, selected);
            }}
            isCalendarCollapsed={isCalendarCollapsed}
            toggleCalendarCollapse={toggleCalendarCollapse}
            t={t}
          />

          {/* Tasks Section */}
          <Animated.View style={[styles.tasksContainer, { flex: taskListFlex }]}>
            <View style={styles.tasksHeader}>
              <Text style={styles.tasksTitle}>
                {displayedTasks.length > 0 
                  ? t('calendarScreen.currentTasks') 
                  : t('calendarScreen.noTasksForDate')}
              </Text>
              <View style={styles.streakContainer}>
                <Text style={styles.streakText}>{streak} {t('calendarScreen.dayStreak')}</Text>
              </View>
            </View>

            <CalendarTaskList
              tasks={displayedTasks}
              onEditTask={handleEditTask}
              isLoading={isLoading}
              selected={selected}
              navigation={navigation}
              fadeAnim={fadeAnim}
              t={t}
            />
          </Animated.View>

          {/* Add Task Button */}
          <AddTaskButton onPress={handleAddTask} />

          {/* Task Modal */}
          <TaskModal
            task={selectedTask}
            showTaskModal={isModalVisible}
            closeTaskModal={() => setModalVisible(false)}
            onSave={handleTaskSaved}
          />

          {/* Help Modal */}
          <CalendarHelpModal
            visible={showHelpModal}
            onClose={() => setShowHelpModal(false)}
            t={t}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default CalendarScreen;