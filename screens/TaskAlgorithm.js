import { differenceInDays, isToday, parseISO } from 'date-fns';

/**
 * Calculate a priority score for the task based on multiple factors
 * @param {Object} task - The task object to evaluate
 * @return {number} - A normalized score between 0 and 1
 */
export const calculateTaskScore = (task) => {
  if (!task) return 0;
  
  let score = 0;
  const now = new Date();
  
  // Base priority score (0-100)
  const priorityScores = {
    'Urgent': 100,
    'High': 75,
    'Medium': 50,
    'Lowest': 25
  };
  
  score += priorityScores[task.priority] || 25;
  
  // Due date proximity factor (0-50)
  if (task.scheduledFor || task.dueDate) {
    const dueDate = parseISO(task.scheduledFor || task.dueDate);
    
    // If due today, high priority boost
    if (isToday(dueDate)) {
      score += 50;
    } else {
      // Calculate days until due
      const daysUntil = differenceInDays(dueDate, now);
      
      // Tasks due soon get higher priority
      if (daysUntil <= 0) {
        // Overdue tasks get maximum boost
        score += 50;
      } else if (daysUntil <= 3) {
        // Due within 3 days
        score += 40;
      } else if (daysUntil <= 7) {
        // Due within a week
        score += 30;
      } else if (daysUntil <= 14) {
        // Due within two weeks
        score += 20;
      } else {
        // Due later
        score += 10;
      }
    }
  }
  
  // Task complexity factor (0-30)
  if (task.subtasks && task.subtasks.length > 0) {
    // Tasks with subtasks get a small complexity boost
    score += Math.min(10 + (task.subtasks.length * 2), 30);
  }
  
  // Reschedule penalty (-25 to 0)
  if (task.rescheduleCount > 0) {
    score -= Math.min(task.rescheduleCount * 5, 25);
  }
  
  // Timer activity bonus (0-25)
  if (task.timerState && task.timerState.isActive) {
    score += 25;
  }
  
  // Normalize to 0-1 range
  const normalizedScore = Math.max(0, Math.min(score / 200, 1));
  
  // Store the score in the task for UI display
  task.score = normalizedScore;
  
  return normalizedScore;
};

/**
 * Sort tasks by their calculated priority score
 * @param {Array} tasks - Array of task objects
 * @return {Array} - Sorted array of tasks
 */
export const sortTasks = (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }
  
  // Create a copy to avoid mutation
  const tasksCopy = [...tasks];
  
  // Add score to each task
  tasksCopy.forEach(task => {
    if (task) {
      task.score = calculateTaskScore(task);
    }
  });
  
  // Sort by score (highest first)
  return tasksCopy.sort((a, b) => {
    // Handle potential null/undefined tasks
    if (!a) return 1;
    if (!b) return -1;
    
    return b.score - a.score;
  });
};

/**
 * Find the highest priority task from a set of tasks
 * @param {Array} tasks - Array of task objects
 * @return {Object|null} - Highest priority task or null
 */
export const findHighestPriorityTask = (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return null;
  }
  
  const sortedTasks = sortTasks(tasks);
  return sortedTasks[0] || null;
};

/**
 * Get appropriate color for flag based on priority
 * @param {string} priority - The task priority level
 * @return {string} - Hex color code
 */
export const getFlagColor = (priority) => {
  switch (priority) {
    case 'Urgent':
      return '#FF1744'; // Red
    case 'High':
      return '#FF9100'; // Orange
    case 'Medium':
      return '#00C853'; // Green
    case 'Lowest':
    default:
      return '#00B0FF'; // Blue
  }
};

/**
 * Standardize a task object to ensure consistent structure
 * @param {Object} task - The task object to standardize
 * @return {Object} - Standardized task object
 */
export const standardizeTask = (task) => {
  if (!task) return null;
  
  // Ensure interval is stored in both formats for compatibility
  let interval = task.interval;
  if (!interval && task.intervals && task.intervals.length > 0) {
    interval = task.intervals[0];
  }
  
  // Create standardized task
  return {
    ...task,
    text: task.text || '',
    priority: task.priority || 'Lowest',
    interval: interval || 5,
    intervals: interval ? [interval] : [5],
    dueDate: task.dueDate || task.scheduledFor || new Date().toISOString(),
    scheduledFor: task.scheduledFor || task.dueDate || new Date().toISOString(),
    completed: task.completed || false,
    subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
    hasSubtasks: Array.isArray(task.subtasks) && task.subtasks.length > 0,
    rescheduleCount: task.rescheduleCount || 0,
    score: calculateTaskScore(task)
  };
};