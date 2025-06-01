import React from 'react';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import styles from '../styles/CalendarScreenStyles.js';

const AddTaskButton = ({ onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.addTaskButton}
      onPress={onPress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel="Add new task"
      accessibilityRole="button"
      accessibilityHint="Opens form to create a new task for this date"
    >
      <FontAwesome name="plus" size={24} color="#F7e8d3" />
    </TouchableOpacity>
  );
};

export default AddTaskButton;