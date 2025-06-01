import React, { useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

// 1. Attention-grabbing Animation Component for Transitions
export const FocusTransition = ({ visible, children, style }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      // Reset animation values
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      
      // Run entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Run exit animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  if (!visible && opacityAnim._value === 0) return null;
  
  return (
    <Animated.View
      style={[
        styles.focusTransition,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// 2. Visual Timer Ring - Circular countdown that's visually engaging
export const VisualTimerRing = ({ 
  totalSeconds, 
  remainingSeconds,
  size = 150,
  strokeWidth = 10,
  primaryColor = '#00C853',
  secondaryColor = '#F7E8D3',
  backgroundColor = 'rgba(255,255,255,0.1)' 
}) => {
  // Animation for the progress ring
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Calculate the progress percentage
  const progress = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
  
  // Calculate ring properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference * (1 - progress);
  
  // Format time for display
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  // Start pulse animation when less than 10% time remains
  useEffect(() => {
    // Update progress animation
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false, // Uses non-native driver for SVG animation
    }).start();
    
    // Pulse animation for last 10% of time
    if (progress < 0.1 && remainingSeconds > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset pulse when not in critical time
      pulseAnim.setValue(1);
    }
  }, [remainingSeconds, progress]);
  
  // Interpolate color based on progress
  const timerColor = progressAnim.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: ['#FF1744', '#FF9100', '#00B0FF', primaryColor]
  });
  
  return (
    <Animated.View style={[
      styles.timerRingContainer,
      { width: size, height: size, transform: [{ scale: pulseAnim }] }
    ]}>
      {/* Background circle */}
      <View style={[
        styles.timerRingBackground,
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: backgroundColor
        }
      ]} />
      
      {/* Animated progress ring */}
      <Animated.View
        style={[
          styles.timerRingProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: timerColor,
            // This rotates to show only part of the border
            transform: [
              { rotateZ: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['270deg', '-90deg']
              }) }
            ],
            opacity: progressAnim.interpolate({
              inputRange: [0, 0.01, 1],
              outputRange: [0, 1, 1] // Hide when time is up
            })
          }
        ]}
      />
      
      {/* Time display in center */}
      <View style={styles.timerRingTextContainer}>
        <Text style={[styles.timerRingText, { color: secondaryColor }]}>
          {minutes}:{seconds < 10 ? '0' : ''}{seconds}
        </Text>
      </View>
    </Animated.View>
  );
};

// 3. Celebration Animation for task completion
export const CompletionCelebration = ({ visible, onAnimationEnd }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  
  useEffect(() => {
    if (visible) {
      // Reset animation values
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      
      // Run entrance animation
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && onAnimationEnd) {
          onAnimationEnd();
        }
      });
    }
  }, [visible]);
  
  if (!visible && fadeAnim._value === 0) return null;
  
  return (
    <Animated.View
      style={[
        styles.celebrationContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.celebrationContent,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#00C853', '#64DD17']}
          style={styles.celebrationGradient}
        >
          <FontAwesome name="check-circle" size={50} color="#FFF" />
          <Text style={styles.celebrationText}>Great job!</Text>
          <Text style={styles.celebrationSubtext}>Task completed</Text>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

// 4. Break time progress indicator
export const BreakProgressBar = ({ progress, style }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);
  
  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  return (
    <View style={[styles.progressContainer, style]}>
      <Animated.View 
        style={[
          styles.progressBar,
          { width }
        ]} 
      />
    </View>
  );
};

// 5. Neurodivergent-friendly styles
const styles = StyleSheet.create({
  // Focus Transition
  focusTransition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  
  // Visual Timer Ring
  timerRingContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerRingBackground: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  timerRingProgress: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderStyle: 'solid',
  },
  timerRingTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerRingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  // Celebration
  celebrationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 2000,
  },
  celebrationContent: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  celebrationGradient: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
  },
  celebrationSubtext: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 5,
    opacity: 0.9,
  },
  
  // Break Progress Bar
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00C853',
    borderRadius: 4,
  },
});

export default {
  FocusTransition,
  VisualTimerRing,
  CompletionCelebration,
  BreakProgressBar
};