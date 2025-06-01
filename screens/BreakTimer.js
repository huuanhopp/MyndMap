import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const BreakTimer = ({ 
  timeRemaining, 
  onEndBreak, 
  isPenalty = false 
}) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Format time remaining into minutes:seconds
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Early finish button (only show if not a penalty break)
  const handleEarlyFinish = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start(() => {
      onEndBreak();
    });
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <Text style={styles.title}>
        {isPenalty ? 'Focus Reset' : 'Break Time'}
      </Text>
      
      <View style={styles.timerContainer}>
        <FontAwesome name="coffee" size={28} color="#F7E8D3" style={styles.icon} />
        <Text style={styles.timer}>{formattedTime}</Text>
      </View>
      
      <Text style={styles.message}>
        {isPenalty 
          ? 'Taking a moment to reset your focus. Give your brain a chance to recharge.' 
          : 'Taking regular breaks improves focus and productivity. Relax and recharge!'}
      </Text>
      
      {!isPenalty && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleEarlyFinish}
        >
          <Text style={styles.buttonText}>I'm ready to continue</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F7E8D3',
    marginBottom: 20,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  timer: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F7E8D3',
  },
  message: {
    fontSize: 16,
    color: '#F7E8D3',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#00C853',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default BreakTimer;