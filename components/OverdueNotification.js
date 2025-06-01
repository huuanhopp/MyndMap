import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';

const OverdueNotification = ({ 
  visible, 
  overdueTasksCount, 
  overdueTasks = [],
  onCarryOver, 
  onDelete 
}) => {
  const { t } = useTranslation();
  
  // Animation refs and state setup remain the same
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const [isExpanded, setIsExpanded] = useState(false);

  // Animation effects remain the same
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 8
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      setIsExpanded(false);
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  }, [visible]);

  // Toggle expand function remains the same
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(expandAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  };

  // Updated to use correct translation keys
  const handleCarryOver = () => {
    onCarryOver();
    Alert.alert(
      t('overdueNotification.alerts.carryOverSuccess.title'),
      t('overdueNotification.alerts.carryOverSuccess.message')
    );
  };

  // Updated to use correct translation keys
  const showDeleteAlert = () => {
    Alert.alert(
      t('overdueNotification.alerts.deleteConfirm.title'),
      t('overdueNotification.alerts.deleteConfirm.message'),
      [
        { 
          text: t('overdueNotification.alerts.deleteConfirm.cancel'), 
          style: 'cancel' 
        },
        { 
          text: t('overdueNotification.alerts.deleteConfirm.confirm'), 
          onPress: onDelete, 
          style: 'destructive' 
        }
      ]
    );
  };

  // Animation interpolations remain the same
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
    extrapolate: 'clamp'
  });

  const expandHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(overdueTasks.length * 65 + 40, 300)]
  });

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.content}>
        {/* Header - Updated translation key */}
        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <FontAwesome name="exclamation-circle" size={24} color="#FF6347" />
          </View>
          <Text style={styles.text}>
            {t(`overdueNotification.taskAttention.${overdueTasksCount === 1 ? 'single' : 'plural'}`, { count: overdueTasksCount })}
          </Text>
        </View>

        {/* Expand button */}
        <TouchableOpacity style={styles.expandButton} onPress={toggleExpand}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <FontAwesome name="chevron-down" size={16} color="#f7e8d3" />
          </Animated.View>
        </TouchableOpacity>

        {/* Expandable content */}
        <Animated.View style={[styles.expandableContent, { height: expandHeight }]}>
          <View style={styles.taskListContainer}>
            {overdueTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskItemContent}>
                  <FontAwesome name="circle" size={6} color="#f7e8d3" style={styles.bullet} />
                  <View style={styles.taskDetails}>
                    <Text style={styles.taskText} numberOfLines={2}>
                      {task.text}
                    </Text>
                    {task.scheduledFor && (
                      <Text style={styles.dateText}>
                        {t('overdueNotification.dueDate', {
                          date: new Date(task.scheduledFor).toLocaleDateString()
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Help text - Updated translation key */}
        <Text style={styles.helpText}>
          {t('overdueNotification.helpText')}
        </Text>

        {/* Action buttons - Updated translation keys */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.carryOverButton]} 
            onPress={handleCarryOver}
          >
            <FontAwesome name="arrow-right" size={14} color="#f7e8d3" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {t('overdueNotification.buttons.carryOver')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]} 
            onPress={showDeleteAlert}
          >
            <FontAwesome name="trash" size={14} color="#f7e8d3" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {t('overdueNotification.buttons.delete')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#f7e8d3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    marginTop: 40,
    padding: 16,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    color: '#f7e8d3',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  expandButton: {
    alignSelf: 'center',
    padding: 8,
  },
  expandableContent: {
    overflow: 'hidden',
    width: '100%',
  },
  taskListContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(247, 232, 211, 0.1)',
  },
  taskItem: {
    marginVertical: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(247, 232, 211, 0.05)',
    borderRadius: 6,
  },
  taskItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    marginTop: 6,
    marginRight: 8,
  },
  taskDetails: {
    flex: 1,
  },
  taskText: {
    color: '#f7e8d3',
    fontSize: 14,
    lineHeight: 20,
  },
  dateText: {
    color: '#f7e8d3',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    fontStyle: 'italic',
  },
  helpText: {
    color: '#f7e8d3',
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f7e8d3',
    marginHorizontal: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  carryOverButton: {
    backgroundColor: '#1a1a1a',
  },
  deleteButton: {
    backgroundColor: '#FF6347',
  },
  buttonText: {
    color: '#f7e8d3',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OverdueNotification;