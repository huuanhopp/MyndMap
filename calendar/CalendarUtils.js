/**
 * Utility functions for the Calendar screen
 */

/**
 * Safely parses a date string or object into a Date
 * @param {string|object} dateInput - Date string or Firebase timestamp
 * @returns {Date|null} Parsed date or null if invalid
 */
export const safeParseDate = (dateInput) => {
    try {
      if (!dateInput) return null;
      
      // Check if it's a timestamp object from Firebase
      if (typeof dateInput === 'object' && dateInput.seconds) {
        return new Date(dateInput.seconds * 1000);
      }
      
      const date = new Date(dateInput);
      // Check if date is valid
      if (isNaN(date.getTime())) return null;
      
      return date;
    } catch (error) {
      console.log("Error parsing date:", dateInput, error);
      return null;
    }
  };
  
  /**
   * Formats a date to YYYY-MM-DD string
   * @param {Date} date - Date object
   * @returns {string|null} Formatted date string or null if invalid
   */
  export const formatToYYYYMMDD = (date) => {
    if (!date) return null;
    
    try {
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.log("Error formatting date:", date, error);
      return null;
    }
  };
  
  /**
   * Checks if two dates are consecutive days
   * @param {string} date1 - First date string
   * @param {string} date2 - Second date string
   * @returns {boolean} True if consecutive days
   */
  export const isConsecutiveDay = (date1, date2) => {
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === 1;
    } catch (error) {
      console.error("Error in isConsecutiveDay:", error);
      return false;
    }
  };
  
  /**
   * Gets color for energy level
   * @param {string} level - Energy level (high, medium, low)
   * @returns {string} Color hex code
   */
  export const getEnergyColor = (level) => {
    const colors = {
      high: '#FF6B6B',
      medium: '#4ECDC4',
      low: '#95A5A6'
    };
    return colors[level] || colors.medium;
  };
  
  /**
   * Gets color for priority level
   * @param {string} priority - Priority level (urgent, high, medium, low)
   * @returns {string} Color hex code
   */
  export const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#FF0000',
      high: '#FF6B6B',
      medium: '#4ECDC4',
      low: '#95A5A6'
    };
    return colors[priority] || colors.medium;
  };
  
  /**
   * Gets icon name for mood
   * @param {string} mood - Mood (great, good, neutral, difficult, overwhelming)
   * @returns {string} FontAwesome icon name
   */
  export const getMoodIcon = (mood) => {
    const icons = {
      great: 'smile-o',
      good: 'smile-o',
      neutral: 'meh-o',
      difficult: 'frown-o',
      overwhelming: 'frown-o'
    };
    return icons[mood] || 'meh-o';
  };
  
  /**
   * Gets color for time block
   * @param {string} timeBlock - Time block ('15min', '30min', '1hour')
   * @returns {string} Color hex code
   */
  export const getTimeBlockColor = (timeBlock) => {
    const colors = {
      '15min': '#4CAF50',
      '30min': '#2196F3',
      '1hour': '#9C27B0'
    };
    return colors[timeBlock] || '#757575';
  };
  
  /**
   * Creates dot markers for the calendar
   * @param {Array} tasks - Array of tasks
   * @returns {Object} Object with date keys and marker properties
   */
  export const createCalendarMarkers = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) return {};
    
    const markers = {};
    
    tasks.forEach(task => {
      if (!task.scheduledFor) return;
      
      const taskDate = safeParseDate(task.scheduledFor);
      if (!taskDate) return;
      
      const dateString = formatToYYYYMMDD(taskDate);
      if (!dateString) return;
      
      // Initialize date marker if not exists
      if (!markers[dateString]) {
        markers[dateString] = {
          marked: true,
          dots: []
        };
      }
      
      // Add dot for energy level if not already present
      const existingEnergyDot = markers[dateString].dots.find(
        dot => dot.key === `energy_${task.energyLevel}`
      );
      
      if (!existingEnergyDot) {
        markers[dateString].dots.push({
          key: `energy_${task.energyLevel}`,
          color: getEnergyColor(task.energyLevel || 'medium')
        });
      }
    });
    
    return markers;
  };
  
  /**
   * Calculates streak from completed tasks
   * @param {Array} tasks - Array of tasks
   * @returns {number} Streak count
   */
  export const calculateStreak = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) return 0;
    
    let streak = 0;
    let lastCompletedDate = null;
    
    // Get completed tasks and sort by completion date
    const completedTasks = tasks
      .filter(task => task.completed && task.completedAt)
      .sort((a, b) => {
        const dateA = safeParseDate(a.completedAt);
        const dateB = safeParseDate(b.completedAt);
        return dateA && dateB ? dateA - dateB : 0;
      });
    
    // Calculate streak
    completedTasks.forEach(task => {
      const completedDate = safeParseDate(task.completedAt);
      if (completedDate) {
        const completedDateString = formatToYYYYMMDD(completedDate);
        
        if (completedDateString) {
          if (!lastCompletedDate || isConsecutiveDay(lastCompletedDate, completedDateString)) {
            streak++;
            lastCompletedDate = completedDateString;
          }
        }
      }
    });
    
    return streak;
  };
  
  /**
   * Filters and sorts tasks for the selected date
   * @param {Array} tasks - All tasks
   * @param {string} selectedDate - Selected date string (YYYY-MM-DD)
   * @param {string} filter - Filter by energy level ('all', 'high', 'medium', 'low')
   * @returns {Array} Filtered and sorted tasks
   */
  export const filterTasksByDate = (tasks, selectedDate, filter = 'all') => {
    if (!tasks || !Array.isArray(tasks) || !selectedDate) return [];
    
    const filteredTasks = tasks.filter(task => {
      const taskDate = safeParseDate(task.scheduledFor);
      if (!taskDate) return false;
      
      const taskDateString = formatToYYYYMMDD(taskDate);
      const dateMatches = taskDateString === selectedDate;
      
      return dateMatches && (filter === 'all' || task.energyLevel === filter);
    });
    
    // Sort tasks by energy level and priority
    filteredTasks.sort((a, b) => {
      const energyOrder = { high: 3, medium: 2, low: 1 };
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      
      const energyDiff = (energyOrder[b.energyLevel] || 0) - (energyOrder[a.energyLevel] || 0);
      if (energyDiff !== 0) return energyDiff;
      
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
    
    return filteredTasks;
  };