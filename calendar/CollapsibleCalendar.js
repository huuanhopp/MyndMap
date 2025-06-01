import React from 'react';
import { Animated } from 'react-native';
import { Calendar } from 'react-native-calendars';
import styles from '../styles/CalendarScreenStyles';

const CollapsibleCalendar = ({ calendarHeight, markedDates, selected, onDayPress }) => {
  return (
    <Animated.View style={[styles.calendarWrapper, { height: calendarHeight }]}>
      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'rgba(0,0,0,0.4)',
          textSectionTitleColor: '#F7e8d3',
          selectedDayBackgroundColor: '#FF6347',
          selectedDayTextColor: '#1a1a1a',
          todayTextColor: '#FF6347',
          dayTextColor: '#F7e8d3',
          textDisabledColor: 'rgba(247, 232, 211, 0.3)',
          dotColor: '#FF6347',
          selectedDotColor: '#1a1a1a',
          arrowColor: '#F7e8d3',
          monthTextColor: '#F7e8d3',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 13
        }}
        onDayPress={onDayPress}
        markedDates={{
          ...markedDates,
          [selected]: {
            selected: true,
            disableTouchEvent: false,
            selectedDotColor: '#1A1A1A',
            dots: markedDates[selected]?.dots || []
          }
        }}
        markingType={'multi-dot'}
        enableSwipeMonths={true}
      />
    </Animated.View>
  );
};

export default CollapsibleCalendar;