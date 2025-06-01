import { StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  // Main Container Styles
  container: {
    flex: 1,
    backgroundColor: '#F7E8D3',
    position: 'relative',
  },
  mainScroll: {
    flex: 1,
  },
  coreContent: {
    padding: 16,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
    top: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 50,
    left: 16,
    padding: 10,
    zIndex: 1,
  },
  helpButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    padding: 10,
    zIndex: 1,
  },

  // Current Mode Container Styles
  currentModeContainer: {
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F7e8d3',
  },
  currentModeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F7e8d3',
    flex: 1,
  },
  modeChangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  modeChangeText: {
    color: '#F7e8d3',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Stats Display Styles
  statsContainer: {
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F7e8d3',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F7e8d3',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  highlightedCard: {
    borderWidth: 1,
    borderColor: '#FF6347',
    backgroundColor: 'rgba(255,99,71,0.1)',
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

  // Enhanced Insights Styles
  insightsContainer: {
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F7e8d3',
    overflow: 'hidden',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255,99,71,0.2)',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    color: '#F7e8d3',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    width: '100%',
  },
  pageContainer: {
    width: SCREEN_WIDTH - 32,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F7e8d3',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#F7e8d3',
    opacity: 0.8,
  },
  insightCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F7e8d3',
  },
  insightDescription: {
    fontSize: 12,
    color: '#F7e8d3',
    opacity: 0.8,
    marginTop: 4,
  },
  strategiesList: {
    padding: 16,
    paddingTop: 0,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  strategyBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6347',
    marginTop: 8,
    marginRight: 12,
  },
  strategyText: {
    flex: 1,
    color: '#F7e8d3',
    fontSize: 15,
    lineHeight: 22,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  helpModalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: 'rgba(26,26,26,0.95)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247,232,211,0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F7e8d3',
    flex: 1,
    marginRight: 16,
  },
  modalCloseButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  helpContent: {
    paddingBottom: 24,
  },
  helpText: {
    color: '#F7e8d3',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    opacity: 0.9,
  },
  helpSectionTitle: {
    color: '#F7e8d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },

  // Animation Related Styles
  expandedStatsContainer: {
    overflow: 'hidden',
  },
  expandButtonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  expandButton: {
    backgroundColor: '#FF6347',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  expandButtonText: {
    color: '#F7e8d3',
    fontSize: 14,
    fontWeight: '600',
  },
});