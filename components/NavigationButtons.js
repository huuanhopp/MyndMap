import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import styles from '../styles/HomeScreenStyles';

const NavigationButtons = ({
  onNotesPress,
  onToggleFutureTasks,
  showFutureTasks
}) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={styles.navigationButton}
        onPress={onNotesPress}
      >
        <FontAwesome name="sticky-note" size={26} color="#F7e8d3" />
        <Text style={styles.navigationButtonText}>
          {t('home.notes')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.navigationButton}
        onPress={onToggleFutureTasks}
      >
        {/* Use eye-off when showing future tasks, eye when showing current */}
        <Ionicons 
          name={showFutureTasks ? "eye-off-outline" : "eye-outline"} 
          size={26} 
          color="#F7e8d3" 
        />
        <Text style={styles.navigationButtonText}>
          {showFutureTasks ? t('home.future') : t('home.current')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(NavigationButtons);