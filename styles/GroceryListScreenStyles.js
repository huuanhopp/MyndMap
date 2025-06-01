import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Platform-specific values
const isIOS = Platform.OS === 'ios';

// Colors to match app theme
const COLORS = {
  background: '#1a1a1a',
  cardBackground: '#2a2a2a',
  primary: '#f7e8d3',
  accent: '#f7e8d3',
  text: '#f7e8d3',
  textSecondary: 'rgba(247, 232, 211, 0.7)',
  divider: 'rgba(247, 232, 211, 0.2)',
  error: '#FF6347'
};

export default StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: isIOS ? 50 : 35,
    paddingBottom: isIOS ? 20 : 10,
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 16,
    marginTop: 16,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  
  // List selector styles
  listSelectorContainer: {
    marginBottom: 12,
  },
  listSelector: {
    height: 44,
  },
  listItem: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    minWidth: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  activeListItem: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
  },
  listItemText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  activeListItemText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  listItemCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  newListButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 232, 211, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    height: '100%',
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
    minWidth: 90,
  },
  newListButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  createFirstListButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 232, 211, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
  },
  createFirstListButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  
  // New List Input
  newListContainer: {
    marginBottom: 16,
  },
  newListInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: isIOS ? 12 : 10,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 10,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  newListButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  createButton: {
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  disabledButton: {
    opacity: 0.5,
  },
  
  // Search bar styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: COLORS.text,
    fontSize: 15,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  
  // Controls and options
  controlsContainer: {
    marginBottom: 12,
  },
  viewModeTabs: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    padding: 2,
  },
  viewModeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeViewModeTab: {
    backgroundColor: 'rgba(247, 232, 211, 0.3)',
  },
  viewModeTabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  activeViewModeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginRight: 8,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sortButtonText: {
    color: COLORS.text,
    fontSize: 14,
    marginRight: 6,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  
  // Shopping mode button
  shoppingModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 16,
  },
  shoppingModeActiveButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
  },
  shoppingModeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  
  // Item input section
  itemInputSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    overflow: 'hidden', // Important for the animation
  },
  itemInputRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  itemInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: isIOS ? 12 : 10,
    color: COLORS.text,
    fontSize: 16,
    marginRight: 8,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  addItemButton: {
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemButtonDisabled: {
    opacity: 0.3,
  },
  itemOptionsContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 10,
  },
  optionSectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 6,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  
  // Section selector
  sectionList: {
    marginBottom: 10,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedSectionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionButtonText: {
    color: COLORS.text,
    fontSize: 13,
    marginLeft: 6,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  
  // Priority selector
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
    justifyContent: 'center',
  },
  selectedPriorityButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  priorityButtonText: {
    color: COLORS.text,
    fontSize: 13,
    marginLeft: 6,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  
  // Quantity selector
  quantityContainer: {
    marginBottom: 5,
  },
  quantityPresetsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityPresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    marginRight: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  selectedQuantityPresetChip: {
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
  },
  quantityPresetChipText: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  selectedQuantityPresetChipText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  customQuantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderStyle: 'dashed',
  },
  customQuantityButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  customQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customQuantityInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 14,
    marginRight: 8,
    width: 80,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  quantityPresetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  quantityPresetButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  clearSearchButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  
  // Grocery list styles
  itemsContainer: {
    flex: 1,
  },
  groceryList: {
    flex: 1,
  },
  groceryListContent: {
    paddingBottom: 20,
  },
  
  // Section group styles
  sectionGroup: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  sectionHeaderText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  sectionItemCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  
  // Grocery item styles
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    marginBottom: 8,
    paddingRight: 12,
    borderLeftWidth: 3,
  },
  completedGroceryItem: {
    opacity: 0.7,
    backgroundColor: 'rgba(42, 42, 42, 0.7)',
  },
  itemCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 12,
  },
  checkedItemCheckbox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemContent: {
    flex: 1,
    paddingVertical: 12,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  completedItemName: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  quantityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  quantityBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  itemMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  priorityBadgeText: {
    fontSize: 10,
    marginLeft: 4,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontFamily: isIOS ? 'System' : 'sans-serif',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemActionButton: {
    padding: 6,
    marginLeft: 8,
  },
  
  // Draggable item styles - kept for regular list items
  draggableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dragHandle: {
    padding: 12,
  },
  
  // Completion animation overlay
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  completionText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  celebrationEmoji: {
    fontSize: 50,
    marginBottom: 20,
  },
  
  // Header actions for navigation button in header
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: 10,
  },
  collapseHeaderText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  collapseIcon: {
    padding: 4,
  },
  
  // NotesScreen integration button
  groceryListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(247, 232, 211, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(247, 232, 211, 0.15)',
  },
  groceryListButtonText: {
    color: '#f7e8d3',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  groceryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(247, 232, 211, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: 12,
  },
  inputHeaderText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  hideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 232, 211, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  hideButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
  
  // Show input button styles
  showInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(247, 232, 211, 0.2)',
    borderStyle: 'dashed',
  },
  showInputButtonText: {
    color: COLORS.text,
    fontSize: 16,
    marginLeft: 8,
    fontFamily: isIOS ? 'System' : 'sans-serif-medium',
  },
});