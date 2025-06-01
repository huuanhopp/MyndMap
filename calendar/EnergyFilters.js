import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import styles from '../styles/CalendarScreenStyles.js';

const EnergyFilters = ({ taskFilter, setTaskFilter, isCalendarCollapsed, toggleCalendarCollapse, t }) => {
  // Task categories for filtering
  const taskCategories = [
    { id: 'all', name: t('calendarScreen.filters.all'), color: '#95A5A6' },
    { id: 'high', name: t('calendarScreen.energyLevels.high'), color: '#FF6B6B' },
    { id: 'medium', name: t('calendarScreen.energyLevels.medium'), color: '#4ECDC4' },
    { id: 'low', name: t('calendarScreen.energyLevels.low'), color: '#95A5A6' }
  ];

  return (
    <View style={styles.filterContainer}>
      <View style={styles.filterHeaderRow}>
        <Text style={styles.filterLabel}>{t('calendarScreen.filterByEnergy')}</Text>
        <TouchableOpacity 
          style={styles.collapseButton}
          onPress={toggleCalendarCollapse}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessible={true}
          accessibilityLabel={isCalendarCollapsed ? "Expand calendar" : "Collapse calendar"}
          accessibilityRole="button"
          accessibilityHint={isCalendarCollapsed ? "Shows the full calendar view" : "Hides the calendar to show more tasks"}
        >
          <FontAwesome 
            name={isCalendarCollapsed ? "calendar-plus-o" : "calendar-minus-o"} 
            size={18} 
            color="#F7e8d3" 
          />
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.energyFilters}
        contentContainerStyle={styles.energyFiltersContent}
      >
        {taskCategories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterButton,
              taskFilter === category.id && styles.activeFilter,
              { borderColor: category.color }
            ]}
            onPress={() => setTaskFilter(category.id)}
          >
            <View style={[styles.filterDot, { backgroundColor: category.color }]} />
            <Text style={[
              styles.filterButtonText,
              taskFilter === category.id && styles.activeFilterText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default EnergyFilters;