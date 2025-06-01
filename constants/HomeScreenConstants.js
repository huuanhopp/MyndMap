import { Dimensions } from 'react-native';

export const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PRIORITY_LEVELS = {
  LOWEST: 'Lowest',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
};

export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOWEST]: "#ADD8E6",
  [PRIORITY_LEVELS.MEDIUM]: "#0A5C36",
  [PRIORITY_LEVELS.HIGH]: "#FF8C00",
  [PRIORITY_LEVELS.URGENT]: "#FF0000",
};

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday", 
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export const DEFAULT_INTERVALS = ["5", "10", "15", "30"];

export const TIME_OF_DAY = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  NIGHT: 'night'
};

export const TIME_RANGES = {
  MORNING: { start: 5, end: 12 },
  AFTERNOON: { start: 12, end: 17 },
  EVENING: { start: 17, end: 22 },
  NIGHT: { start: 22, end: 5 }
};

export const INITIAL_TIME_OF_DAY_STATS = {
  [TIME_OF_DAY.MORNING]: 0,
  [TIME_OF_DAY.AFTERNOON]: 0,
  [TIME_OF_DAY.EVENING]: 0,
  [TIME_OF_DAY.NIGHT]: 0
};