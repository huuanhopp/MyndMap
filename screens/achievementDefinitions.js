import { FontAwesome } from "@expo/vector-icons";

export const achievements = [
  {
    id: 'first_quest',
    name: 'Quest Beginner',
    description: 'Complete your first task. Every journey begins with a single step!',
    icon: 'flag',
  },
  {
    id: 'focus_warrior',
    name: 'Focus Warrior',
    description: 'Complete 5 tasks in a single day. Your focus is your power!',
    icon: 'fire',
  },
  {
    id: 'consistency_champion',
    name: 'Consistency Champion',
    description: 'Maintain a 3-day streak. Slow and steady wins the race!',
    icon: 'trophy',
  },
  {
    id: 'task_tackler',
    name: 'Task Tackler',
    description: 'Complete 20 tasks. You are on a roll!',
    icon: 'check-square',
  },
  {
    id: 'subtask_superstar',
    name: 'Subtask Superstar',
    description: 'Complete a task with 3 subtasks. Breaking it down is the key!',
    icon: 'list',
  },
  {
    id: 'priority_pro',
    name: 'Priority Pro',
    description: 'Complete an Urgent task. You know what matters most!',
    icon: 'exclamation-circle',
  },
  {
    id: 'note_ninja',
    name: 'Note Ninja',
    description: 'Create 5 notes. Your thoughts are organized and powerful!',
    icon: 'sticky-note',
  },
  {
    id: 'future_planner',
    name: 'Future Planner',
    description: 'Schedule a task for a future date. Planning ahead like a boss!',
    icon: 'calendar',
  },
];

export const renderAchievementIcon = (achievementId, size, color) => {
  const achievement = achievements.find(a => a.id === achievementId);
  return achievement ? (
    <FontAwesome name={achievement.icon} size={size} color={color} />
  ) : null;
};