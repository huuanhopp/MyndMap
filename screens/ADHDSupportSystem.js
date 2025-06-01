// Period definitions for analytics
const TIME_PERIODS = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
  NIGHT: 'Night'
};

const COMPLEXITY_LEVELS = {
  SIMPLE: 'simple',
  MODERATE: 'moderate',
  COMPLEX: 'complex'
};

// Core advice categories
const ADVICE_CATEGORIES = {
  FOCUS: 'focus',
  PLANNING: 'planning',
  MOTIVATION: 'motivation',
  ENVIRONMENT: 'environment',
  ENERGY: 'energy'
};

const analyzeTimePatterns = (tasks) => {
  if (!tasks || !Array.isArray(tasks)) return {};
  
  const completedTasks = tasks.filter(task => task.completed && task.completedAt);
  const timePatterns = completedTasks.reduce((acc, task) => {
    const hour = new Date(task.completedAt).getHours();
    const timeSlot = getTimeSlot(hour);
    acc[timeSlot] = (acc[timeSlot] || 0) + 1;
    return acc;
  }, {});

  return timePatterns;
};

const getTimeSlot = (hour) => {
  if (hour >= 5 && hour < 12) return TIME_PERIODS.MORNING;
  if (hour >= 12 && hour < 17) return TIME_PERIODS.AFTERNOON;
  if (hour >= 17 && hour < 21) return TIME_PERIODS.EVENING;
  return TIME_PERIODS.NIGHT;
};

const generateBaseAdvice = (analysis) => {
  const { performance = {}, patterns = {}, challenges = [] } = analysis;
  
  return {
    [ADVICE_CATEGORIES.FOCUS]: getFocusStrategies(performance),
    [ADVICE_CATEGORIES.PLANNING]: getPlanningStrategies(patterns),
    [ADVICE_CATEGORIES.MOTIVATION]: getMotivationStrategies(challenges),
    [ADVICE_CATEGORIES.ENVIRONMENT]: getEnvironmentStrategies(patterns),
    [ADVICE_CATEGORIES.ENERGY]: getEnergyManagementStrategies(patterns)
  };
};

const getFocusStrategies = (performance) => {
  const strategies = [];
  
  strategies.push({
    title: 'Focus Enhancement',
    tips: [
      'Break tasks into 15-minute segments',
      'Use timers for dedicated focus periods',
      'Remove visual distractions from workspace'
    ]
  });

  return strategies;
};

const getPlanningStrategies = (patterns) => {
  return [{
    title: 'Planning Techniques',
    tips: [
      'Start with a brain dump of all tasks',
      'Use time-blocking for different types of work',
      'Set specific start times for important tasks'
    ]
  }];
};

const getMotivationStrategies = (challenges) => {
  return [{
    title: 'Motivation Boosters',
    tips: [
      'Celebrate small wins',
      'Use the 5-minute rule to get started',
      'Create a reward system for task completion'
    ]
  }];
};

const getEnvironmentStrategies = (patterns) => {
  return [{
    title: 'Environment Setup',
    tips: [
      'Create dedicated work zones',
      'Use visual cues and reminders',
      'Minimize potential distractions'
    ]
  }];
};

const getEnergyManagementStrategies = (patterns) => {
  return [{
    title: 'Energy Management',
    tips: [
      'Match difficult tasks to high-energy periods',
      'Take regular movement breaks',
      'Use body-doubling techniques'
    ]
  }];
};

const formatAdviceByIntensity = (baseAdvice, intensityLevel) => {
  switch (intensityLevel) {
    case 'gentle':
      return formatGentleAdvice(baseAdvice);
    case 'intensive':
      return formatIntensiveAdvice(baseAdvice);
    default:
      return formatBalancedAdvice(baseAdvice);
  }
};

const formatGentleAdvice = (baseAdvice) => {
  return Object.entries(baseAdvice).map(([category, strategies]) => ({
    category: humanizeCategory(category),
    strategies: strategies.map(strategy => ({
      title: `💝 ${strategy.title}`,
      tips: strategy.tips.map(tip => `🌱 Maybe try: ${tip}`),
      tone: 'gentle'
    }))
  }));
};

const formatBalancedAdvice = (baseAdvice) => {
  return Object.entries(baseAdvice).map(([category, strategies]) => ({
    category: humanizeCategory(category),
    strategies: strategies.map(strategy => ({
      title: `📝 ${strategy.title}`,
      tips: strategy.tips.map(tip => `✨ Try this: ${tip}`),
      tone: 'balanced'
    }))
  }));
};

const formatIntensiveAdvice = (baseAdvice) => {
  return Object.entries(baseAdvice).map(([category, strategies]) => ({
    category: humanizeCategory(category),
    strategies: strategies.map(strategy => ({
      title: `🎯 ${strategy.title}`,
      tips: strategy.tips.map(tip => `⚡ Action Item: ${tip}`),
      tone: 'intensive'
    }))
  }));
};

const humanizeCategory = (category) => {
  return category
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const generateAdvice = (userData, intensityLevel) => {
  // Handle empty or invalid data
  if (!userData) {
    const defaultAnalysis = {
      performance: { overall: 'new' },
      patterns: {},
      challenges: []
    };
    const baseAdvice = generateBaseAdvice(defaultAnalysis);
    return formatAdviceByIntensity(baseAdvice, intensityLevel);
  }

  // Analyze the data
  const timePatterns = analyzeTimePatterns(userData.tasks);
  const analysis = {
    performance: {
      overall: userData.completionRate >= 70 ? 'strong' : 
               userData.completionRate >= 40 ? 'moderate' : 
               'needsSupport',
    },
    patterns: {
      timePreference: Object.entries(timePatterns)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null,
    },
    challenges: []
  };

  const baseAdvice = generateBaseAdvice(analysis);
  return formatAdviceByIntensity(baseAdvice, intensityLevel);
};

const ADHDSupportSystem = {
  generateAdvice,
  analyzeTimePatterns,
};

export default ADHDSupportSystem;