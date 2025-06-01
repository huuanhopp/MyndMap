import { useCallback } from 'react';
import { Animated, Easing } from 'react-native';

export const useAnimationHandlers = (
  fadeAnim,
  setShowFutureTasks,
  helpButtonAnim,
  isNewUser,
  taskListFade // Added parameter for task list fade animation
) => {
  const toggleFutureTasks = useCallback(() => {
    // Create a smooth fade-out/fade-in animation sequence
    Animated.sequence([
      // First fade out
      Animated.timing(taskListFade, {
        toValue: 0,
        duration: 250, // Fast fade out
        useNativeDriver: true,
        easing: Easing.easeOut
      }),
      // Then change the state
      Animated.timing(taskListFade, {
        toValue: 0,
        duration: 0, // Instant - just to create a step for updating state
        useNativeDriver: true
      }),
      // Then fade back in
      Animated.timing(taskListFade, {
        toValue: 1,
        duration: 300, // Slightly slower fade in
        useNativeDriver: true,
        easing: Easing.easeIn
      })
    ]).start();

    // Update the state after a slight delay (during the fade-out)
    setTimeout(() => {
      setShowFutureTasks(prev => !prev);
    }, 200); // Timing set to happen during fade-out but before fade-in
  }, [taskListFade, setShowFutureTasks]);

  const animateHelpButton = useCallback(() => {
    if (isNewUser) {
      Animated.sequence([
        Animated.timing(helpButtonAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(helpButtonAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(helpButtonAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(helpButtonAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
      ]).start();
    }
  }, [isNewUser, helpButtonAnim]);

  const fadeOut = useCallback((targetValue, duration = 500) => {
    return new Promise(resolve => {
      Animated.timing(fadeAnim, {
        toValue: targetValue,
        duration,
        useNativeDriver: true,
      }).start(resolve);
    });
  }, [fadeAnim]);

  return {
    toggleFutureTasks,
    animateHelpButton,
    fadeOut
  };
};

export default useAnimationHandlers;