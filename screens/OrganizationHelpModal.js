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

const OrganizationHelpModal = ({ visible, onClose, fadeAnim }) => {
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
              {t('organization.helpModal.title', 'Organization Guide')}
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
              {t('organization.helpModal.overview.title', 'What is the Organization Tool?')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('organization.helpModal.overview.description', 
                'The Organization Tool helps manage cleaning and organizing tasks for your home or office spaces. It provides a structured approach to break down organizing projects into manageable areas, track your progress, and celebrate your accomplishments. This tool is especially useful for ADHD minds that may find large organization projects overwhelming.')}
            </Text>
          </View>

          {/* Main Features Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('organization.helpModal.features.title', 'Key Features')}
            </Text>
            
            {/* Feature: Area Management */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('organization.helpModal.features.areaManagement.title', 'Area Management')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('organization.helpModal.features.areaManagement.description', 
                  'Add specific areas of your home or office that need organization. Breaking down your space into small, manageable areas makes the overall project less overwhelming and more achievable.')}
              </Text>
            </View>
            
            {/* Feature: Progress Tracking */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('organization.helpModal.features.progressTracking.title', 'Visual Progress Tracking')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('organization.helpModal.features.progressTracking.description', 
                  'Watch your progress bar fill up as you complete areas. Visual feedback provides motivation and a sense of accomplishment as you tackle your organization project step by step.')}
              </Text>
            </View>
            
            {/* Feature: Priority System */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('organization.helpModal.features.prioritySystem.title', 'Priority System')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('organization.helpModal.features.prioritySystem.description', 
                  'Assign low, medium, or high priority to each area. This helps you focus on what matters most and creates a strategic approach to your organization project based on importance and urgency.')}
              </Text>
            </View>

            {/* Feature: Time Estimation */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('organization.helpModal.features.timeEstimation.title', 'Time Estimation')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('organization.helpModal.features.timeEstimation.description', 
                  'Set estimated time requirements for each task. This feature helps with time management and makes it easier to fit organization tasks into your schedule, whether you have 15 minutes or an hour available.')}
              </Text>
            </View>
          </View>

          {/* Quick Tips Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('organization.helpModal.tips.title', 'Organization Tips')}
            </Text>
            
            {/* Tip: Break Tasks Down */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="grid" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('organization.helpModal.tips.breakTasks', 
                  'Break down large spaces into smaller areas. Instead of "clean bedroom," try "organize dresser drawers" or "declutter bedside table."')}
              </Text>
            </View>
            
            {/* Tip: Start Small */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="resize-small" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('organization.helpModal.tips.startSmall', 
                  'Start with a 5-minute task. Beginning with something small builds momentum and confidence for tackling larger areas.')}
              </Text>
            </View>
            
            {/* Tip: Two-Minute Rule */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="timer" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('organization.helpModal.tips.twoMinRule', 
                  'Follow the "two-minute rule" - if a task takes less than two minutes to complete, do it immediately rather than adding it to your list.')}
              </Text>
            </View>
            
            {/* Tip: Focus on One Area */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="locate" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('organization.helpModal.tips.focusOne', 
                  'Focus on one area at a time. Finish one space before moving to another to avoid creating more chaos and feeling overwhelmed.')}
              </Text>
            </View>

            {/* Additional Tips */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="trophy" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('organization.helpModal.tips.celebrate', 
                  'Celebrate small victories. Each completed area deserves recognition - this reinforces the habit of organizing.')}
              </Text>
            </View>

            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="musical-notes" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('organization.helpModal.tips.music', 
                  'Play upbeat music while organizing. Music can increase your energy and make the task more enjoyable.')}
              </Text>
            </View>

            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="cafe" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('organization.helpModal.tips.takeBreaks', 
                  'Take short breaks between areas. Stepping away briefly can prevent burnout and help maintain focus when you return.')}
              </Text>
            </View>
          </View>
          
          {/* Benefits Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('organization.helpModal.benefits.title', 'Benefits for ADHD Minds')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('organization.helpModal.benefits.description', 
                'Organization is often challenging for people with ADHD due to executive function difficulties. This tool helps by breaking down the overwhelming task of organizing into small, manageable chunks with clear visual progress indicators. The priority system helps with decision-making, while time estimates assist with planning and time awareness - both areas that can be challenging with ADHD. Regular use can reduce anxiety about cluttered spaces and build confidence in your ability to maintain organization.')}
            </Text>
          </View>

          {/* How to Use Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('organization.helpModal.howTo.title', 'Quick Start Guide')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('organization.helpModal.howTo.step1', '1. Add a small area that needs organizing (drawer, shelf, corner)')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('organization.helpModal.howTo.step2', '2. Set a realistic time estimate and appropriate priority level')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('organization.helpModal.howTo.step3', '3. Toggle between home/office to categorize your spaces')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('organization.helpModal.howTo.step4', '4. Complete the area and check it off to update your progress')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('organization.helpModal.howTo.step5', '5. Watch your progress bar grow as you organize more areas')}
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
    marginBottom: 8,
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

export default OrganizationHelpModal;