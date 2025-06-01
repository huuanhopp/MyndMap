import { StyleSheet, Platform, Dimensions, StatusBar } from 'react-native';
const { width, height } = Dimensions.get('window');
const circleSize = Math.sqrt(width * width + height * height) * 2;

export default StyleSheet.create({
  // Container and Background
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  particleLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#F7E8D3',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 3,
  },
  keyboardView: {
    flex: 1,
    zIndex: 3,
  },
  
  // Collapsible Input Section
  inputSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inputSectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputHeaderIcon: {
    marginRight: 8,
  },
  inputHeaderText: {
    color: '#F7E8D3',
    fontSize: 16,
    fontWeight: '500',
  },
  expandableContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  
  // FAB - Floating Action Button
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 10,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F7E8D3',
    textAlign: 'center',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 8,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(247, 232, 211, 0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F7E8D3',
    fontSize: 16,
    height: 44,
  },

  // Filter Tabs
  filterTabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilterTab: {
    borderBottomColor: '#FF6347',
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
  },
  filterTabText: {
    color: '#F7E8D3',
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FF6347',
  },

  // Groceries Styling
  groceryPreview: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  groceryPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  groceryPreviewText: {
    color: '#FF6347',
    fontSize: 11,
    fontWeight: '500',
  },

  // Category Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: '#F7E8D3',
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 26, 26, 0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalCloseIcon: {
    padding: 5,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247, 232, 211, 0.1)',
    minHeight: 50,
  },
  selectedCategory: {
    backgroundColor: 'rgba(255, 99, 71, 0.15)',
  },
  categoryIcon: {
    marginRight: 12,
  },
  categoryOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    flex: 1,
  },
  selectedCategoryText: {
    color: '#FF6347',
    fontWeight: '600',
  },

  // Category Indicator
  categoryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  categoryIndicatorText: {
    color: '#F7E8D3',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 15,
  },
  categorySelectorText: {
    color: '#F7E8D3',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 'auto',
  },

  // Input Section
  inputSection: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(247, 232, 211, 0.1)',
  },
  inputSectionFocused: {
    borderColor: 'rgba(255, 99, 71, 0.5)',
  },
  inputContainer: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  inputTopRow: {
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  
  // Notes Add Section
  addButton: {
    backgroundColor: '#FF6347',
    padding: 8,
    borderRadius: 8,
    marginLeft: 45,
  },
  cancelButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  
  // Notes Input
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#F7E8D3',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  compactNoteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    color: '#F7E8D3',
    fontSize: 14,
    maxHeight: 80,
  },
  
  // Notes List
  notesList: {
    flex: 1,
  },
  notesListContent: {
    paddingBottom: 80,
  },
  
  // Note Item Styles
  noteItemContainer: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  noteItem: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  
  // Note Header
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteItemCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Category & Time Info
  noteMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    maxWidth: '70%',
  },
  categoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 6,
  },
  categoryText: {
    color: '#F7E8D3',
    fontSize: 12,
    paddingTop: 6,
    fontWeight: '600',
    opacity: 0.9,
  },
  categoryLabel: {
    color: '#F7E8D3',
    fontSize: 10,
    fontWeight: '500',
  },
  
  // Priority & Energy Indicators
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  energyIndicator: {
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.3)',
  },
  energyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
  },
  
  // Time & Date
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    color: '#F7E8D3',
    fontSize: 11,
    opacity: 0.9,
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  timeBadgeText: {
    color: '#F7E8D3',
    fontSize: 10,
    marginLeft: 4,
  },
  noteDate: {
    color: '#F7E8D3',
    fontSize: 11,
    opacity: 0.7,
  },
  dateText: {
    color: '#F7E8D3',
    fontSize: 11,
    opacity: 0.7,
  },
  
  // Note Content
  noteContent: {
    color: '#F7E8D3',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  
  // Action Buttons
  notesActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    opacity: 0.8,
  },
  noteActionButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteItemActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  miniButton: {
    backgroundColor: 'rgba(255, 99, 71, 0.2)',
    padding: 6,
    borderRadius: 8,
  },
  
  // Read More Feature
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#FF6347',
    fontSize: 12,
    fontWeight: '500',
  },
  readMoreIcon: {
    marginLeft: 4,
  },
  
  // Energy Level Selection
  energyLevelContainer: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  energyLevelButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    marginHorizontal: 4,
    backgroundColor: 'rgba(26, 26, 26, 0.4)',
    borderColor: 'rgba(247, 232, 211, 0.3)',
  },
  energyLevelButtonSelected: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 1,
  },
  energyLevelTooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    top: -30,
  },
  energyLevelTooltipText: {
    color: '#F7E8D3',
    fontSize: 10,
  },
  
  // Category Pills
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    maxWidth: '50%',
  },
  categoryPillText: {
    color: '#F7E8D3',
    fontSize: 14,
    marginHorizontal: 6,
  },
  
  // Character Count
  characterCount: {
    fontSize: 12,
    color: '#F7E8D3',
    opacity: 0.6,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
  },
  miniCharacterCount: {
    fontSize: 10,
    color: '#F7E8D3',
    opacity: 0.6,
    textAlign: 'right',
    marginTop: 4,
  },
  
  // Tags
  tagsContainer: {
    marginBottom: 12,
  },
  tagsInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  tagInput: {
    flex: 1,
    color: '#F7E8D3',
    fontSize: 14,
    height: 40,
  },
  addTagButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 99, 71, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 99, 71, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#FF6347',
    fontSize: 12,
    marginRight: 4,
  },
  tagDisplay: {
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  tagDisplayText: {
    color: '#FF6347',
    fontSize: 11,
  },
  
  // Main Action Buttons
  mainActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mainActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6347',
    padding: 12,
    borderRadius: 10,
    minHeight: 48,
  },
  mainActionButtonDisabled: {
    opacity: 0.5,
  },
  mainCancelButton: {
    backgroundColor: 'rgba(247, 232, 211, 0.1)',
  },
  mainActionButtonText: {
    color: '#F7E8D3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Options Row
  inputOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  // Time Estimate
  timeOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeOptionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  timeOptionText: {
    fontSize: 14,
  },
  
  // Category Colors
  categoryTasks: {
    borderLeftColor: '#4CAF50',
  },
  categoryIdeas: {
    borderLeftColor: '#2196F3',
  },
  categoryPersonal: {
    borderLeftColor: '#9C27B0',
  },
  categoryWork: {
    borderLeftColor: '#FF9800',
  },
  categoryProjects: {
    borderLeftColor: '#00BCD4',
  },
  categoryGoals: {
    borderLeftColor: '#FF4081',
  },
  categoryOther: {
    borderLeftColor: '#757575',
  },
  
  // Compact Category Modal
  compactModalContent: {
    width: '90%',
    maxHeight: '60%',
    backgroundColor: '#F7E8D3',
    borderRadius: 16,
    padding: 16,
  },
  compactModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 26, 26, 0.1)',
  },
  compactModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  compactCategoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  compactSelectedCategory: {
    backgroundColor: 'rgba(255, 99, 71, 0.15)',
  },
  compactCategoryIcon: {
    marginRight: 8,
  },
  compactCategoryText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  compactSelectedCategoryText: {
    color: '#FF6347',
    fontWeight: '500',
  },
  categoryList: {
    paddingTop: 4,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyText: {
    color: '#F7E8D3',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
    maxWidth: '80%',
  },
  clearSearchButton: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 99, 71, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  clearSearchButtonText: {
    color: '#FF6347',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#F7E8D3',
    fontSize: 16,
    marginTop: 16,
    opacity: 0.8,
  }
});