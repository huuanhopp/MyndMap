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

const MindCoolingHelpModal = ({ visible, onClose, fadeAnim }) => {
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
              {t('mindCooling.helpModal.title', 'Mind Cooling Guide')}
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
              {t('mindCooling.helpModal.overview.title', 'What is Mind Cooling?')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('mindCooling.helpModal.overview.description', 
                'Mind Cooling is a mindfulness tool designed especially for ADHD minds. It combines guided meditation with a thought capture system to help you clear mental clutter, reduce anxiety, and improve focus. Use this feature whenever you feel overwhelmed or need to reset your mental state.')}
            </Text>
          </View>

          {/* Main Features Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('mindCooling.helpModal.features.title', 'Key Features')}
            </Text>
            
            {/* Feature: Meditation */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('mindCooling.helpModal.features.meditation.title', 'Guided Meditation')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('mindCooling.helpModal.features.meditation.description', 
                  'Choose from three different meditation tracks designed to calm an ADHD mind. The timer will track your session duration to help build a consistent practice. Start with just 2-3 minutes per day and gradually increase your time.')}
              </Text>
            </View>
            
            {/* Feature: Thought Capture */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('mindCooling.helpModal.features.thoughtCapture.title', 'Thought Capture')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('mindCooling.helpModal.features.thoughtCapture.description', 
                  'As thoughts arise during meditation or throughout your day, quickly jot them down to clear your mind. This prevents the "I need to remember this" loop that can distract from the present moment. You can mark thoughts as completed once they\'ve been addressed.')}
              </Text>
            </View>
            
            {/* Feature: Categorization */}
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>
                {t('mindCooling.helpModal.features.categorization.title', 'Thought Categorization')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('mindCooling.helpModal.features.categorization.description', 
                  'Categorize your thoughts to better understand your mind\'s patterns. "Urgent" for time-sensitive matters, "Important" for priorities, "Worry" for anxious thoughts, and "Random" for passing ideas. This helps you prioritize what needs your attention.')}
              </Text>
            </View>
          </View>

          {/* Quick Tips Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('mindCooling.helpModal.tips.title', 'Quick Tips')}
            </Text>
            
            {/* Tip: Meditation Tracks */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="musical-notes" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('mindCooling.helpModal.tips.tracks', 
                  'Try different meditation tracks to find which works best for you. Each track has a different tone and rhythm to accommodate various ADHD sensitivities.')}
              </Text>
            </View>
            
            {/* Tip: Regular Sessions */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="timer" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('mindCooling.helpModal.tips.sessions', 
                  'Consistency matters more than duration. A short 2-minute session daily is more beneficial than an occasional 20-minute session. Your stats will help you track your progress.')}
              </Text>
            </View>
            
            {/* Tip: Managing Thoughts */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="document-text" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('mindCooling.helpModal.tips.thoughts', 
                  'Don\'t judge your thoughts as they come up. Simply note them and let them go. The thought capture feature helps externalize these thoughts so you can return to your meditation.')}
              </Text>
            </View>
            
            {/* Tip: Using Categories */}
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="options" size={20} color="#FF6347" />
              </View>
              <Text style={styles.tipText}>
                {t('mindCooling.helpModal.tips.categories', 
                  'Review your categorized thoughts after your session to identify patterns in your thinking. This awareness can help you better manage your attention and priorities throughout the day.')}
              </Text>
            </View>
          </View>
          
          {/* Benefits Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>
              {t('mindCooling.helpModal.benefits.title', 'Benefits for ADHD Minds')}
            </Text>
            <Text style={styles.modalSectionText}>
              {t('mindCooling.helpModal.benefits.description', 
                'Regular use of Mind Cooling can help reduce anxiety, improve focus, enhance emotional regulation, and increase self-awareness. Many ADHD individuals report that consistent mindfulness practice helps them navigate daily challenges with greater ease.')}
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

export default MindCoolingHelpModal;