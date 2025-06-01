import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import styles from '../../styles/NotesScreenStyles';

const ENERGY_LEVELS = {
    low: { icon: 'battery-quarter', label: 'Low Focus', color: '#6BCB77' },
    medium: { icon: 'battery-half', label: 'Medium Focus', color: '#FFD93D' },
    high: { icon: 'battery-full', label: 'High Focus', color: '#FF6B6B' }
  };
  
  export const NoteItem = ({ note, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentLimit = 100;
    const isLongContent = note.content.length > contentLimit;
    
    // Animation values
    const fadeIn = useRef(new Animated.Value(0)).current;
    const textFade = useRef(new Animated.Value(1)).current;
    const energyFade = useRef(new Animated.Value(1)).current;
    
    useEffect(() => {
      // Initial fade in animation
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, []);
  
    // Animate text changes
    useEffect(() => {
      Animated.sequence([
        Animated.timing(textFade, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(textFade, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }, [note.content]);
  
    // Animate energy level changes
    useEffect(() => {
      Animated.sequence([
        Animated.timing(energyFade, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(energyFade, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }, [note.energyLevel]);
  
    const getTimeSince = (date) => {
      const now = new Date();
      const createdDate = new Date(date);
      const diffInHours = Math.floor((now - createdDate) / (1000 * 60 * 60));
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return createdDate.toLocaleDateString();
    };
  
    const energyInfo = ENERGY_LEVELS[note.energyLevel];
    const displayContent = isExpanded ? note.content : 
      isLongContent ? `${note.content.substring(0, contentLimit)}...` : note.content;

    const handleDeleteWithAnimation = async () => {
        // Start fade out animation
        Animated.timing(fadeIn, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // Call the actual delete function after animation
          onDelete(note.id);
        });
      };
  
    return (
      <Animated.View 
        style={[
          styles.noteItemContainer, 
          styles[`category${note.category.replace(/\s+/g, '')}`],
          { opacity: fadeIn }
        ]}
      >
        <View style={styles.noteMetaContainer}>
          <View style={styles.leftMeta}>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>{note.category}</Text>
            </View>
            {energyInfo && (
              <Animated.View 
                style={[
                  styles.energyIndicator, 
                  { borderColor: energyInfo.color, opacity: energyFade }
                ]}
              >
                <FontAwesome 
                  name={energyInfo.icon} 
                  size={10} 
                  color={energyInfo.color} 
                />
              </Animated.View>
            )}
          </View>
          <View style={styles.timeContainer}>
            <FontAwesome name="clock-o" size={10} color="#F7E8D3" style={styles.timeIcon} />
            <Text style={styles.timeText}>{getTimeSince(note.createdAt)}</Text>
          </View>
        </View>
  
        <TouchableOpacity 
          onPress={() => isLongContent && setIsExpanded(!isExpanded)}
          activeOpacity={isLongContent ? 0.7 : 1}
        >
          <Animated.Text style={[styles.noteText, { opacity: textFade }]}>
            {displayContent}
          </Animated.Text>
          {isLongContent && (
            <Text style={styles.readMoreText}>
              {isExpanded ? 'Show less' : 'Read more'}
            </Text>
          )}
        </TouchableOpacity>
  
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => onEdit(note)} style={styles.actionButton}>
            <FontAwesome name="pencil" size={12} color="#F7E8D3" />
          </TouchableOpacity>
          <TouchableOpacity 
  onPress={handleDeleteWithAnimation} 
  style={[styles.actionButton, styles.deleteButton]}
>
  <FontAwesome name="trash-o" size={10} color="#FF6347" />
</TouchableOpacity>
        </View>
      </Animated.View>
    );
  };