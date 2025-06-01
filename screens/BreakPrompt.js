import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const BreakPrompt = ({ 
  taskName, 
  breakDuration, 
  onAccept, 
  onDecline 
}) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Handle animation on accept/decline
  const handleResponse = (accept) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (accept) {
        onAccept();
      } else {
        onDecline();
      }
    });
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.header}>
        <FontAwesome name="clock-o" size={22} color="#F7E8D3" />
        <Text style={styles.title}>Break Check...</Text>
      </View>
      
      <Text style={styles.message}>
        You've been working on "{taskName}" for a while.
        Would you like to take a {breakDuration}-minute break?
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.declineButton]} 
          onPress={() => handleResponse(false)}
        >
          <Text style={styles.declineButtonText}>No, continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.acceptButton]} 
          onPress={() => handleResponse(true)}
        >
          <Text style={styles.acceptButtonText}>Yes, take a break</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: 15,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F7E8D3',
    marginLeft: 10,
  },
  message: {
    fontSize: 16,
    color: '#F7E8D3',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  declineButton: {
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
  },
  acceptButton: {
    backgroundColor: '#00C853',
  },
  declineButtonText: {
    color: '#F7E8D3',
    fontSize: 15,
    fontWeight: '600',
  },
  acceptButtonText: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: 'bold',
  }
});

export default BreakPrompt;