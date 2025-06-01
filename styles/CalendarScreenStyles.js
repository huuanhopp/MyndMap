import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#F7e8d3',
    fontSize: 16,
    marginTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#F7e8d3',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#F7e8d3',
    opacity: 0.8,
    textAlign: 'center',
  },
  headerSeparator: {
    height: 1,
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  calendarOptionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  optionButtonText: {
    color: '#F7e8d3',
    fontSize: 12,
    marginLeft: 4,
  },
  calendarContainer: {
    paddingHorizontal: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  selectedDateHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F7e8d3',
  },
  taskCountText: {
    fontSize: 14,
    color: '#F7e8d3',
    opacity: 0.8,
    marginTop: 4,
  },
  taskListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 80, // Extra space for floating button
  },
  taskListContent: {
    paddingBottom: 16,
  },
  itemSeparator: {
    height: 8,
  },
  calendarTaskItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    marginBottom: 8,
    // Add more specific styles for calendar task items
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4682B4', // Steel blue
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  timeBlocksContainer: {
    flex: 1,
  },
  timeBlock: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247, 232, 211, 0.1)',
    paddingVertical: 4,
  },
  timeLabel: {
    width: 60,
    color: '#F7e8d3',
    opacity: 0.8,
    fontSize: 12,
    paddingTop: 4,
    paddingRight: 8,
    textAlign: 'right',
  },
  timeBlockContent: {
    flex: 1,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(247, 232, 211, 0.2)',
  },
  timeSlotTask: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 4,
    padding: 8,
    marginVertical: 2,
    marginRight: 8,
    borderLeftWidth: 3,
  },
  timeSlotTaskText: {
    color: '#F7e8d3',
    fontSize: 14,
  },
  agendaView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  agendaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F7e8d3',
    marginBottom: 8,
  },
  agendaLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  labelItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  labelText: {
    color: '#F7e8d3',
    fontSize: 12,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#F7e8d3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  addTaskButton: {
    backgroundColor: 'rgba(70, 130, 180, 0.7)', // Steel blue with opacity
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addTaskButtonText: {
    color: '#F7e8d3',
    fontWeight: '600',
  },
  
  // Neurodivergent-friendly UI enhancements
  // These styles help with visual processing and focus
  
  // High contrast between text and background
  highContrastText: {
    color: '#F7e8d3',
    fontWeight: '500',
  },
  
  // Reduced motion for animations
  reducedMotionContainer: {
    // To be used when accessibility settings indicate reduced motion
  },
  
  // Clear visual hierarchy with spacing
  taskSeparator: {
    height: 12, // More space between items for visual clarity
  },
  
  // Focus assistance styles
  focusHighlight: {
    borderWidth: 2,
    borderColor: '#FFD700', // Gold color for focused elements
    borderRadius: 8,
  },
  
  // Enhanced touch targets for motor control issues
  enhancedTouchArea: {
    minHeight: 48, // Minimum 48dp touch target as per accessibility guidelines
    minWidth: 48,
  },
});

export default styles;