import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import styles from '../../styles/CalendarScreenStyles';

const CalendarHeader = ({ fadeAnim, onBackPress, onHelpPress, title }) => {
  return (
    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={onBackPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessible={true}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        accessibilityHint="Returns to the previous screen"
      >
        <FontAwesome name="arrow-left" size={24} color="#F7e8d3" />
      </TouchableOpacity>
      
      <Text 
        style={styles.title}
        accessible={true}
        accessibilityRole="header"
      >
        {title}
      </Text>
      
      <TouchableOpacity 
        style={styles.helpButton} 
        onPress={onHelpPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessible={true}
        accessibilityLabel="Help"
        accessibilityRole="button"
        accessibilityHint="Opens help screen with information about calendar features"
      >
        <FontAwesome name="question-circle" size={24} color="#F7e8d3" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CalendarHeader;