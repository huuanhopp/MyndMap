import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const LeaderboardHelpModal = ({ visible, onClose, fadeAnim }) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.pullIndicator} />
          <View style={styles.modalHeaderContent}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {t('leaderboard.helpModal.title', 'Leaderboard Guide')}
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <ScrollView 
          style={styles.modalScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalScrollContent}
        >
          {/* Overview Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('leaderboard.helpModal.overview.title', 'What is the Leaderboard?')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('leaderboard.helpModal.overview.description', 
                'The Leaderboard is a friendly competition feature designed to motivate and inspire productivity. It shows how your task completion ranks among other users of the app. This positive reinforcement can be particularly effective for ADHD minds that respond well to external recognition and achievement tracking.')}
            </Text>
          </View>

          {/* Main Features Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('leaderboard.helpModal.features.title', 'How It Works')}
            </Text>
            
            {/* Feature: Ranking System */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('leaderboard.helpModal.features.ranking.title', 'Ranking System')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('leaderboard.helpModal.features.ranking.description', 
                  'Users are ranked based on the total number of tasks completed. Top performers are highlighted with trophy icons, making achievements visually apparent and providing a goal to work toward.')}
              </Text>
            </View>
            
            {/* Feature: Task Counting */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('leaderboard.helpModal.features.taskCounting.title', 'Task Counting')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('leaderboard.helpModal.features.taskCounting.description', 
                  'Each task you mark as complete in the app contributes to your leaderboard position. All tasks count equally, regardless of size or difficulty, emphasizing progress over perfection and encouraging the completion of small tasks.')}
              </Text>
            </View>
            
            {/* Feature: Competition */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('leaderboard.helpModal.features.competition.title', 'Friendly Competition')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('leaderboard.helpModal.features.competition.description', 
                  'The leaderboard creates a sense of community and healthy competition. Seeing the progress of others can provide motivation during periods when your own intrinsic motivation might be low. Your current position is highlighted to make it easy to track your standing.')}
              </Text>
            </View>
          </View>

          {/* Tips Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('leaderboard.helpModal.tips.title', 'Productivity Tips')}
            </Text>
            
            {/* Tip: Consistency */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="calendar" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('leaderboard.helpModal.tips.consistency', 
                  'Consistency beats intensity. Try to complete a few tasks every day rather than many tasks occasionally. This steady approach will improve your ranking over time.')}
              </Text>
            </View>
            
            {/* Tip: Small Tasks */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="checkmark-done" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('leaderboard.helpModal.tips.smallTasks', 
                  'Do not overlook small tasks. Since all completed tasks count toward your ranking, breaking down larger projects into smaller, manageable tasks can help you climb the leaderboard more quickly.')}
              </Text>
            </View>
            
            {/* Tip: Balance */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="balance" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('leaderboard.helpModal.tips.balance', 
                  'Balance competition with self-care. While the leaderboard can be motivating, remember that your productivity journey is personal. Focus on improving your own numbers rather than comparing yourself to others.')}
              </Text>
            </View>
            
            {/* Tip: Celebrate */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="trophy" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('leaderboard.helpModal.tips.celebrate', 
                  'Celebrate your progress. Each time you move up in the rankings, take a moment to acknowledge your achievement. This positive reinforcement helps build momentum for continued productivity.')}
              </Text>
            </View>
          </View>
          
          {/* Benefits Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('leaderboard.helpModal.benefits.title', 'Benefits for ADHD Minds')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('leaderboard.helpModal.benefits.description', 
                'The leaderboard feature is particularly helpful for people with ADHD who often respond well to external motivation, immediate feedback, and visual representations of progress. Competition can trigger dopamine release, which may help enhance focus and task completion. By gamifying productivity, the leaderboard transforms the sometimes challenging process of task management into something more engaging and rewarding.')}
            </Text>
          </View>

          {/* Remember Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('leaderboard.helpModal.remember.title', 'Remember')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('leaderboard.helpModal.remember.description', 
                'The leaderboard is meant to be a tool for motivation, not a source of stress. Everyone works at their own pace, and your position on the board doesn\'t define your worth or overall productivity. Focus on your own progress and use the leaderboard as one of many tools to help you stay on track with your goals.')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'rgba(247, 232, 211, 1)',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  pullIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalHeaderTitle: {
    color: '#1a1a1a',
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 24,
  },
  modalSection: {
    marginBottom: 32,
  },
  modalSectionTitle: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalSectionText: {
    color: '#1a1a1a',
    fontSize: 16,
    lineHeight: 24,
  },
  featureCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(247, 232, 211, 0.1)',
  },
  featureTitle: {
    color: '#f7e8d3',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    color: 'rgba(247, 232, 211, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipText: {
    flex: 1,
    color: 'rgba(247, 232, 211, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default LeaderboardHelpModal;