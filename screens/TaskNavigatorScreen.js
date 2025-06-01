import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import TaskList from './TaskList'; // We'll create this component next

const TaskNavigatorScreen = ({ tasks, onTaskPress, onTaskLongPress }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTasks, setCurrentTasks] = useState([]);
  const [pastTasks, setPastTasks] = useState([]);
  const [futureTasks, setFutureTasks] = useState([]);

  useEffect(() => {
    filterTasks();
  }, [tasks, currentDate]);

  const filterTasks = () => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    const filtered = {
      current: [],
      past: [],
      future: []
    };

    tasks.forEach(task => {
      const taskDate = new Date(task.scheduledFor || task.createdAt);
      taskDate.setHours(0, 0, 0, 0);

      if (taskDate.getTime() === today.getTime() && !task.completed) {
        filtered.current.push(task);
      } else if (taskDate < today || task.completed) {
        filtered.past.push(task);
      } else {
        filtered.future.push(task);
      }
    });

    setCurrentTasks(filtered.current);
    setPastTasks(filtered.past);
    setFutureTasks(filtered.future);
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateNavigation}>
        <TouchableOpacity onPress={() => changeDate(-1)}>
          <FontAwesome name="chevron-left" size={24} color="#F7e8d3" />
        </TouchableOpacity>
        <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
        <TouchableOpacity onPress={() => changeDate(1)}>
          <FontAwesome name="chevron-right" size={24} color="#F7e8d3" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.taskLists}>
        <TaskList
          title="Current Quests"
          tasks={currentTasks}
          onTaskPress={onTaskPress}
          onTaskLongPress={onTaskLongPress}
          emptyMessage="No current quests. Summon new tasks!"
        />
        <TaskList
          title="Future Quests"
          tasks={futureTasks}
          onTaskPress={onTaskPress}
          onTaskLongPress={onTaskLongPress}
          emptyMessage="No future quests scheduled. Long press a quest to schedule it."
        />
        <TaskList
          title="Completed Quests"
          tasks={pastTasks}
          onTaskPress={onTaskPress}
          onTaskLongPress={onTaskLongPress}
          emptyMessage="No completed quests yet. Your achievements shall be recorded here."
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F7e8d3',
    textAlign: 'center',
  },
  taskLists: {
    flex: 1,
  },
});

export default TaskNavigatorScreen;