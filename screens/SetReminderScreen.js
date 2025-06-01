import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../hooks/userHook.js"; // Ensure this path is correct
import { db } from "./firebaseConfig.js"; // Ensure this path is correct
import { collection, addDoc } from "firebase/firestore";

const SetReminderScreen = () => {
  const navigation = useNavigation();
  const { userInformation } = useUser();
  const [reminderText, setReminderText] = useState("");

  const handleSaveReminder = async () => {
    if (!reminderText.trim()) {
      Alert.alert("Error", "Please enter a reminder.");
      return;
    }

    try {
      await addDoc(collection(db, "reminders"), {
        text: reminderText,
        userId: userInformation.uid,
        createdAt: new Date(),
      });
      Alert.alert("Success", "Reminder saved successfully!");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error saving reminder:", error);
      Alert.alert("Error", "Failed to save reminder.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a New Reminder</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your reminder"
        placeholderTextColor="#1a1a1a"
        onChangeText={setReminderText}
        value={reminderText}
      />
      <TouchableOpacity style={styles.button} onPress={handleSaveReminder}>
        <Text style={styles.buttonText}>Save Reminder</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SetReminderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f7e8d3",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f7e8d3",
    color: "#1a1a1a",
    fontSize: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#f7e8d3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#1a1a1a",
    fontSize: 18,
  },
});
