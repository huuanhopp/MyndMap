export const INTENSITY_LEVELS = {
    GENTLE: 'gentle',
    BALANCED: 'balanced',
    INTENSIVE: 'intensive',
    DYNAMIC: 'dynamic'
  };
  
  export const INTENSITY_DESCRIPTIONS = {
    [INTENSITY_LEVELS.GENTLE]: {
      title: "Gentle Support",
      description: "A low-pressure approach focused on breaking task paralysis and building confidence through micro-achievements. Perfect for overwhelmed days.",
      bestFor: "• Breaking through task paralysis\n• Building momentum with tiny steps\n• Regaining confidence\n• Low-energy days",
      emoji: "🌱",
      color: "#4CAF50", // Gentle green
      isPremium: false,
      features: [
        "5-minute task breakdowns",
        "Positive reinforcement system",
        "No-pressure goal setting",
        "Micro-achievement tracking"
      ]
    },
    [INTENSITY_LEVELS.BALANCED]: {
      title: "Routine Builder",
      description: "Focused on creating sustainable daily routines and habits. Helps establish consistent work patterns with flexible time-blocking.",
      bestFor: "• Creating daily routines\n• Building sustainable habits\n• Time-blocking practice\n• Work-break balance",
      emoji: "⚖️",
      color: "#2196F3", // Balanced blue
      isPremium: false,
      features: [
        "Routine templates",
        "Flexible time blocks",
        "Habit stacking guides",
        "Daily consistency tracking"
      ]
    },
    [INTENSITY_LEVELS.INTENSIVE]: {
      title: "Project Focus",
      description: "Deadline-driven approach with project management tools and sprint planning. Ideal for important deadlines and focused work periods.",
      bestFor: "• Meeting deadlines\n• Project management\n• Sprint planning\n• High-focus periods",
      emoji: "🎯",
      color: "#FF5722", // Intensive orange
      isPremium: false,
      features: [
        "Project breakdown tools",
        "Sprint planning system",
        "Deadline tracking",
        "Progress milestones"
      ]
    },
    [INTENSITY_LEVELS.DYNAMIC]: {
      title: "Pattern Master Pro ⭐",
      description: "Advanced productivity system that learns from your successful patterns and builds personalized work flows. Unlock your peak performance times.",
      bestFor: "• Visual productivity mapping\n• Custom organization systems\n• Success pattern tracking\n• Personal workflow optimization",
      emoji: "✨",
      color: "#9C27B0", // Deep purple
      isPremium: true,
      features: [
        "Success pattern recognition",
        "Visual productivity heat maps",
        "Custom organization systems",
        "Achievement analytics",
        "Peak time optimization",
        "Personal workflow builder"
      ]
    }
  };