import { useState, useEffect, useCallback } from 'react';

// Configuration constants for task prioritization
const CONFIG = {
  priorityWeights: {
    Lowest: 1.00,
    Medium: 1.50,
    High: 2.00,
    Urgent: 3.00,
  },
  intervalWeights: {
    5: 0.40,
    10: 0.30,
    15: 0.20,
    30: 0.10
  },
  creationDateWeight: 0.02,
  scheduledDateWeight: 0.08,
  subtaskWeight: 0.15,
  rescheduleCountPenalty: 0.05
};

/**
 * Hook for managing task prioritization and sorting
 * Implements a sophisticated algorithm that considers multiple factors:
 * - Task priority level (Urgent, High, Medium, Lowest)
 * - Interval timing (shorter intervals given higher priority)
 * - Due date proximity (with special emphasis on imminent deadlines)
 * - Subtask complexity (tasks with more subtasks receive attention)
 * - Reschedule history (applies a penalty for frequently rescheduled tasks)
 * 
 * @param {Array} reminders - Array of task objects to prioritize
 * @param {Function} onPriorityChange - Callback when highest priority task changes
 * @returns {Object} Prioritization state and functions
 */
export const useTaskPrioritization = (reminders, onPriorityChange) => {
  const [highestPriorityTask, setHighestPriorityTask] = useState(null);
  const [prioritizedTasks, setPrioritizedTasks] = useState([]);
  
  // Get the weight for the task's interval
  const getIntervalWeight = (intervals) => {
    if (!intervals || !Array.isArray(intervals) || intervals.length === 0) return 0;
    // Get the shortest interval (most urgent)
    const shortestInterval = Math.min(...intervals);
    // Return the corresponding weight or 0 if not found
    return CONFIG.intervalWeights[shortestInterval] || 0;
  };
  
  // Calculate dynamic priority weight based on task properties
  const getDynamicPriorityWeight = (task) => {
    const baseWeight = CONFIG.priorityWeights[task.priority] || CONFIG.priorityWeights.Lowest;
    if (task.scheduledFor) {
      const now = new Date().getTime();
      const scheduledDate = new Date(task.scheduledFor).getTime();
      const hoursUntilDue = (scheduledDate - now) / (1000 * 60 * 60);
      if (hoursUntilDue <= 24) {
        return baseWeight * 1.5;
      }
    }
    return baseWeight;
  };
  
  // Calculate task urgency based on age and deadline
  const calculateTaskUrgency = (task) => {
    const now = new Date().getTime();
    const creationDate = new Date(task.createdAt).getTime();
    const ageInDays = (now - creationDate) / (1000 * 60 * 60 * 24);
    const ageScore = Math.min(ageInDays * CONFIG.creationDateWeight, 1);
    
    let deadlineScore = 0;
    if (task.scheduledFor) {
      const scheduledDate = new Date(task.scheduledFor).getTime();
      const daysUntilDue = (scheduledDate - now) / (1000 * 60 * 60 * 24);
      deadlineScore = Math.max(0, 1 - (daysUntilDue * CONFIG.scheduledDateWeight));
      if (daysUntilDue <= 1) {
        deadlineScore *= 1.5;
      }
    }
    
    return { ageScore, deadlineScore };
  };
  
  // Calculate overall task score
  const calculateTaskScore = useCallback((task) => {
    const priorityWeight = getDynamicPriorityWeight(task);
    const intervalWeight = getIntervalWeight(task.intervals);
    const { ageScore, deadlineScore } = calculateTaskUrgency(task);
    const subtaskCount = task.subtasks ? task.subtasks.length : 0;
    const subtaskScore = subtaskCount * CONFIG.subtaskWeight;
    const reschedulePenalty = (task.rescheduleCount || 0) * CONFIG.rescheduleCountPenalty;
    
    const score = (
      priorityWeight * 0.35 +
      intervalWeight * 0.20 +
      ageScore * 0.10 +
      deadlineScore * 0.20 +
      subtaskScore * 0.15
    ) * (1 - reschedulePenalty);
    
    // Clamp score between 0 and 1
    const clampedScore = Math.min(Math.max(score, 0), 1);
    
    // Store score components for debugging
    const scoreBreakdown = {
      priorityComponent: priorityWeight * 0.35,
      intervalComponent: intervalWeight * 0.20,
      ageComponent: ageScore * 0.10,
      deadlineComponent: deadlineScore * 0.20,
      subtaskComponent: subtaskScore * 0.15,
      reschedulePenalty
    };
    
    return { score: clampedScore, scoreBreakdown };
  }, []);
  
  // Sort tasks based on calculated scores
  const sortTasks = useCallback((tasks) => {
    if (!Array.isArray(tasks)) return [];
    
    // Calculate score for each task
    const tasksWithScores = tasks.map(task => {
      const { score, scoreBreakdown } = calculateTaskScore(task);
      return {
        ...task,
        score,
        scoreBreakdown
      };
    });
    
    // Sort by score, then by priority weight, then by creation date
    return tasksWithScores.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (Math.abs(scoreDiff) > 0.001) return scoreDiff;
      
      const priorityDiff = (CONFIG.priorityWeights[b.priority] || 0) - 
                          (CONFIG.priorityWeights[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [calculateTaskScore]);
  
  // Prioritize tasks whenever reminders change
  useEffect(() => {
    if (!Array.isArray(reminders) || reminders.length === 0) {
      setHighestPriorityTask(null);
      setPrioritizedTasks([]);
      return;
    }
    
    const sortedTasks = sortTasks(reminders);
    setPrioritizedTasks(sortedTasks);
    
    // Set the highest priority task
    const highest = sortedTasks[0];
    
    // Update state if highest priority task changed
    if (!highestPriorityTask || highest.id !== highestPriorityTask.id) {
      setHighestPriorityTask(highest);
      
      // Notify parent component about priority change
      if (onPriorityChange) {
        onPriorityChange(highest);
      }
    }
  }, [reminders, sortTasks, highestPriorityTask, onPriorityChange]);
  
  // Debug function to analyze why a task received its priority score
  const analyzeTaskPriority = useCallback((taskId) => {
    if (!Array.isArray(prioritizedTasks)) return null;
    
    const task = prioritizedTasks.find(t => t.id === taskId);
    if (!task) return null;
    
    return {
      taskId: task.id,
      taskText: task.text,
      priority: task.priority,
      intervalWeight: getIntervalWeight(task.intervals),
      score: task.score,
      breakdown: task.scoreBreakdown,
      rank: prioritizedTasks.findIndex(t => t.id === taskId) + 1,
      totalTasks: prioritizedTasks.length
    };
  }, [prioritizedTasks]);
  
  return {
    highestPriorityTask,
    prioritizedTasks,
    calculateTaskScore,
    sortTasks,
    analyzeTaskPriority
  };
};

export default useTaskPrioritization;