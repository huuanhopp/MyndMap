// ReminderModal.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getFirestore, collection, addDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import styles from "./TaskModalStyles";

const getFlagColor = (priority) => {
  const colors = {
    Trifle: "#ADD8E6",
    Quest: "#0A5C36",
    Crusade: "#FF8C00",
    Saga: "#FF0000",
  };
  return colors[priority];
};

const ReminderModal = ({
  reminderText,
  setReminderText,
  reminderPriority,
  setReminderPriority,
  repetitionInterval,
  setRepetitionInterval,
  showReminderModal,
  closeReminderModal,
}) => {
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  console.log('ReminderModal props:', {
    reminderText,
    reminderPriority,
    repetitionInterval,
    showReminderModal,
  });

  const handleAddReminder = async () => {
    try {
      setLoading(true);

      if (!reminderText) {
        Alert.alert("Error!", "A nameless reminder is but a whisper in the wind.");
        return;
      }

      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);

        await addDoc(collection(userDocRef, "reminders"), {
          text: reminderText,
          priority: reminderPriority,
          repetitionInterval,
          createdAt: new Date(),
          userId: currentUser.uid,
          completed: false,
        });

        setReminderText("");
        setReminderPriority("Trifle");
        setRepetitionInterval("15");

        closeReminderModal();
      } else {
        Alert.alert("Error", "Sign in - Only those bearing the royal seal may inscribe quests in the tome of destiny.");
      }
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "An error occurred while adding the reminder.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showReminderModal}
        onRequestClose={closeReminderModal}
      >
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            opacity: fadeAnim,
          }}
        />

        <View style={styles.modalContainerBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reminder Title</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="My reminder beckons..."
              placeholderTextColor="#333"
              value={reminderText}
              onChangeText={setReminderText}
            />

            <Text style={styles.priorityLabel}>Priority</Text>
            <View style={styles.prioritySelectionContainer}>
              {["Trifle", "Quest", "Crusade", "Saga"].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={
                    reminderPriority === priority
                      ? [styles.priorityButton, styles.priorityButtonSelected]
                      : styles.priorityButton
                  }
                  onPress={() => setReminderPriority(priority)}
                >
                  <Icon
                    name="flag"
                    size={15}
                    color={
                      reminderPriority === priority
                        ? getFlagColor(priority)
                        : "#f7e8d3"
                    }
                  />
                  <Text style={styles.priorityButtonText}>{priority}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.repetitionLabel}>Repetition Interval</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 15 for every 15 minutes"
              placeholderTextColor="#333"
              value={repetitionInterval}
              onChangeText={setRepetitionInterval}
              keyboardType="numeric"
              returnKeyType="next"
            />

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeReminderModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={handleAddReminder}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Summon!</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableWithoutFeedback>
  );
};

export default ReminderModal;
