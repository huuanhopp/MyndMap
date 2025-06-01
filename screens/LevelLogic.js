import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Configuration for level progression
const LEVEL_CONFIG = {
  baseXP: 100,
  scalingFactor: 1.5,
  maxLevel: 100,
  rewards: {
    taskCompletion: {
      base: 10,
      priority: {
        Lowest: 1,
        Medium: 1.5,
        High: 2,
        Urgent: 3
      }
    },
    intervalBonus: {
      5: 3,
      10: 2,
      15: 1.5,
      30: 1
    },
    subtaskBonus: 5,
    maxSubtaskBonus: 25
  },
  taskMilestones: {
    10: 100,
    25: 300,
    50: 600,
    100: 1000,
    250: 2500,
    500: 5000,
    1000: 10000
  },
  streakMultipliers: {
    3: 1.1,
    7: 1.2,
    14: 1.3,
    30: 1.5
  },
  bonuses: {
    taskCompletion: {
      base: 10,
      priority: {
        Lowest: 1,
        Medium: 1.5,
        High: 2,
        Urgent: 3
      },
      completionStreak: {
        base: 5,
        multiplier: 1.5
      }
    },
    intervalBonus: {
      5: 3,
      10: 2,
      15: 1.5,
      30: 1
    },
    subtaskBonus: 5,
    maxSubtaskBonus: 25
  }
};

// Calculate XP needed for a specific level
const getXPForLevel = (level) => {
  return Math.floor(LEVEL_CONFIG.baseXP * Math.pow(LEVEL_CONFIG.scalingFactor, level - 1));
};

// Calculate level from total XP
const getLevelFromXP = (totalXP) => {
  let level = 1;
  let xpNeeded = LEVEL_CONFIG.baseXP;
  
  while (totalXP >= xpNeeded && level < LEVEL_CONFIG.maxLevel) {
    totalXP -= xpNeeded;
    level++;
    xpNeeded = getXPForLevel(level);
  }
  
  return {
    level,
    currentXP: totalXP,
    nextLevelXP: xpNeeded
  };
};

// Calculate XP for completing a task
const calculateTaskXP = (task) => {
  let xp = LEVEL_CONFIG.rewards.taskCompletion.base;
  
  // Priority multiplier
  const priorityMultiplier = LEVEL_CONFIG.rewards.taskCompletion.priority[task.priority] || 1;
  xp *= priorityMultiplier;
  
  // Interval bonus
  if (task.intervals && task.intervals.length > 0) {
    const smallestInterval = Math.min(...task.intervals);
    const intervalMultiplier = LEVEL_CONFIG.rewards.intervalBonus[smallestInterval] || 1;
    xp *= intervalMultiplier;
  }
  
  // Subtask bonus
  if (task.subtasks && task.subtasks.length > 0) {
    const subtaskBonus = Math.min(
      task.subtasks.length * LEVEL_CONFIG.rewards.subtaskBonus,
      LEVEL_CONFIG.rewards.maxSubtaskBonus
    );
    xp += subtaskBonus;
  }
  
  return Math.floor(xp);
};

export const LevelManager = {
  async checkForLevelUp(userId, task) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      // If no task is provided, use a default task structure
      const defaultTask = {
        priority: 'Medium',
        intervals: [],
        subtasks: []
      };

      const result = await this.addXP(userId, task || defaultTask);
      
      return result;
    } catch (error) {
      console.error('Error checking for level up:', error);
      throw error;
    }
  },

  async getCurrentLevel(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists() || !userDoc.data().levelData) {
        return await this.initializeLevelData(userId);
      }
      
      return userDoc.data().levelData;
    } catch (error) {
      console.error('Error getting current level:', error);
      throw error;
    }
  },

  async initializeLevelData(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists() || !userDoc.data().levelData) {
        const stats = await this.calculateUserStats(userId);
        const levelData = getLevelFromXP(stats.totalXP);
        
        await updateDoc(userRef, {
          levelData: {
            ...levelData,
            totalXP: stats.totalXP,
            totalTasksCompleted: stats.totalTasks,
            lastUpdated: new Date().toISOString()
          }
        });
        
        return levelData;
      }
      
      return userDoc.data().levelData;
    } catch (error) {
      console.error('Error initializing level data:', error);
      throw error;
    }
  },

  async calculateUserStats(userId) {
    try {
      const tasksQuery = query(
        collection(db, "reminders"),
        where("userId", "==", userId),
        where("completed", "==", true)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      let totalXP = 0;
      let totalTasks = 0;
      
      tasksSnapshot.forEach((doc) => {
        const task = doc.data();
        totalXP += calculateTaskXP(task);
        totalTasks++;
      });
      
      return { totalXP, totalTasks };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      throw error;
    }
  },

  async addXP(userId, task) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) throw new Error('User not found');
      
      const levelData = userDoc.data().levelData || {
        level: 1,
        currentXP: 0,
        totalXP: 0,
        nextLevelXP: LEVEL_CONFIG.baseXP,
        totalTasksCompleted: 0
      };
      
      const earnedXP = calculateTaskXP(task);
      const newTotalXP = levelData.totalXP + earnedXP;
      const newLevelData = getLevelFromXP(newTotalXP);
      
      const updatedLevelData = {
        ...newLevelData,
        totalXP: newTotalXP,
        totalTasksCompleted: levelData.totalTasksCompleted + 1,
        lastUpdated: new Date().toISOString()
      };
      
      await updateDoc(userRef, { levelData: updatedLevelData });
      
      return {
        ...updatedLevelData,
        leveledUp: newLevelData.level > levelData.level,
        earnedXP
      };
    } catch (error) {
      console.error('Error adding XP:', error);
      throw error;
    }
  }
};

export default LevelManager;