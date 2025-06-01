import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const TaskCompletionAlert = ({ message, isVisible, onDismiss }) => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial value for opacity: 0

  useEffect(() => {
    try {
      if (isVisible) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 750,
          useNativeDriver: true,
        }).start(() => onDismiss && onDismiss());
      }
    } catch (error) {
      console.error("Error in TaskCompletionAlert animation:", error);
      // Optionally call onDismiss or handle the error in another way
    }
  }, [isVisible, fadeAnim, onDismiss]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.alertBox}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  message: {
    textAlign: "center",
    fontSize: 18,
    color: "#1a1a1a",
  },
});

export default TaskCompletionAlert;
