import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Animated
} from 'react-native';
import Slider from '@react-native-community/slider';
import { FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const IntervalSlider = ({ 
  value = 15, 
  onChange,
  minValue = 1,
  maxValue = 120,
  step = 1,
  containerStyle,
  activeColor = '#F7E8D3',
  accentColor = '#00C853',
  textColor = '#F7E8D3',
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [isEditingCustomValue, setIsEditingCustomValue] = useState(false);
  const [customValueText, setCustomValueText] = useState(value.toString());
  const inputRef = useRef(null);
  
  // Animation for break info
  const breakInfoOpacity = useRef(new Animated.Value(0)).current;
  const breakInfoTranslateY = useRef(new Animated.Value(10)).current;
  
  // Ensure the value is updated when the prop changes
  useEffect(() => {
    setCurrentValue(value);
    setCustomValueText(value.toString());
  }, [value]);

  // Handle value change
  const handleValueChange = (newValue) => {
    setCurrentValue(newValue);
    setCustomValueText(newValue.toString());
  };

  // Handle value change complete (when the user releases the slider)
  const handleValueChangeComplete = (newValue) => {
    setCurrentValue(newValue);
    setCustomValueText(newValue.toString());
    if (onChange) {
      onChange(newValue);
    }
  };

  // Handle custom value input
  const handleCustomValueChange = (text) => {
    // Only allow numbers
    if (/^\d*$/.test(text)) {
      setCustomValueText(text);
    }
  };

  // Handle custom value submission
  const handleCustomValueSubmit = () => {
    const numValue = parseInt(customValueText, 10);
    
    // Validate the input
    if (isNaN(numValue)) {
      // Reset to current value if invalid
      setCustomValueText(currentValue.toString());
      setIsEditingCustomValue(false);
      return;
    }
    
    // Clamp the value between min and max
    const clampedValue = Math.max(minValue, Math.min(maxValue, numValue));
    
    // Update the state and notify parent component
    setCurrentValue(clampedValue);
    setCustomValueText(clampedValue.toString());
    setIsEditingCustomValue(false);
    
    if (onChange) {
      onChange(clampedValue);
    }
  };

  // Start editing custom value
  const startCustomValueEdit = () => {
    setIsEditingCustomValue(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Generate more focused and cleaner tick marks for the intervals
  const renderTickMarks = () => {
    const ticks = [];
    
    // Generate major ticks at key focus-friendly intervals
    const majorTickValues = [1, 15, 30, 45, 60, 90];
    
    // Filter out tick values that are outside our min/max range
    const validMajorTicks = majorTickValues.filter(
      tickValue => tickValue >= minValue && tickValue <= maxValue
    );
    
    // Calculate positions as percentages of the slider width
    validMajorTicks.forEach(tickValue => {
      const position = ((tickValue - minValue) / (maxValue - minValue)) * 100;
      
      ticks.push(
        <View 
          key={`tick-${tickValue}`} 
          style={[
            styles.tickContainer,
            {
              position: 'absolute',
              left: `${position}%`,
              alignItems: 'center'
            }
          ]}
        >
          <View 
            style={[
              styles.tick, 
              { 
                backgroundColor: tickValue <= currentValue ? activeColor : 'rgba(247,232,211,0.3)',
                height: 12,
                width: 2,
              }
            ]} 
          />
          <Text 
            style={[
              styles.tickLabel, 
              { 
                color: textColor,
                opacity: tickValue <= currentValue ? 1 : 0.7
              }
            ]}
          >
            {tickValue}
          </Text>
        </View>
      );
    });
    
    return (
      <View style={styles.ticksContainer}>
        {ticks}
      </View>
    );
  };

  // Presets for quick selection - simplified and focused
  const presets = [5, 15, 30, 60];

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Current Value Display at the top for better visibility */}
      <View style={styles.valueContainer}>
        {isEditingCustomValue ? (
          <View style={styles.customInputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.customInput}
              value={customValueText}
              onChangeText={handleCustomValueChange}
              keyboardType="number-pad"
              onBlur={handleCustomValueSubmit}
              onSubmitEditing={handleCustomValueSubmit}
              maxLength={3} // Limit to 3 digits
              selectTextOnFocus
              autoFocus
            />
            <Text style={styles.customInputUnit}>min</Text>
            <TouchableOpacity 
              style={styles.customInputDone} 
              onPress={handleCustomValueSubmit}
            >
              <Text style={styles.customInputDoneText}>Set</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={startCustomValueEdit}
            style={styles.valueTextContainer}
          >
            <View style={styles.valueTextWrapper}>
              <Text style={[styles.valueText, { color: textColor }]}>
                {currentValue}
              </Text>
              <Text style={[styles.valueUnit, { color: textColor }]}>
                minutes
              </Text>
              <FontAwesome 
                name="pencil" 
                size={12} 
                color="rgba(247,232,211,0.6)" 
                style={styles.editIcon} 
              />
            </View>
            <Text style={styles.editIndicatorText}>tap to edit</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Simplified Preset Buttons - more minimal and focused */}
      <View style={styles.presetsContainer}>
        {presets.map(preset => (
          <TouchableOpacity
            key={`preset-${preset}`}
            style={[
              styles.presetButton,
              currentValue === preset && { backgroundColor: accentColor }
            ]}
            onPress={() => {
              handleValueChange(preset);
              handleValueChangeComplete(preset);
            }}
          >
            <Text 
              style={[
                styles.presetText, 
                currentValue === preset && { color: '#1a1a1a', fontWeight: '700' }
              ]}
            >
              {preset}m
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Custom button - simplified */}
        <TouchableOpacity
          style={[
            styles.presetButton,
            styles.customButton,
            isEditingCustomValue && { backgroundColor: accentColor }
          ]}
          onPress={startCustomValueEdit}
        >
          <Text 
            style={[
              styles.presetText, 
              isEditingCustomValue && { color: '#1a1a1a', fontWeight: '700' }
            ]}
          >
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      {/* Slider Component */}
      <Slider
        style={styles.slider}
        value={currentValue}
        minimumValue={minValue}
        maximumValue={maxValue}
        step={step}
        minimumTrackTintColor={activeColor}
        maximumTrackTintColor="rgba(247,232,211,0.2)"
        thumbTintColor={Platform.OS === 'android' ? accentColor : undefined}
        thumbStyle={Platform.OS === 'ios' ? { backgroundColor: accentColor } : undefined}
        onValueChange={handleValueChange}
        onSlidingComplete={handleValueChangeComplete}
      />
      
      {/* Tick Marks */}
      {renderTickMarks()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  slider: {
    width: width * 0.85, // Reduced from 0.9 to 0.85 to provide more margin
    height: 40,
    marginTop: 10,
  },
  ticksContainer: {
    width: width * 0.85, // Match the slider width
    height: 30,
    position: 'relative',
  },
  tickContainer: {
    alignItems: 'center',
  },
  tick: {
    backgroundColor: 'rgba(247,232,211,0.5)',
    height: 10,
    width: 1,
  },
  tickLabel: {
    fontSize: 10,
    marginTop: 2,
    color: '#F7E8D3',
  },
  valueContainer: {
    marginTop: 0,
    marginBottom: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    minWidth: 140,
    alignItems: 'center',
  },
  valueTextContainer: {
    alignItems: 'center',
  },
  valueTextWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    position: 'relative',
  },
  valueText: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  valueUnit: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.8,
    marginLeft: 8,
  },
  editIcon: {
    marginLeft: 8,
  },
  editIndicatorText: {
    fontSize: 10,
    color: 'rgba(247,232,211,0.6)',
    fontStyle: 'italic',
    marginTop: 6,
  },
  presetsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    width: width * 0.85, // Match the slider width
  },
  presetButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 6,
    minWidth: 44,
    alignItems: 'center',
  },
  customButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  presetText: {
    color: '#F7E8D3',
    fontSize: 14,
    fontWeight: '500',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F7E8D3',
    textAlign: 'center',
    minWidth: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247,232,211,0.5)',
    padding: 0,
  },
  customInputUnit: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.8,
    color: '#F7E8D3',
    marginLeft: 8,
  },
  customInputDone: {
    marginLeft: 15,
    backgroundColor: 'rgba(247,232,211,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  customInputDoneText: {
    color: '#F7E8D3',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default IntervalSlider;