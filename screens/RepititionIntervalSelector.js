import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styles from './TaskModalStyles';

const RepetitionIntervalSelector = ({ repetitionInterval, setRepetitionInterval }) => {
  console.log('Rendering RepetitionIntervalSelector with:', { repetitionInterval });

  const handleIntervalPress = (interval) => {
    console.log('Selected interval:', interval);
    setRepetitionInterval(interval);
  };

  return (
    <View style={styles.repetitionSelectionContainer}>
      {['Daily', 'Weekly', 'Monthly'].map((interval) => (
        <TouchableOpacity
          key={interval}
          style={
            repetitionInterval === interval
              ? [styles.repetitionButton, styles.repetitionButtonSelected]
              : styles.repetitionButton
          }
          onPress={() => handleIntervalPress(interval)}
        >
          <Text style={styles.repetitionButtonText}>{interval}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RepetitionIntervalSelector;
