import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import modalStyles from '../styles/TaskInputStyles';

const SubtaskComponent = ({ subtask, index, onUpdate, onDelete }) => (
  <View style={modalStyles.subtaskRow}>
    <TextInput
      style={modalStyles.subtaskInput}
      placeholder="Add step..."
      placeholderTextColor="#999"
      value={subtask.text}
      onChangeText={(text) => onUpdate(index, text)}
      autoFocus={!subtask.text}
    />
    <TouchableOpacity
      style={modalStyles.deleteSubtaskButton}
      onPress={() => onDelete(index)}
    >
      <FontAwesome name="times" size={14} color="#F7e8d3" />
    </TouchableOpacity>
  </View>
);

export default React.memo(SubtaskComponent);