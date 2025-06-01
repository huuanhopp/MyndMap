import React, { useState, useRef } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, Text, Animated } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { useUser } from "../hooks/userHook";
import { ModeSelectorCarousel } from '../src/components/ModeSelector';
import { StatsDisplay } from '../src/components/StatsDisplay';
import { EnhancedInsights } from '../src/insightsGenerator';
import { styles } from '../src/styles/progressStyles';
import { INTENSITY_DESCRIPTIONS, INTENSITY_LEVELS } from '../src/constants/intensityLevels';
import { useTaskStats } from '../src/hooks/useTaskStats';
import ParticleAnimation from '../screens/ParticleAnimation';

const ProgressReflections = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [selectedIntensity, setSelectedIntensity] = useState(INTENSITY_LEVELS.BALANCED);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  
  const { stats, isLoading: isStatsLoading } = useTaskStats(user, visible);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  React.useEffect(() => {
    if (!isStatsLoading && stats) {
      // Reset opacity when new data starts loading
      contentFadeAnim.setValue(0);
      // Fade in when data is loaded
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isStatsLoading, stats]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { position: 'relative' }]}>
        {/* Background Particles Layer */}
        <View style={styles.particleContainer}>
          <ParticleAnimation count={30} />
        </View>
        <View style={styles.particleOverlay} />
  
        {/* Main Content */}
        <ScrollView 
          style={[styles.mainScroll, { position: 'relative', zIndex: 3 }]} 
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: 'transparent' }]}>
  <TouchableOpacity 
    onPress={onClose}
    style={styles.backButton}
  >
    <FontAwesome name="arrow-left" size={24} color="#1a1a1a" />
  </TouchableOpacity>

  <Text style={styles.headerTitle}>{t('progressReview.header.title')}</Text>

  <TouchableOpacity 
    onPress={() => setShowHelp(true)}
    style={styles.helpButton}
  >
    <FontAwesome name="question-circle" size={24} color="#1a1a1a" />
  </TouchableOpacity>
</View>
  
          {/* Animated Content Container */}
          <Animated.View 
            style={[
              styles.coreContent,
              { opacity: contentFadeAnim }
            ]}
          >
            {/* Current Mode Display */}
            <View style={styles.currentModeContainer}>
              <View style={styles.currentModeContent}>
                <View style={styles.modeIndicator}>
                  <Text style={styles.modeEmoji}>
                    {INTENSITY_DESCRIPTIONS[selectedIntensity].emoji}
                  </Text>
                  <Text style={styles.modeTitle}>
                    {t(`progressReview.modes.${selectedIntensity}.title`)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.modeChangeButton,
                    { backgroundColor: INTENSITY_DESCRIPTIONS[selectedIntensity].color }
                  ]}
                  onPress={() => setShowModeSelector(true)}
                >
                  <Text style={styles.modeChangeText}>
                    {t('progressReview.modes.changeMode')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
  
            {/* Stats Display */}
            <StatsDisplay 
  stats={stats} 
  isLoading={isStatsLoading} 
/>  
            {/* Enhanced Insights */}
            <EnhancedInsights 
              stats={stats} 
              selectedIntensity={selectedIntensity}
            />
          </Animated.View>
        </ScrollView>
  
        {/* Mode Selector Modal */}
        <Modal
          visible={showModeSelector}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModeSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <ModeSelectorCarousel
              selectedMode={selectedIntensity}
              onSelectMode={setSelectedIntensity}
              onClose={() => setShowModeSelector(false)}
            />
          </View>
        </Modal>
  
        {/* Help Modal */}
        <Modal
          visible={showHelp}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowHelp(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.helpModalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t('progressReview.help.title')}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowHelp(false)}
                  style={styles.modalCloseButton}
                >
                  <FontAwesome name="times" size={24} color="#f7e8d3" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.helpContent}>
                <Text style={styles.helpText}>
                  {t('progressReview.help.description')}
                </Text>
                <Text style={styles.helpSectionTitle}>
                  {t('progressReview.help.sections.modes.title')}
                </Text>
                <Text style={styles.helpText}>
                  {t('progressReview.help.sections.modes.content')}
                </Text>
                <Text style={styles.helpSectionTitle}>
                  {t('progressReview.help.sections.stats.title')}
                </Text>
                <Text style={styles.helpText}>
                  {t('progressReview.help.sections.stats.content')}
                </Text>
                <Text style={styles.helpSectionTitle}>
                  {t('progressReview.help.sections.advice.title')}
                </Text>
                <Text style={styles.helpText}>
                  {t('progressReview.help.sections.advice.content')}
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  )};

export default ProgressReflections;