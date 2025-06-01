import { PRIORITY_COLORS } from '../constants/HomeScreenConstants';

export const getFlagColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.LOWEST;
};

export const getAlertInterval = (task) => {
  if (!task || !task.intervals || task.intervals.length === 0) {
    return 5; // Default to 5 minutes if no interval is set
  }
  return Math.min(...task.intervals);
};

export const getTimeOfDay = (hour) => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

export const formatDuration = (hours) => {
  const minutes = Math.round(hours * 60);
  if (minutes < 60) return `${minutes}m`;
  if (minutes % 60 === 0) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

export const isPastDue = (scheduledDate) => {
  if (!scheduledDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(scheduledDate);
  taskDate.setHours(0, 0, 0, 0);
  return taskDate < today;
};

export const isFutureTask = (scheduledDate) => {
  if (!scheduledDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(scheduledDate);
  taskDate.setHours(0, 0, 0, 0);
  return taskDate > today;
};

export const sortTasksByPriorityAndDate = (tasks) => {
  const priorityOrder = {
    'Urgent': 0,
    'High': 1,
    'Medium': 2,
    'Lowest': 3
  };

  return [...tasks].sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by scheduled date
    const dateA = new Date(a.scheduledFor || a.createdAt);
    const dateB = new Date(b.scheduledFor || b.createdAt);
    return dateA - dateB;
  });
};