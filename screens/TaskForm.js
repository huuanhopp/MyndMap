// components/TaskForm.js
import React from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { priorityFlagColors } from '../constants'; // Use the same priority color system
import TaskForm from './components/TaskForm'; // Import the shared TaskForm component


const TaskForm = ({ task, onTaskChange, onDateChange }) => {
  const renderPriorityFlags = () => (
    <View style={styles.priorityFlags}>
      {Object.keys(priorityFlagColors).map((priority) => (
        <TouchableOpacity
          key={priority}
          style={[styles.flag, { backgroundColor: priorityFlagColors[priority] }]}
          onPress={() => onTaskChange({ ...task, priority })}
        />
      ))}
    </View>
  );

  const renderSubtasks = () => (
    <View>
      {task.subtasks.map((subtask, index) => (
        <TextInput
          key={index}
          style={styles.subtaskInput}
          value={subtask.title}
          onChangeText={(text) => {
            const newSubtasks = [...task.subtasks];
            newSubtasks[index].title = text;
            onTaskChange({ ...task, subtasks: newSubtasks });
          }}
        />
      ))}
      <TouchableOpacity
        style={styles.addSubtaskButton}
        onPress={() => onTaskChange({ ...task, subtasks: [...task.subtasks, { title: '' }] })}
      >
        <Text>Add Subtask</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Enter task title"
        value={task.title}
        onChangeText={(text) => onTaskChange({ ...task, title: text })}
      />

      {renderPriorityFlags()}

      <DateTimePicker
        value={task.dueDate}
        mode="date"
        display="default"
        onChange={(event, date) => onDateChange(date)}
      />

      {renderSubtasks()}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  priorityFlags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  flag: {
    width: 30,
    height: 30,
    borderRadius: 5,
  },
  subtaskInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },
  addSubtaskButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default TaskForm;
