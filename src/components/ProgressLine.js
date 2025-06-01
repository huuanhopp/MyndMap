import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ProgressLine = ({ score, metrics }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#FFC107', '#f44336']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.progressBar}
      >
        <View style={[styles.marker, { left: `${score}%` }]} />
      </LinearGradient>

      <View style={styles.metricsContainer}>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: metric.color }]} />
            <View>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderRadius: 12,
    margin: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginBottom: 20,
    position: 'relative',
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F7e8d3',
    borderWidth: 3,
    borderColor: '#1a1a1a',
    top: -6,
    marginLeft: -12,
  },
  metricsContainer: {
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
  metricLabel: {
    color: '#F7e8d3',
    fontSize: 12,
    opacity: 0.8,
  },
  metricValue: {
    color: '#F7e8d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressLine;