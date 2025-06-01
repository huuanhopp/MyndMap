import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const ProductivityScore = ({ score = 0, metrics = [] }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    // Animate the progress bar when the score changes
    Animated.timing(progressAnim, {
      toValue: score,
      duration: 1000, // Animation duration in milliseconds
      useNativeDriver: false, // `useNativeDriver` must be false for width animations
    }).start();
  }, [score]);

  return (
    <View style={styles.container}>
      {/* Title and Help Button */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Productivity Score</Text>
        <TouchableOpacity onPress={() => setShowHelpModal(true)} style={styles.helpButton}>
          <FontAwesome name="question-circle" size={20} color="#F7e8d3" />
        </TouchableOpacity>
      </View>

      {/* Progress Line */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressFill,
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: '#f7e8d3', // Updated fill color
              }
            ]}
          />
        </View>
        
        <View style={styles.labels}>
          <Text style={styles.label}>0%</Text>
          <Text style={styles.label}>100%</Text>
        </View>
      </View>

      {/* Current Score Caption */}
      <Text style={styles.scoreCaption}>
        Your current score: <Text style={styles.scoreValue}>{score}%</Text>
      </Text>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: metric.color || '#ccc' }]} />
            <View style={styles.metricText}>
              <Text style={styles.metricLabel}>{metric.label || "N/A"}</Text>
              <Text style={styles.metricValue}>{metric.value || "0%"}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What Do These Categories Measure?</Text>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Completion</Text>
              <Text style={styles.modalSectionText}>
                Measures the percentage of tasks you've completed out of the total tasks assigned.
              </Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Consistency</Text>
              <Text style={styles.modalSectionText}>
                Tracks how consistently you complete tasks over time, based on your activity in the last 7 days.
              </Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Recent Activity</Text>
              <Text style={styles.modalSectionText}>
                Reflects your task completion rate in the last week compared to previous weeks.
              </Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Task Balance</Text>
              <Text style={styles.modalSectionText}>
                Evaluates how well you balance tasks of different priorities, penalizing an over-reliance on urgent tasks.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowHelpModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(40,40,40,0.9)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#F7e8d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  helpButton: {
    padding: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: {
    color: 'rgba(247,232,211,0.7)',
    fontSize: 12,
  },
  scoreCaption: {
    color: 'rgba(247,232,211,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    color: '#F7e8d3',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  metricText: {
    flex: 1,
  },
  metricLabel: {
    color: 'rgba(247,232,211,0.8)',
    fontSize: 12,
  },
  metricValue: {
    color: '#F7e8d3',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'rgba(40,40,40,0.95)',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    color: '#F7e8d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    color: '#F7e8d3',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalSectionText: {
    color: 'rgba(247,232,211,0.8)',
    fontSize: 14,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255,99,71,0.2)',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#F7e8d3',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductivityScore;