import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";

const TaskModal = ({ task, visible, onClose }) => {
  if (!visible || !task) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Subtasks</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="times" size={24} color="#f7e8d3" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.subtasksList}>
            {task.subtasks?.map((subtask, index) => (
              <View key={subtask.id || index} style={styles.subtaskItem}>
                <Text style={styles.subtaskNumber}>{index + 1}.</Text>
                <View style={styles.subtaskContent}>
                  <Text style={styles.subtaskText}>{subtask.text}</Text>
                  {subtask.microtasks?.map((microtask, mIndex) => (
                    <Text key={microtask.id || mIndex} style={styles.microtaskText}>
                      • {microtask.text}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#f7e8d3',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247, 232, 211, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f7e8d3',
  },
  subtasksList: {
    padding: 16,
  },
  subtaskItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  subtaskNumber: {
    color: '#f7e8d3',
    fontSize: 16,
    width: 30,
  },
  subtaskContent: {
    flex: 1,
  },
  subtaskText: {
    color: '#f7e8d3',
    fontSize: 16,
    marginBottom: 8,
  },
  microtaskText: {
    color: '#f7e8d3',
    fontSize: 14,
    opacity: 0.8,
    marginLeft: 16,
    marginBottom: 4,
  },
});

export default TaskModal;