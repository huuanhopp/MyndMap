import React from 'react';
import { View, TouchableOpacity, Image, Text, Alert, Platform } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import styles from '../styles/HomeScreenStyles';

const BottomActionButtons = ({
  onProgressPress,
  onAddTaskPress,
}) => {
  const navigation = useNavigation();

  // Handle PRO button click to show device-specific modal
  const handleProButtonClick = () => {
    if (Platform.OS === 'ios') {
      // iOS alert style
      Alert.alert(
        "PRO Feature",
        "This premium feature is coming soon! Stay tuned for subscription options.",
        [{ text: "OK", style: "default" }]
      );
    } else {
      // Android alert style
      Alert.alert(
        "PRO Feature",
        "This premium feature is coming soon! Stay tuned for subscription options.",
        [{ text: "GOT IT" }]
      );
    }
  };

  // Navigate to calendar screen
  const handleCalendarPress = () => {
    navigation.navigate("Calendar");
  };

  return (
    <View style={styles.buttonContainer}>
      <View style={styles.leftButtonGroup}>
        {/* Reflections button with custom image */}
        <TouchableOpacity
          style={styles.squareButton}
          onPress={onProgressPress}
          accessibilityLabel="Progress Reflections"
          accessibilityRole="button"
        >
          <Image
            source={require('../assets/reflections.png')}
            style={styles.reflectionIcon}
          />
        </TouchableOpacity>

        {/* Calendar button */}
        <TouchableOpacity
          style={styles.squareButton}
          onPress={handleCalendarPress}
          accessibilityLabel="Calendar View"
          accessibilityRole="button"
        >
          <FontAwesome name="calendar" size={24} color="#F7e8d3" />
        </TouchableOpacity>

        {/* Premium feature button with lock icon - now same size as others */}
        <TouchableOpacity
          style={styles.squareButton}
          onPress={handleProButtonClick}
          accessibilityLabel="Premium Features"
          accessibilityRole="button"
        >
          <View style={styles.premiumFeatureContent}>
            <FontAwesome name="line-chart" size={24} color="#F7e8d3" />
            <FontAwesome
              name="lock"
              size={12}
              color="#FFD700"
              style={styles.premiumStar}
            />
          </View>
          {/* Premium label */}
          <Text style={styles.premiumLabel}>PRO</Text>
        </TouchableOpacity>
      </View>

      {/* Vertical divider */}
      <View style={styles.verticalDivider} />

      {/* Add button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddTaskPress}
        accessibilityLabel="Add New Task"
        accessibilityRole="button"
      >
        <FontAwesome name="plus" size={24} color="#F7e8d3" />
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(BottomActionButtons);