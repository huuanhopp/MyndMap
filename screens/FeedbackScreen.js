import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, SafeAreaView } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";

const FeedbackScreen = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (feedback.trim() === '') {
      Alert.alert('Error', 'Please enter your feedback before submitting.');
      return;
    }

    const emailUrl = `mailto:userhelp@myndmap.uk?subject=User Feedback&body=${encodeURIComponent(feedback)}`;
    
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'Unable to open email client');
        } else {
          return Linking.openURL(emailUrl);
        }
      })
      .then(() => {
        setFeedback('');
        Alert.alert('Success', 'Your feedback has been sent. Thank you!');
        onClose();
      })
      .catch((err) => Alert.alert('Error', 'An error occurred while trying to send feedback'));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="times" size={24} color="#F7e8d3" />
          </TouchableOpacity>
          <Text style={styles.title}>Feedback</Text>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.label}>We'd love to hear your thoughts!</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={10}
            placeholder="Enter your feedback here..."
            placeholderTextColor="#999"
            value={feedback}
            onChangeText={setFeedback}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f7e8d3',
  },
  closeButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  label: {
    fontSize: 18,
    color: '#F7e8d3',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#333',
    color: '#F7e8d3',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF6347',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#F7e8d3',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FeedbackScreen;