import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";

const TaskListToggle = ({ onPress, mode }) => {
  const getIcon = () => {
    switch (mode) {
      case 'current':
        return 'tasks';
      case 'completed':
        return 'check-circle';
      case 'future':
        return 'clock-o';
      default:
        return 'tasks';
    }
  };

  return (
    <TouchableOpacity style={styles.toggleButton} onPress={onPress}>
      <FontAwesome name={getIcon()} size={24} color="#F7e8d3" />
      <Text style={styles.toggleText}>
        {mode === 'current' ? 'Current' : mode === 'completed' ? 'Completed' : 'Future'} Quests
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(150, 69, 19, 0.7)',
    padding: 10,
    borderRadius: 20,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  toggleText: {
    color: '#F7e8d3',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskListToggle;