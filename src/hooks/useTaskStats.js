import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../screens/firebaseConfig';

const initialStats = {
  totalTasks: 0,
  completedTasks: 0,
  completionRate: 0,
  tasksByPriority: {
    Urgent: 0,
    High: 0,
    Medium: 0,
    Lowest: 0
  },
  recentActivity: {
    lastWeekTasks: 0,
    lastWeekCompleted: 0
  },
  streaks: {
    current: 0,
    longest: 0
  },
  productivity: {
    mostProductiveTime: '',
    averageTasksPerDay: 0,
    score: 0,
    metrics: []
  },
  weeklyGrowth: 0,
  dailyAverageTrend: 0
};

const parseDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
    if (typeof dateValue === 'number') {
      return new Date(dateValue);
    }
    if (dateValue instanceof Date) {
      return dateValue;
    }
    return null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

const getTimeOfDay = (hour) => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

const calculateProductivityScore = (stats) => {
    const weights = {
      completionRate: 0.4,
      consistency: 0.3,
      recentActivity: 0.2,
      priorityBalance: 0.1
    };
  
    // Completion Rate (0-100)
    const completionScore = stats.completionRate;
  
    // Consistency Score (0-100) - based on completion rate over the last 7 days
    const consistencyScore = stats.recentActivity.lastWeekTasks > 0
      ? (stats.recentActivity.lastWeekCompleted / stats.recentActivity.lastWeekTasks) * 100
      : 0;
  
    // Recent Activity Score (0-100) - based on last week's completion rate
    const recentActivityScore = stats.recentActivity.lastWeekTasks > 0
      ? (stats.recentActivity.lastWeekCompleted / stats.recentActivity.lastWeekTasks) * 100
      : 0;
  
    // Priority Balance Score (0-100)
    const totalPriorityTasks = Object.values(stats.tasksByPriority).reduce((a, b) => a + b, 0);
    const urgentPercentage = totalPriorityTasks > 0
      ? (stats.tasksByPriority.Urgent / totalPriorityTasks) * 100
      : 0;
    const priorityScore = 100 - Math.min(urgentPercentage, 40) * 2.5; // Penalize high urgent task ratios
  
    // Calculate weighted total
    const score = (
      completionScore * weights.completionRate +
      consistencyScore * weights.consistency +
      recentActivityScore * weights.recentActivity +
      priorityScore * weights.priorityBalance
    );
  
    return {
      score: Math.round(score),
      metrics: [
        { label: 'Completion', value: `${Math.round(completionScore)}%`, color: '#4CAF50' },
        { label: 'Consistency', value: `${Math.round(consistencyScore)}%`, color: '#FFC107' },
        { label: 'Recent Activity', value: `${Math.round(recentActivityScore)}%`, color: '#2196F3' },
        { label: 'Task Balance', value: `${Math.round(priorityScore)}%`, color: '#9C27B0' }
      ]
    };
  };

export const useTaskStats = (user, visible) => {
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible && user?.uid) {
      fetchTaskData();
    }
  }, [visible, user]);

  const fetchTaskData = async () => {
    try {
      setIsLoading(true);
      if (!user?.uid) return;

      const userStatsRef = doc(db, "userStats", user.uid);
      const userStatsDoc = await getDoc(userStatsRef);
      const userStats = userStatsDoc.exists() ? userStatsDoc.data() : {};

      const now = new Date();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const remindersRef = collection(db, 'reminders');
      const q = query(remindersRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      let totalTasks = 0;
      let completedTasks = 0;
      let thisWeekTasks = 0;
      let thisWeekCompleted = 0;
      const tasksByPriority = { Urgent: 0, High: 0, Medium: 0, Lowest: 0 };
      const timeOfDayStats = { morning: 0, afternoon: 0, evening: 0, night: 0 };

      querySnapshot.forEach(doc => {
        const task = doc.data();
        totalTasks++;
        if (task.completed) completedTasks++;

        const taskDate = parseDate(task.completedAt || task.createdAt);
        if (taskDate) {
          if (taskDate >= startOfWeek && taskDate < endOfWeek) {
            thisWeekTasks++;
            if (task.completed) thisWeekCompleted++;
          }
          if (task.completed) {
            const timeOfDay = getTimeOfDay(taskDate.getHours());
            timeOfDayStats[timeOfDay]++;
          }
        }

        if (task.priority) tasksByPriority[task.priority]++;
      });

      // Find most productive time
      const mostProductiveTime = Object.entries(timeOfDayStats)
        .reduce((a, b) => b[1] > a[1] ? b : a)[0];

      const completionRate = totalTasks > 0 
        ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(1)) // Convert to number
        : 0;

      // Calculate productivity score
      const productivity = calculateProductivityScore({
        completionRate,
        streaks: userStats.currentStreak || 0,
        recentActivity: {
          lastWeekTasks: thisWeekTasks,
          lastWeekCompleted: thisWeekCompleted
        },
        tasksByPriority
      });

      // Calculate weekly growth and daily average trend
      const weeklyGrowth = thisWeekTasks > 0
        ? (thisWeekCompleted / thisWeekTasks) * 100 // Completion percentage
        : 0;
      const dailyAverageTrend = parseFloat((completedTasks / 7).toFixed(1)); // Convert to number

      // Update stats
      setStats({
        ...initialStats,
        totalTasks,
        completedTasks,
        completionRate,
        tasksByPriority,
        recentActivity: {
          lastWeekTasks: thisWeekTasks,
          lastWeekCompleted: thisWeekCompleted
        },
        streaks: {
          current: userStats.currentStreak || 0,
          longest: userStats.longestStreak || 0
        },
        productivity: {
          mostProductiveTime,
          averageTasksPerDay: dailyAverageTrend,
          score: productivity.score,
          metrics: productivity.metrics
        },
        weeklyGrowth,
        dailyAverageTrend
      });

    } catch (error) {
      console.error('Error fetching task data:', error);
      setStats(initialStats);
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading };
};