import { useState, useCallback } from 'react';

export const useXPSystem = () => {
  const [xpGainAnimations, setXpGainAnimations] = useState([]);
  
  const calculateTaskXP = useCallback((task) => {
    let xp = 10; // Base XP for any task
    
    // Priority multipliers
    const priorityMultipliers = {
      Urgent: 2.0,
      High: 1.5,
      Medium: 1.2,
      Lowest: 1.0
    };
    
    // Add priority bonus
    xp *= priorityMultipliers[task.priority] || 1.0;
    
    // Add bonus for subtasks
    if (task.subtasks?.length > 0) {
      xp += task.subtasks.length * 5;
    }
    
    // Add bonus for scheduled tasks
    if (task.scheduledFor) {
      xp += 5;
    }
    
    // Add bonus for repeated tasks
    if (task.repetitionInterval) {
      xp += 8;
    }
    
    return Math.round(xp);
  }, []);

  const triggerXPGain = useCallback((task, position) => {
    const xpAmount = calculateTaskXP(task);
    
    const newAnimation = {
      id: Date.now(),
      xp: xpAmount,
      position: position || {
        top: Math.random() * 200 + 100,
        left: Math.random() * 200 + 50,
      },
    };

    setXpGainAnimations(prev => [...prev, newAnimation]);

    // Remove animation after it's complete
    setTimeout(() => {
      setXpGainAnimations(prev => 
        prev.filter(animation => animation.id !== newAnimation.id)
      );
    }, 1500);

    return xpAmount;
  }, [calculateTaskXP]);

  return {
    xpGainAnimations,
    triggerXPGain,
    calculateTaskXP,
  };
};