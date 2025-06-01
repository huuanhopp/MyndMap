import React from 'react';
import { View, TextInput, TouchableOpacity, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import styles from '../../styles/NotesScreenStyles';

const ENERGY_LEVELS = {
  low: { icon: 'battery-quarter', label: 'Low Focus', color: '#6BCB77' },
  medium: { icon: 'battery-half', label: 'Medium Focus', color: '#FFD93D' },
  high: { icon: 'battery-full', label: 'High Focus', color: '#FF6B6B' }
};

export const NoteInput = ({
    value,
    onChangeText,
    onSubmit,
    category,
    onCategoryPress,
    isEditing,
    onCancel,
    energyLevel = null,
    onEnergyLevelChange = () => {}
  }) => {
    const characterLimit = 280;
    const remainingChars = characterLimit - (value?.length || 0);
  
    const handleSubmit = () => {
      if (!value.trim() || !category || !energyLevel) return;
      onSubmit();
      Keyboard.dismiss();
    };
  
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inputContainer}>
          <View style={styles.inputTopRow}>
            <View style={styles.inputRow}>
              {/* Category Selector */}
              <TouchableOpacity
                style={styles.categoryPill}
                onPress={onCategoryPress}
              >
                <FontAwesome name="tag" size={12} color="#F7E8D3" />
                <Text style={styles.categoryPillText} numberOfLines={1}>
                  {category || 'Category'}
                </Text>
                <FontAwesome name="chevron-down" size={10} color="#F7E8D3" />
              </TouchableOpacity>
  
              {/* Energy Level Selector */}
              <View style={styles.energyLevelContainer}>
                {Object.entries(ENERGY_LEVELS).map(([level, { icon, label, color }]) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.energyLevelButton,
                      energyLevel === level && styles.energyLevelButtonSelected,
                      { borderColor: color }
                    ]}
                    onPress={() => onEnergyLevelChange(level)}
                  >
                    <FontAwesome 
                      name={icon} 
                      size={12} 
                      color={energyLevel === level ? color : '#F7E8D3'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
  
              {/* Add/Save Button */}
              <TouchableOpacity
                style={[styles.addButton, (!category || !energyLevel || !value.trim()) && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={!category || !energyLevel || !value.trim()}
              >
                <FontAwesome 
                  name={isEditing ? "save" : "plus"} 
                  size={14} 
                  color="#F7E8D3" 
                />
              </TouchableOpacity>
            </View>
          </View>
  
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Write your note here..."
            placeholderTextColor="rgba(247, 232, 211, 0.5)"
            multiline
            style={styles.compactNoteInput}
            maxHeight={80}
          />
          
          <View style={styles.bottomRow}>
            <Text style={styles.miniCharacterCount}>
              {remainingChars} characters remaining
            </Text>
            {isEditing && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
              >
                <FontAwesome name="times" size={14} color="#F7E8D3" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };