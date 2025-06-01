import { StyleSheet, Platform } from 'react-native';
import { SCREEN_HEIGHT } from '../constants/dimensions'; // You'll need to create this constant

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.70)', // Reduced opacity for a lighter background
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // Added top padding for header
  },
  fullscreenRemindersArea: {
    flex: 1,
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
  },
  footerContainer: {
    paddingHorizontal: 25, // Increased from 22
    paddingVertical: 16, // Increased from 14
    backgroundColor: 'transparent',
    borderRadius: 28, // Increased from 25
    marginHorizontal: 10,
    marginBottom: 16, // Increased from 14
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(247, 232, 211, 0.12)',
    position: 'absolute',
    bottom: 12, // Moved slightly higher
    left: 0,
    right: 0,
    alignSelf: 'center',
    width: '95%', // Slightly wider
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0, // Ensure it's behind everything
  },
  footerBackgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0, // Ensure it's behind everything
  },
  verticalDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
    marginLeft: 10, // Reduced space before divider
    marginRight: 10, // Added space after divider
  },
  reflectionIcon: {
    width: 24, 
    height: 24,
    tintColor: '#F7e8d3',
  },
  premiumFeatureButton: {
    opacity: 0.8,
    backgroundColor: 'rgba(247, 232, 211, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumFeatureContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 24, // Ensure the content is centered
    height: 24, // Match the icon size
  },
  premiumStar: {
    position: 'absolute',
    top: -9, // Adjusted for larger icon
    right: -13, // Adjusted for larger icon
    opacity: 1,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    fontSize: 15, // Increased from default
  },
  premiumLabel: {
    position: 'absolute',
    bottom: -7, // Adjusted for larger button
    fontSize: 9, // Increased from 8
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  menuButton: {
    padding: 8,
    borderRadius: 12,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#f7e8d3",
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(247, 232, 211, 0.8)",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  headerSeparator: {
    height: 1,
    backgroundColor: 'rgba(247, 232, 211, 0.1)',
    marginBottom: 15,
    width: '100%',
  },
  remindersArea: {
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    borderRadius: 16, // More modern rounded corners
    borderColor: "rgba(247, 232, 211, 0.15)", // Subtle border
    borderWidth: 1,
    padding: 16,
    marginBottom: 15,
    width: '94%',
    flex: 1,
    minHeight: 200,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  remindersList: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  noRemindersText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(247, 232, 211, 0.7)",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9, // Increased from 8
    paddingHorizontal: 14, // Increased from 12
    borderRadius: 14, // Increased from 12
    backgroundColor: 'rgba(247, 232, 211, 0.12)',
    minWidth: 120, // Increased from 110
    height: 44, // Increased from 40
  },
  navigationContainer: {
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  navigationButtonText: {
    color: '#F7e8d3',
    marginLeft: 9, // Increased from 8
    fontSize: 15, // Increased from 14
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12, // Increased from 10
    marginBottom: 14, // Increased from 12
  },
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 14,
  },
  notesButtonText: {
    color: '#F7e8d3',
    fontSize: 16,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
  },
  toggleButtonText: {
    color: '#F7e8d3',
    fontSize: 16,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  betaVersionText: {
    color: 'rgba(247, 232, 211, 0.5)',
    fontSize: 10,
    fontWeight: "500",
    textAlign: 'center',
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    letterSpacing: 0.5,
  },
  helpButton: {
    padding: 8,
    borderRadius: 12,
    zIndex: 1,
  },
  helpButtonText: {
    color: '#F7e8d3',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12, // Increased from 10
    justifyContent: 'space-between',
  },
  leftButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure even spacing
    width: 'auto', // Let it take the necessary width
  },
  mainButton: { // Renamed from 'button' to 'mainButton'
    backgroundColor: '#1a1a1a',
    borderColor: '#F7e8d3',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '40%',
  },
  mainButtonText: { // Renamed from 'buttonText' to 'mainButtonText'
    color: "#F7e8d3",
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  addButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10, // Increased from 10
    paddingHorizontal: 10, // Increased from 12
    borderRadius: 14, // Increased from 12
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44, // Increased from 40
    height: 44, // Increased from 40
  },
  squareButton: {
    backgroundColor: 'rgba(247, 232, 211, 0.12)',
    paddingVertical: 10.5, // Increased from 10
    paddingHorizontal: 10.5, // Increased from 10
    borderRadius: 14, // Increased from 12
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44, // Increased from 40
    height: 44, // Increased from 40
    marginRight: 12, // Increased from 10
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7e8d3',
  },
  loadingText: {
    color: "#1a1a1a",
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  alertModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f7e8d3",
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  alertModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f7e8d3',
    marginBottom: 10,
  },
  alertModalText: {
    fontSize: 16,
    color: '#f7e8d3',
    textAlign: 'center',
    marginBottom: 20,
  },
  alertModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  alertModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  alertModalButtonNo: {
    backgroundColor: '#FF6347',
  },
  alertModalButtonYes: {
    backgroundColor: '#4CAF50',
  },
  alertModalButtonText: {
    color: '#f7e8d3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  taskInputModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  taskInputModalContent: {
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 250,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  taskInputModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F7e8d3',
    marginBottom: 15,
    textAlign: 'center',
  },
  taskInputModalField: {
    backgroundColor: 'rgba(247, 232, 211, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#F7e8d3',
    fontSize: 16,
    marginBottom: 16,
  },
  taskItemWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    marginBottom: 13,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16, // Add horizontal margin for spacing
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    color: 'rgba(247, 232, 211, 0.5)',
  },
  taskInputModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskInputModalButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  taskInputModalButtonText: {
    color: '#F7e8d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    maxHeight: 150,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 15,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247, 232, 211, 0.3)',
  },
  suggestionText: {
    color: '#F7e8d3',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalScrollContent: {  // Add this style
    paddingBottom: 40,
  },
  headerBar: {
    width: 40,
    height: 4,
    backgroundColor: '#f7e8d3',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    padding: 20,
    flexGrow: 1, // Add this to ensure content expands
  },

  // Modal Title and Input
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f7e8d3',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalTaskNameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#f7e8d3',
    fontSize: 16,
    marginBottom: 20,
    width: '100%',
  },
  modalSectionTitle: { // Renamed from 'sectionTitle' to 'modalSectionTitle'
    fontSize: 16,
    fontWeight: '600',
    color: '#f7e8d3',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionButton: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
    height: 70,
    justifyContent: 'center',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(255, 99, 71, 0.3)',
    borderColor: '#FF6347',
    borderWidth: 1,
  },
  optionText: {
    color: '#f7e8d3',
    marginTop: 8,
    fontSize: 14,
  },

  // Collapsible Section Styles
  collapsibleSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  sectionHeaderActive: {
    backgroundColor: 'rgba(255, 99, 71, 0.2)',
    borderColor: '#FF6347',
    borderWidth: 1,
  },
  sectionHeaderText: {
    color: '#f7e8d3',
    fontSize: 16,
    fontWeight: '600',
  },
  collapsibleContent: {
    overflow: 'hidden',
    marginTop: 8,
  },

  // Carousel Styles
  carouselContainerMain: { // Renamed from 'carouselContainer' to 'carouselContainerMain'
    paddingVertical: 8,
  },
  carouselOptionMain: { // Renamed from 'carouselOption' to 'carouselOptionMain'
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselOptionSelectedMain: { // Renamed from 'carouselOptionSelected' to 'carouselOptionSelectedMain'
    backgroundColor: 'rgba(255, 99, 71, 0.2)',
    borderColor: '#FF6347',
    borderWidth: 1,
  },
  carouselContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselText: {
    color: '#f7e8d3',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  intervalNumber: {
    color: '#f7e8d3',
    fontSize: 24,
    fontWeight: '700',
  },

  // Deadline Section
  deadlineContainerMain: { // Renamed from 'deadlineContainer' to 'deadlineContainerMain'
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  dateButtonMain: { // Renamed from 'dateButton' to 'dateButtonMain'
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  dateTextMain: { // Renamed from 'dateText' to 'dateTextMain'
    color: '#f7e8d3',
    fontSize: 16,
    textAlign: 'center',
  },
  resetDateButton: {
    backgroundColor: 'rgba(255, 99, 71, 0.3)',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },

  // Subtask Styles
  subtaskContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  subtaskInputMain: { // Renamed from 'subtaskInput' to 'subtaskInputMain'
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#f7e8d3',
    fontSize: 14,
    marginBottom: 6,
    paddingRight: 40,
  },
  subtaskMicroInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#f7e8d3',
    fontSize: 14,
  },
  deleteSubtaskButtonMain: { // Renamed from 'deleteSubtaskButton' to 'deleteSubtaskButtonMain'
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 4,
  },
  addSubtaskButtonMain: { // Renamed from 'addSubtaskButton' to 'addSubtaskButtonMain'
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  addSubtaskButtonText: {
    color: '#f7e8d3',
    fontSize: 14,
    fontWeight: '600',
  },

  // Action Buttons
  actionButtonsContainer: { // Renamed from 'actionButtons' to 'actionButtonsContainer'
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  cancelButtonMain: { // Renamed from 'cancelButton' to 'cancelButtonMain'
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: { // Renamed from 'buttonText' to 'actionButtonText'
    color: '#f7e8d3',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#1a1a1a',
  },

  // Enhanced Suggestions
  enhancedSuggestionsContainer: { // Renamed from 'suggestionsContainer' to 'enhancedSuggestionsContainer'
    maxHeight: 150,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 10,
    marginTop: -15,
    marginBottom: 15,
  },
  enhancedSuggestionItem: { // Renamed from 'suggestionItem' to 'enhancedSuggestionItem'
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  enhancedSuggestionText: { // Renamed from 'suggestionText' to 'enhancedSuggestionText'
    color: '#f7e8d3',
    fontSize: 14,
  },
  
  // Modal Layout 
  modalContentMain: { // Renamed from 'modalContent' to 'modalContentMain'
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  compactCarouselContainer: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  compactCarouselOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginRight: 12,
    width: 120, // Add fixed width
    height: 80, // Add fixed height
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCarouselOptionSelected: {
    backgroundColor: 'rgba(255,99,71,0.2)',
    borderColor: '#FF6347',
    borderWidth: 1,
  },
  
  // Task Section
  taskSection: { // Renamed from 'section' to 'taskSection'
    marginBottom: 24,
    width: '100%',
  },
  taskSectionTitle: { // Renamed from 'sectionTitle' to 'taskSectionTitle'
    color: '#F7e8d3',
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryDateButton: { // Renamed from 'dateButton' to 'secondaryDateButton'
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(247,232,211,0.1)',
  },
  secondaryDateText: { // Renamed from 'dateText' to 'secondaryDateText'
    color: '#F7e8d3',
    fontSize: 14,
  },
  
  // Subtask Component
  subtaskHeaderMain: { // Renamed from 'subtaskHeader' to 'subtaskHeaderMain'
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskRowMain: { // Renamed from 'subtaskRow' to 'subtaskRowMain'
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subtaskRowInput: { // Renamed from 'subtaskInput' to 'subtaskRowInput'
    flex: 1,
    backgroundColor: 'rgba(247,232,211,0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#F7e8d3',
    fontSize: 14,
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  
  // Additional Carousel Components
  carouselSectionContainer: { // Renamed from 'carouselContainer' to 'carouselSectionContainer'
    paddingVertical: 8,
    paddingRight: 16,
  },
  carouselSectionOption: { // Renamed from 'carouselOption' to 'carouselSectionOption'
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(247,232,211,0.1)',
  },
  carouselSectionOptionSelected: { // Renamed from 'carouselOptionSelected' to 'carouselSectionOptionSelected'
    backgroundColor: 'rgba(255,99,71,0.2)',
    borderColor: '#FF6347',
    borderWidth: 1,
  },
  
  // Deadline Components
  deadlineSection: { // Renamed from 'section' to 'deadlineSection'
    marginBottom: 16,
  },
  deadlineSectionTitle: { // Renamed from 'sectionTitle' to 'deadlineSectionTitle'
    color: '#F7e8d3',
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  deadlineContainerSecondary: { // Renamed from 'deadlineContainer' to 'deadlineContainerSecondary'
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deadlineDateButton: { // Renamed from 'dateButton' to 'deadlineDateButton'
    flex: 1,
    backgroundColor: 'rgba(247,232,211,0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deadlineDateText: { // Renamed from 'dateText' to 'deadlineDateText'
    color: '#F7e8d3',
    fontSize: 14,
  },
  deadlineResetButton: { // Renamed from 'resetDateButton' to 'deadlineResetButton'
    backgroundColor: 'rgba(255,99,71,0.3)',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Task Item Components
  compactTaskItemWrapper: { // Renamed from 'taskItemWrapper' to 'compactTaskItemWrapper'
    width: '100%',
    marginBottom: 8, // Reduced from 12
  },
  regularTask: {
    backgroundColor: "#1a1a1a",
    borderLeftWidth: 1, // Reduced from 2
    borderLeftColor: "#f7e8d3",
    borderRadius: 6,
  },
  highestPriorityTask: {
    backgroundColor: "#f7e8d3",
    borderLeftWidth: 1, // Reduced from 2
    borderLeftColor: "#1a1a1a",
    borderRadius: 6,
  },
  taskDetails: {
    flex: 1,
    marginBottom: 8, // Reduced from 12
  },
  mainContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Changed from flex-start
    marginBottom: 4, // Reduced from 8
  },
  taskTextContainer: {
    flex: 1,
    marginRight: 8, // Reduced from 12
  },
  rightContentContainer: {
    flexDirection: 'row', // Changed to row
    alignItems: 'center',
    gap: 6, // Reduced from 8
  },
  taskItemText: {
    fontSize: 14, // Reduced from 15
    fontWeight: "500", // Reduced from 600
    letterSpacing: 0.1, // Reduced from 0.2
    marginBottom: 2, // Reduced from 4
  },
  regularText: {
    color: "#f7e8d3",
  },
  highestPriorityText: {
    color: "#1a1a1a",
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6, // Reduced from 8
  },
  taskSubtitle: {
    fontSize: 11, // Reduced from 12
    fontStyle: 'italic',
    opacity: 0.7, // Reduced from 0.8
  },
  reminderIntervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)', // Reduced opacity
    borderRadius: 4, // Reduced from 12
    paddingHorizontal: 6, // Reduced from 8
    paddingVertical: 2, // Reduced from 4
    gap: 4, // Reduced from 6
  },
  priorityFlagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)', // Reduced opacity
    paddingHorizontal: 6, // Reduced from 8
    paddingVertical: 2, // Reduced from 4
    borderRadius: 4, // Reduced from 12
    gap: 4, // Reduced from 6
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8, // Reduced from 12
    paddingTop: 6, // Reduced from 8
    borderTopWidth: 1,
    borderTopColor: 'rgba(247, 232, 211, 0.05)', // Reduced opacity
  },
  taskActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8, // Reduced from 10
    paddingHorizontal: 12, // Reduced from 16
    borderRadius: 4, // Reduced from 8
    gap: 6, // Reduced from 8
  },
  actionButtonHighPriority: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)', // Reduced opacity
  },
  actionButtonRegular: {
    backgroundColor: 'rgba(247, 232, 211, 0.05)', // Reduced opacity
  },
  taskActionButtonText: {
    fontSize: 12, // Reduced from 14
    fontWeight: '500', // Reduced from 600
  },
  // Subtask styles
  subtasksContainer: {
    marginTop: 12, // Reduced from 16
  },
  subtasksDivider: {
    height: 1,
    backgroundColor: 'rgba(247,232,211,0.05)', // Reduced opacity
    marginBottom: 12, // Reduced from 16
  },
  subtaskListItem: {
    marginBottom: 8, // Reduced from 12
    borderRadius: 4, // Reduced from 8
  },
  subtaskRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8, // Reduced from 12
  },
  subtaskNumber: {
    width: 20, // Reduced from 24
    fontSize: 14, // Reduced from 16
    fontWeight: '500', // Reduced from 600
  },
  subtaskText: {
    flex: 1,
    fontSize: 13, // Reduced from 15
    fontWeight: '400', // Reduced from 500
  },
  microtasksList: {
    paddingLeft: 28, // Reduced from 36
    paddingRight: 8, // Reduced from 12
    paddingBottom: 8, // Reduced from 12
  },
  microtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Reduced from 8
  },
  microtaskText: {
    fontSize: 12, // Reduced from 14
    opacity: 0.7, // Reduced from 0.8
  },
  editSubtasksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6, // Reduced from 8
    paddingVertical: 8, // Reduced from 12
    marginTop: 2, // Reduced from 4
    borderRadius: 4, // Reduced from 8
  },
  contentRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  dividerHighPriority: {
    backgroundColor: 'rgba(26, 26, 26, 0.2)',
  },
  dividerRegular: {
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
  },
  flagIconWrapper: {
    paddingHorizontal: 4,
  },
  tagIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 4,
  },
  tagsContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tagBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tagBadgeRegular: {
    backgroundColor: 'rgba(247, 232, 211, 0.1)',
  },
  tagBadgeHighPriority: {
    backgroundColor: 'rgba(26, 26, 26, 0.1)',
  },
  tagIcon: { 
    opacity: 0.9,
  },
  
  // Help Modal Overlay and modals
  helpModalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(247, 232, 211, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  helpModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
    height: 'auto',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  helpHeaderBar: {
    width: 40,
    height: 4,
    backgroundColor: '#f7e8d3',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  helpScrollView: {
    flex: 1,
  },
  helpScrollViewContent: {
    paddingBottom: 20,
  },
  helpModalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  helpSection: {
    marginBottom: 24,
  },
  helpSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  helpSectionText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 16,
  },
  featureItem: {
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7e8d3',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(247, 232, 211, 0.8)',
    lineHeight: 20,
  },
  navigationList: {
    marginTop: 8,
  },
  navigationItem: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 20,
  },
  tipsList: {
    marginTop: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(247, 232, 211, 0.1)',
  }
});

export default styles;