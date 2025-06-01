import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const HelpModal = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.pullIndicator} />
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {t('help_Modal.welcome')}
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Overview Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('help_Modal.overview.title')}
            </Text>
            <Text style={styles.sectionText}>
              {t('help_Modal.overview.description')}
            </Text>
          </View>

          {/* Main Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('help_Modal.mainFeatures.title')}
            </Text>
            
            {/* Feature Cards */}
            {['taskManagement', 'progressTracking', 'notesSystem'].map((feature) => (
              <View key={feature} style={styles.featureCard}>
                <Text style={styles.featureTitle}>
                  {t(`help_Modal.mainFeatures.${feature}.title`)}
                </Text>
                <Text style={styles.featureDescription}>
                  {t(`help_Modal.mainFeatures.${feature}.description`)}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick Tips Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('help_Modal.quickTips.title')}
            </Text>
            
            {[
              { icon: 'star', text: 'xp' },
              { icon: 'time', text: 'progress' },
              { icon: 'flag', text: 'priority' },
              { icon: 'calendar', text: 'toggle' }
            ].map((tip) => (
              <View key={tip.text} style={styles.tipCard}>
                <View style={styles.tipIconContainer}>
                  <Ionicons name={tip.icon} size={20} color="#FF6347" />
                </View>
                <Text style={styles.tipText}>
                  {t(`help_Modal.quickTips.${tip.text}`)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(247, 232, 211, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  pullIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(247, 232, 211, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    color: '#1a1a1a',
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionText: {
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

export default HelpModal;