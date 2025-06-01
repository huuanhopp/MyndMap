import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const MyndBudgetHelpModal = ({ visible, onClose, fadeAnim }) => {
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
              {t('myndBudget.helpModal.title', 'Budget Management Guide')}
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <ScrollView
          style={styles.modalScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalScrollContent}
        >
          {/* Mascot */}
          <View style={styles.mascotContainer}>
            <Image source={require('../assets/Arne_1.png')} style={styles.arneImage} />
          </View>

          {/* Overview Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('myndBudget.helpModal.overview.title', 'What is Mynd Budget?')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('myndBudget.helpModal.overview.description',
                'Mynd Budget is a financial management tool designed for ADHD minds. It helps you track your spending, set realistic budgets, and differentiate between fixed and variable costs. By providing visual progress indicators and regular updates, it makes budgeting more approachable and less overwhelming.')}
            </Text>
          </View>

          {/* Main Features Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('myndBudget.helpModal.features.title', 'Key Features')}
            </Text>

            {/* Feature: Budget Setting */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('myndBudget.helpModal.features.budgeting.title', 'Dual Budget System')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('myndBudget.helpModal.features.budgeting.description',
                  'Set separate budgets for fixed costs (rent, subscriptions, bills) and variable expenses (food, entertainment, impulse buys). This separation helps you understand where your money is going and provides clearer boundaries for discretionary spending.')}
              </Text>
            </View>

            {/* Feature: Expense Tracking */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('myndBudget.helpModal.features.tracking.title', 'Real-time Expense Tracking')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('myndBudget.helpModal.features.tracking.description',
                  'Quickly log expenses as they happen with just a few taps. Each expense can be categorized, marked as fixed or variable, and even connected to seasonal events. This immediate recording helps prevent the "where did my money go?" feeling at the end of the month.')}
              </Text>
            </View>

            {/* Feature: Visual Progress */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('myndBudget.helpModal.features.progress.title', 'Visual Progress Indicators')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('myndBudget.helpModal.features.progress.description',
                  'See your spending as a visual progress bar that changes color as you approach your budget limits. This visual feedback provides immediate awareness of your financial situation without requiring complex calculations or deep analysis.')}
              </Text>
            </View>

            {/* Feature: Flexible Periods */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('myndBudget.helpModal.features.periods.title', 'Flexible Budget Periods')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('myndBudget.helpModal.features.periods.description',
                  'Customize your budget period based on how you receive income—daily, weekly, biweekly, monthly, or on payday. This flexibility helps align your budget tracking with your actual cash flow patterns, making it easier to maintain consistency.')}
              </Text>
            </View>
          </View>

          {/* Quick Tips Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('myndBudget.helpModal.tips.title', 'Quick Tips')}
            </Text>

            {/* Tip: Start Small */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="trending-up" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('myndBudget.helpModal.tips.startSmall',
                  'Start with tracking just your daily variable expenses—things like coffee, lunches, and small purchases. Once that becomes a habit, expand to tracking fixed expenses.')}
              </Text>
            </View>

            {/* Tip: Use Categories */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="apps" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('myndBudget.helpModal.tips.categories',
                  'Use categories consistently to identify spending patterns. This can help you discover where your "impulse spending" tends to happen and develop strategies to manage it.')}
              </Text>
            </View>

            {/* Tip: Track Immediately */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="time" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('myndBudget.helpModal.tips.immediate',
                  'Log expenses immediately after making a purchase. The ADHD brain tends to forget details quickly, so capturing the information right away increases accuracy and reduces anxiety about forgotten expenses.')}
              </Text>
            </View>

            {/* Tip: Check Progress */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="stats-chart" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('myndBudget.helpModal.tips.checkProgress',
                  'Check your progress bar before making non-essential purchases. This creates a pause moment that can help you make more intentional spending decisions.')}
              </Text>
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('myndBudget.helpModal.benefits.title', 'Benefits for ADHD Minds')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('myndBudget.helpModal.benefits.description',
                'Financial management can be particularly challenging with ADHD due to issues with time perception, impulsivity, and executive function. Mynd Budget provides immediate feedback, removes friction from expense tracking, and creates visual cues that work with your brain instead of against it. Regular use can reduce financial anxiety, prevent "surprise" overdrafts, and build confidence in managing your money.')}
            </Text>
          </View>

          {/* Streak System Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('myndBudget.helpModal.streaks.title', 'The Budget Streak System')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('myndBudget.helpModal.streaks.description',
                'The streak counter tracks consecutive days of staying within your budget. This gamification element provides extra motivation and reward for consistent financial management. Try to maintain your streak—even a small streak can help build the habit of financial awareness.')}
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
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  arneImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FF6347',
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

export default MyndBudgetHelpModal;
