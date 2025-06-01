import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import ProductivityScore from './ProductivityScore';

const SCREEN_WIDTH = Dimensions.get('window').width;

const StatCard = ({ value, label, trend, isLoading, highlight, description }) => (
  <View style={[styles.statCard, highlight && styles.highlightedCard]}>
    {isLoading ? (
      <ActivityIndicator size="small" color="#F7e8d3" />
    ) : (
      <>
        <View style={styles.statHeader}>
          <Text style={styles.statValue}>{value}</Text>
          {trend !== undefined && (
            <View style={styles.trendIndicator}>
              <FontAwesome 
                name={trend > 50 ? "arrow-up" : "arrow-down"} // Show "up" if completion > 50%
                size={16} 
                color={trend > 50 ? "#4CAF50" : "#f44336"} 
              />
              <Text style={styles.trendValue}>{Math.round(trend)}%</Text>
            </View>
          )}
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        {description && <Text style={styles.statDescription}>{description}</Text>}
      </>
    )}
  </View>
);

export const StatsDisplay = ({ stats, isLoading }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('overview');
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const sections = {
    overview: {
      title: "Overview",
      stats: [
        {
          value: stats.totalTasks,
          label: "Total Tasks",
          trend: stats.weeklyGrowth,
          highlight: true
        },
        {
          value: `${stats.completionRate}%`,
          label: "Success Rate",
          description: "Based on last 30 days"
        }
      ]
    },
    patterns: {
      title: "Patterns",
      stats: [
        {
          value: stats.productivity.mostProductiveTime || "N/A", // Fallback if empty
          label: "Peak Hours",
          description: "You're most effective during this time"
        },
        {
          value: stats.productivity.averageTasksPerDay || "N/A", // Fallback if empty
          label: "Daily Average",
          trend: stats.dailyAverageTrend
        }
      ]
    },
    score: {
      title: "Score",
      stats: [
        {
          component: (
            <ProductivityScore 
              score={stats.productivity.score || 0} // Fallback if empty
              metrics={stats.productivity.metrics || []} // Fallback if empty
            />
          ),
          fullWidth: true
        }
      ]
    }
  };

  const changeSection = (section) => {
    if (section === activeSection) return;

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();

    const sectionIndex = Object.keys(sections).indexOf(section);
    const xOffset = sectionIndex * (SCREEN_WIDTH - 64);
    scrollViewRef.current?.scrollTo({ x: xOffset, animated: true });
    
    setActiveSection(section);
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.sectionTabs}>
        {Object.keys(sections).map(section => (
          <TouchableOpacity
            key={section}
            onPress={() => changeSection(section)}
            activeOpacity={0.7}
            style={[styles.sectionTab, activeSection === section && styles.activeTab]}
          >
            <Text style={[styles.sectionTabText, activeSection === section && styles.activeTabText]}>
              {sections[section].title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Carousel */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
        >
          {Object.entries(sections).map(([sectionKey, section]) => (
            <Animated.View
              key={sectionKey}
              style={[
                styles.carouselPage,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.statsContainer}>
                {section.stats.map((stat, index) => (
                  stat.component ? (
                    <View key={index} style={stat.fullWidth && styles.fullWidthComponent}>
                      {stat.component}
                    </View>
                  ) : (
                    <StatCard
                      key={index}
                      {...stat}
                      isLoading={isLoading}
                    />
                  )
                ))}
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F7e8d3',
  },
  sectionTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
    gap: 8,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(255,99,71,0.2)',
  },
  sectionTabText: {
    color: '#F7e8d3',
    opacity: 0.7,
    fontSize: 14,
    textAlign: 'center',
  },
  activeTabText: {
    opacity: 1,
    fontWeight: '600',
  },
  carouselContainer: {
    overflow: 'hidden',
    width: SCREEN_WIDTH - 64,
  },
  carouselPage: {
    width: SCREEN_WIDTH - 64,
  },
  statsContainer: {
    width: '100%',
    gap: 12,
  },
  statCard: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  highlightedCard: {
    backgroundColor: 'rgba(255,99,71,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,99,71,0.2)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F7e8d3',
  },
  statLabel: {
    fontSize: 14,
    color: '#F7e8d3',
    opacity: 0.8,
  },
  statDescription: {
    fontSize: 12,
    color: '#F7e8d3',
    opacity: 0.6,
    marginTop: 4,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendValue: {
    fontSize: 12,
    marginLeft: 4,
    color: '#F7e8d3',
  },
  fullWidthComponent: {
    width: '100%',
    marginBottom: 16,
  },
});

export default StatsDisplay;