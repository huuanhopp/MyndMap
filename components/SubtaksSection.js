import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import modalStyles from '../styles/TaskInputStyles';

const SubtasksSection = ({
  localSubtasks = [], // Provide default empty array
  handleAddSubtask,
  handleUpdateSubtask,
  handleDeleteSubtask,
  scrollViewRef,
  MAX_SUBTASKS = 5 // Default to 5 if not provided
}) => {
  const { t } = useTranslation();
  
  // Ensure localSubtasks is an array
  const subtasks = Array.isArray(localSubtasks) ? localSubtasks : [];
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 20}
      style={modalStyles.subtasksContainer}
    >
      <View style={modalStyles.subtaskHeader}>
        <Text style={modalStyles.sectionTitle}>
          {t('taskModal.steps')} ({subtasks.length}/{MAX_SUBTASKS})
        </Text>
        {(subtasks.length < MAX_SUBTASKS) && (
          <TouchableOpacity
            style={modalStyles.iconButton}
            onPress={handleAddSubtask}
          >
            <FontAwesome name="plus" size={16} color="#F7e8d3" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView>
        {subtasks.map((subtask, index) => (
          <View key={subtask.id || index} style={modalStyles.subtaskRow}>
            <TextInput
              style={modalStyles.subtaskInput}
              placeholder={t('taskModal.enterStep')}
              placeholderTextColor="rgba(247,232,211,0.5)"
              value={subtask.text}
              onChangeText={(text) => handleUpdateSubtask(index, text)}
              onFocus={() => {
                if (scrollViewRef && scrollViewRef.current) {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }
              }}
            />
            <TouchableOpacity
              style={modalStyles.iconButton}
              onPress={() => handleDeleteSubtask(index)}
            >
              <FontAwesome name="trash" size={16} color="#F7e8d3" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SubtasksSection;