// CustomInputModal.js
// Component for free-text input to allow users to express themselves beyond predefined options

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Keyboard,
  Animated,
  Platform
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const CustomInputModal = ({ visible, onClose, onSubmit, title, placeholder }) => {
  const [text, setText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const slideAnim = new Animated.Value(visible ? 0 : 300);
  
  useEffect(() => {
    if (visible) {
      setText('');
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [visible]);
  
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => setKeyboardHeight(e.endCoordinates.height)
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);
  
  const handleSubmit = () => {
    onSubmit(text);
    setText('');
    onClose();
  };
  
  const handleCancel = () => {
    setText('');
    onClose();
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
            { marginBottom: keyboardHeight }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title || 'Share your thoughts'}</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color="#f7e8d3" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.textInput}
            placeholder={placeholder || "What's on your mind?"}
            placeholderTextColor="rgba(247, 232, 211, 0.6)"
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            maxLength={500}
          />
          
          <View style={styles.footer}>
            <Text style={styles.counter}>{text.length}/500</Text>
            <TouchableOpacity
              style={[styles.submitButton, !text.trim() && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={!text.trim()}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f7e8d3'
  },
  closeButton: {
    padding: 5
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 15,
    color: '#f7e8d3',
    minHeight: 150,
    maxHeight: 300,
    textAlignVertical: 'top',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 15
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  counter: {
    color: 'rgba(247, 232, 211, 0.6)',
    fontSize: 14
  },
  submitButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  },
  disabledButton: {
    opacity: 0.5
  }
});

export default CustomInputModal;