import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  FlatList
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import modalStyles from '../../styles/TaskInputStyles';

const SubtaskItem = ({ item, onEdit, onDelete, onAddMicrotask }) => (
  <View style={modalStyles.subtaskItem}>
    <View style={modalStyles.subtaskContent}>
      <Text style={modalStyles.subtaskItemText} numberOfLines={2}>
        {item.text}
      </Text>
      <View style={modalStyles.subtaskActions}>
        <TouchableOpacity
          style={modalStyles.subtaskActionButton}
          onPress={() => onAddMicrotask(item)}
        >
          <FontAwesome name="plus-circle" size={16} color="#FF6347" />
        </TouchableOpacity>
        <TouchableOpacity
          style={modalStyles.subtaskActionButton}
          onPress={() => onEdit(item)}
        >
          <FontAwesome name="pencil" size={16} color="#f7e8d3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={modalStyles.subtaskActionButton}
          onPress={() => onDelete(item.id)}
        >
          <FontAwesome name="trash" size={16} color="#f7e8d3" />
        </TouchableOpacity>
      </View>
    </View>
    {item.microtasks?.length > 0 && (
      <View style={modalStyles.microtasksList}>
        {item.microtasks.map((microtask, index) => (
          <View key={microtask.id} style={modalStyles.microtaskItem}>
            <Text style={modalStyles.microtaskText}>
              {index + 1}. {microtask.text}
            </Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

const BreakdownInputModal = ({
  visible,
  onClose,
  onSave,
  task,
  editingItem = null,
  parentId = null
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [isAddingMicrotask, setIsAddingMicrotask] = useState(false);
  const [selectedParentSubtask, setSelectedParentSubtask] = useState(null);

  useEffect(() => {
    if (visible) {
      if (editingItem) {
        setText(editingItem.text);
      }
      if (task?.subtasks) {
        setSubtasks(task.subtasks);
      }
    } else {
      setText('');
      setEditingSubtask(null);
      setIsAddingMicrotask(false);
      setSelectedParentSubtask(null);
    }
  }, [visible, editingItem, task]);

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const newItem = {
        id: editingSubtask?.id || Date.now().toString(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };

      if (isAddingMicrotask && selectedParentSubtask) {
        const updatedSubtasks = subtasks.map(subtask => {
          if (subtask.id === selectedParentSubtask.id) {
            return {
              ...subtask,
              microtasks: [...(subtask.microtasks || []), newItem]
            };
          }
          return subtask;
        });
        setSubtasks(updatedSubtasks);
      } else if (editingSubtask) {
        const updatedSubtasks = subtasks.map(subtask =>
          subtask.id === editingSubtask.id ? { ...subtask, text: text.trim() } : subtask
        );
        setSubtasks(updatedSubtasks);
      } else {
        setSubtasks([...subtasks, newItem]);
      }

      setText('');
      setEditingSubtask(null);
      setIsAddingMicrotask(false);
      setSelectedParentSubtask(null);

      // If we're done editing all subtasks, save and close
      if (!isAddingMicrotask && !editingSubtask) {
        await onSave(subtasks);
        onClose();
      }
    } catch (error) {
      console.error('Error saving subtask:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMicrotask = (parentSubtask) => {
    setIsAddingMicrotask(true);
    setSelectedParentSubtask(parentSubtask);
    setText('');
  };

  const handleEditSubtask = (subtask) => {
    setEditingSubtask(subtask);
    setText(subtask.text);
    setIsAddingMicrotask(false);
  };

  const handleDeleteSubtask = (subtaskId) => {
    setSubtasks(subtasks.filter(s => s.id !== subtaskId));
  };

  const getModalTitle = () => {
    if (isAddingMicrotask) {
      return t('subtaskModal.addMicrotask');
    }
    if (editingSubtask) {
      return t('subtaskModal.editSubtask');
    }
    return t('subtaskModal.addSubtask');
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.headerBar} />
            
            <ScrollView
              bounces={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={modalStyles.scrollViewContent}
            >
              <View style={modalStyles.contentContainer}>
                <Text style={modalStyles.title}>{getModalTitle()}</Text>

                {isAddingMicrotask && selectedParentSubtask && (
                  <View style={modalStyles.parentSubtaskInfo}>
                    <Text style={modalStyles.parentSubtaskLabel}>Parent Subtask:</Text>
                    <Text style={modalStyles.parentSubtaskText}>
                      {selectedParentSubtask.text}
                    </Text>
                  </View>
                )}

                <TextInput
                  style={[modalStyles.breakdownInput, { minHeight: 100 }]}
                  placeholder={t('subtaskModal.enterDescription')}
                  placeholderTextColor="rgba(247,232,211,0.5)"
                  value={text}
                  onChangeText={setText}
                  multiline
                  numberOfLines={4}
                  autoFocus
                />

                {subtasks.length > 0 && !isAddingMicrotask && !editingSubtask && (
                  <View style={modalStyles.subtasksList}>
                    <Text style={modalStyles.subtasksHeader}>
                      {t('subtaskModal.currentSubtasks')} ({subtasks.length})
                    </Text>
                    {subtasks.map(subtask => (
                      <SubtaskItem
                        key={subtask.id}
                        item={subtask}
                        onEdit={handleEditSubtask}
                        onDelete={handleDeleteSubtask}
                        onAddMicrotask={handleAddMicrotask}
                      />
                    ))}
                  </View>
                )}

                <View style={modalStyles.actionButtons}>
                  <TouchableOpacity
                    style={[modalStyles.button, modalStyles.cancelButton]}
                    onPress={() => {
                      if (isAddingMicrotask || editingSubtask) {
                        setIsAddingMicrotask(false);
                        setEditingSubtask(null);
                        setText('');
                      } else {
                        onClose();
                      }
                    }}
                  >
                    <Text style={modalStyles.buttonText}>
                      {(isAddingMicrotask || editingSubtask) ? t('common.back') : t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      modalStyles.button,
                      modalStyles.submitButton,
                      !text.trim() && modalStyles.buttonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!text.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#1a1a1a" />
                    ) : (
                      <Text style={[modalStyles.buttonText, modalStyles.submitButtonText]}>
                        {editingSubtask ? t('common.save') : t('common.add')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BreakdownInputModal;