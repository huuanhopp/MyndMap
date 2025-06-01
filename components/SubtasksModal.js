import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import ParticleAnimation from '../screens/ParticleAnimation';

const SubtaskModal = ({ visible, onClose, onSave, task }) => {
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [subtaskText, setSubtaskText] = useState('');
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [microtaskText, setMicrotaskText] = useState('');
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editingMicrotask, setEditingMicrotask] = useState(null);
  const [isSubtaskInputFocused, setIsSubtaskInputFocused] = useState(false);
  const [isMicrotaskInputFocused, setIsMicrotaskInputFocused] = useState(false);
  const animatedValues = useRef({});

  useEffect(() => {
    if (task) {
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  useEffect(() => {
    subtasks.forEach(subtask => {
      if (!animatedValues.current[subtask.id]) {
        animatedValues.current[subtask.id] = new Animated.Value(0);
      }
      
      const isExpanded = selectedSubtask?.id === subtask.id;
      Animated.timing(animatedValues.current[subtask.id], {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    });
  }, [subtasks, selectedSubtask]);

  const handleSubtaskToggle = useCallback((subtask) => {
    setSelectedSubtask(selectedSubtask?.id === subtask.id ? null : subtask);
    
    if (!animatedValues.current[subtask.id]) {
      animatedValues.current[subtask.id] = new Animated.Value(0);
    }
    
    Animated.timing(animatedValues.current[subtask.id], {
      toValue: selectedSubtask?.id === subtask.id ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [selectedSubtask]);

  const handleAddSubtask = () => {
    if (!subtaskText.trim()) return;
    
    const newSubtask = {
      id: Date.now().toString(),
      text: subtaskText.trim(),
      completed: false,
      microtasks: []
    };
    
    setSubtasks([...subtasks, newSubtask]);
    setSubtaskText('');
  };

  const handleEditSubtask = (subtask) => {
    setEditingSubtask(subtask);
    setSubtaskText(subtask.text);
  };

  const handleUpdateSubtask = () => {
    if (!subtaskText.trim() || !editingSubtask) return;
    
    setSubtasks(subtasks.map(subtask => 
      subtask.id === editingSubtask.id 
        ? { ...subtask, text: subtaskText.trim() }
        : subtask
    ));
    setSubtaskText('');
    setEditingSubtask(null);
  };

  const handleDeleteSubtask = (id) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== id));
    if (selectedSubtask?.id === id) {
      setSelectedSubtask(null);
      setMicrotaskText('');
    }
  };

  const handleAddMicrotask = () => {
    if (!microtaskText.trim() || !selectedSubtask) return;

    const newMicrotask = {
      id: Date.now().toString(),
      text: microtaskText.trim(),
      completed: false
    };

    setSubtasks(subtasks.map(subtask => 
      subtask.id === selectedSubtask.id
        ? { ...subtask, microtasks: [...(subtask.microtasks || []), newMicrotask] }
        : subtask
    ));
    setMicrotaskText('');
  };

  const handleEditMicrotask = (subtaskId, microtask) => {
    setEditingMicrotask({ subtaskId, ...microtask });
    setMicrotaskText(microtask.text);
  };

  const handleUpdateMicrotask = () => {
    if (!microtaskText.trim() || !editingMicrotask) return;

    setSubtasks(subtasks.map(subtask => 
      subtask.id === editingMicrotask.subtaskId
        ? {
            ...subtask,
            microtasks: subtask.microtasks.map(m =>
              m.id === editingMicrotask.id
                ? { ...m, text: microtaskText.trim() }
                : m
            )
          }
        : subtask
    ));
    setMicrotaskText('');
    setEditingMicrotask(null);
  };

  const handleDeleteMicrotask = (subtaskId, microtaskId) => {
    setSubtasks(subtasks.map(subtask => 
      subtask.id === subtaskId
        ? { 
            ...subtask, 
            microtasks: subtask.microtasks.filter(m => m.id !== microtaskId)
          }
        : subtask
    ));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ParticleAnimation count={20} />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerBar} />
            <View style={styles.headerContent}>
              <Text style={styles.title}>Break Down Task</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <FontAwesome name="times" size={24} color="#f7e8d3" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                isSubtaskInputFocused && styles.inputFocused,
                editingSubtask && styles.editingContainer
              ]}
              placeholder="Add a step..."
              placeholderTextColor="rgba(247,232,211,0.5)"
              value={subtaskText}
              onChangeText={setSubtaskText}
              onSubmitEditing={editingSubtask ? handleUpdateSubtask : handleAddSubtask}
              onFocus={() => setIsSubtaskInputFocused(true)}
              onBlur={() => setIsSubtaskInputFocused(false)}
            />
            <TouchableOpacity 
              style={[styles.addButton, (subtaskText.trim().length > 0) && styles.activeButton]}
              onPress={editingSubtask ? handleUpdateSubtask : handleAddSubtask}
            >
              <FontAwesome 
                name={editingSubtask ? "check" : "plus"} 
                size={20} 
                color="#f7e8d3" 
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.subtasksList}>
            {subtasks.map(subtask => {
              const isExpanded = selectedSubtask?.id === subtask.id;
              
              if (!animatedValues.current[subtask.id]) {
                animatedValues.current[subtask.id] = new Animated.Value(0);
              }

              return (
                <View key={subtask.id} style={styles.subtaskContainer}>
                  <View style={styles.subtaskHeader}>
                    <TouchableOpacity 
                      style={styles.subtaskTitle}
                      onPress={() => setSelectedSubtask(
                        selectedSubtask?.id === subtask.id ? null : subtask
                      )}
                    >
                      <FontAwesome 
                        name={selectedSubtask?.id === subtask.id ? "chevron-down" : "chevron-right"} 
                        size={16} 
                        color="#f7e8d3" 
                      />
                      <Text style={styles.subtaskText}>{subtask.text}</Text>
                    </TouchableOpacity>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleEditSubtask(subtask)}
                      >
                        <FontAwesome name="pencil" size={16} color="#f7e8d3" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleDeleteSubtask(subtask.id)}
                      >
                        <FontAwesome name="trash" size={16} color="#f7e8d3" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Animated.View 
                    style={[
                      styles.microtasksContainer,
                      { 
                        maxHeight: animatedValues.current[subtask.id].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, isExpanded ? 1000 : 0]
                        }),
                        opacity: animatedValues.current[subtask.id].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1]
                        })
                      }
                    ]}
                  >
                    <View style={styles.microtaskInput}>
                      {isExpanded && (
                        <>
                          <TextInput
                            style={[
                              styles.input,
                              isMicrotaskInputFocused && styles.inputFocused,
                              editingMicrotask && styles.editingContainer
                            ]}
                            placeholder="Add a note..."
                            placeholderTextColor="rgba(247,232,211,0.5)"
                            value={microtaskText}
                            onChangeText={setMicrotaskText}
                            onSubmitEditing={editingMicrotask ? handleUpdateMicrotask : handleAddMicrotask}
                            onFocus={() => setIsMicrotaskInputFocused(true)}
                            onBlur={() => setIsMicrotaskInputFocused(false)}
                          />
                          <TouchableOpacity 
                            style={[styles.addButton, (microtaskText.trim().length > 0) && styles.activeButton]}
                            onPress={editingMicrotask ? handleUpdateMicrotask : handleAddMicrotask}
                          >
                            <FontAwesome 
                              name={editingMicrotask ? "check" : "plus"} 
                              size={20} 
                              color="#f7e8d3" 
                            />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>

                    {subtask.microtasks?.map(microtask => (
                      <View key={microtask.id} style={styles.microtaskItem}>
                        <Text style={styles.microtaskText}>{microtask.text}</Text>
                        {isExpanded && (
                          <View style={styles.microtaskActions}>
                            <TouchableOpacity 
                              style={styles.actionButton}
                              onPress={() => handleEditMicrotask(subtask.id, microtask)}
                            >
                              <FontAwesome name="pencil" size={16} color="#f7e8d3" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.actionButton}
                              onPress={() => handleDeleteMicrotask(subtask.id, microtask.id)}
                            >
                              <FontAwesome name="trash" size={16} color="#f7e8d3" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))}
                  </Animated.View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.footerButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.footerButton, styles.saveButton]}
              onPress={() => {
                onSave(subtasks);
                onClose();
              }}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F7e8d3',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: '#f7e8d3',
    zIndex: 2,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247,232,211,0.1)',
    paddingBottom: 12,
  },
  headerBar: {
    width: 32,
    height: 4,
    backgroundColor: '#f7e8d3',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
    opacity: 0.5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f7e8d3',
  },
  closeButton: {
    padding: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(247,232,211,0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#f7e8d3',
    fontSize: 15,
  },
  inputFocused: {
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  editingContainer: {
    backgroundColor: 'rgba(255,99,71,0.1)',
    borderWidth: 1,
    borderColor: '#FF6347',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(247,232,211,0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(255,99,71,0.3)',
    borderWidth: 1,
    borderColor: '#FF6347',
  },
  subtasksList: {
    padding: 12,
    maxHeight: '50%',
  },
  subtaskContainer: {
    marginBottom: 8,
  },
  subtaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(247,232,211,0.1)',
    padding: 12,
    borderRadius: 8,
  },
  subtaskTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subtaskText: {
    color: '#f7e8d3',
    fontSize: 15,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(247,232,211,0.1)',
  },
  microtasksContainer: {
    paddingLeft: 16,
    marginTop: 8,
  },
  microtaskInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  microtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(247,232,211,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  microtaskText: {
    color: '#f7e8d3',
    fontSize: 14,
    flex: 1,
  },
  microtaskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(247,232,211,0.1)',
  },
  footerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(247,232,211,0.1)',
  },
  saveButton: {
    backgroundColor: '#FF6347',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7e8d3',
  },
  saveButtonText: {
    color: '#1a1a1a',
  },
  microtasksContainer: {
    paddingLeft: 16,
    marginTop: 8,
    opacity: 0, // Start with 0 opacity
  },
  microtaskInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    overflow: 'hidden', // Add this
  },
  microtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(247,232,211,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    overflow: 'hidden', // Add this
  },
});

export default SubtaskModal;