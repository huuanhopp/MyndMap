import React, { useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Modal, Alert } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { INTENSITY_LEVELS, INTENSITY_DESCRIPTIONS } from '../constants/intensityLevels';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODE_CARD_WIDTH = SCREEN_WIDTH * 0.85;

const ModeCard = ({ mode, isSelected, onPress }) => {
  const { t } = useTranslation();
  const isPremium = INTENSITY_DESCRIPTIONS[mode].isPremium;

  const description = t(`progressReview.modes.${mode}.description`);
  const splitPoint = description.indexOf('. ') + 1;
  const firstHalf = description.substring(0, splitPoint);
  const secondHalf = description.substring(splitPoint);

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.modeCard,
        isSelected && { borderColor: INTENSITY_DESCRIPTIONS[mode].color },
        isPremium && styles.premiumCard
      ]}
    >
      {isPremium && (
        <View style={styles.lockedOverlay}>
          <FontAwesome name="lock" size={24} color="#FFD700" />
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </View>
      )}
      <View style={styles.modeCardHeader}>
        <View style={styles.modeCardTitleContainer}>
          <Text style={styles.modeCardEmoji}>
            {INTENSITY_DESCRIPTIONS[mode].emoji}
          </Text>
          <View style={styles.titleContainer}>
            <Text style={[styles.modeCardTitle, isPremium && styles.premiumTitle]}>
              {t(`progressReview.modes.${mode}.title`)}
            </Text>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <FontAwesome name="star" size={14} color="#FFD700" />
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={[styles.modeCardDescription, isPremium && styles.premiumText]}>
          {firstHalf}
        </Text>
        <Text style={[styles.modeCardDescription, isPremium && styles.premiumText]}>
          {secondHalf}
        </Text>
      </View>
      <View style={[styles.modeCardBestFor, isPremium && styles.premiumBestFor]}>
        <Text style={[styles.modeCardBestForTitle, isPremium && styles.premiumText]}>
          {t('progressReview.modes.bestFor')}
        </Text>
        <Text style={[styles.modeCardBestForText, isPremium && styles.premiumText]}>
          {t(`progressReview.modes.${mode}.bestFor`)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const ModeSelectorCarousel = ({ selectedMode, onSelectMode, onClose }) => {
  const { t } = useTranslation();
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(
    Object.values(INTENSITY_LEVELS).indexOf(selectedMode)
  );

  const handleModeSelect = (mode) => {
    if (INTENSITY_DESCRIPTIONS[mode].isPremium) {
      Alert.alert(
        "Coming Soon!",
        "This premium feature is currently in development. Stay tuned for updates!",
        [
          { text: "OK", style: "cancel" }
        ]
      );
      return;
    }
    onSelectMode(mode);
    onClose();
  };

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / MODE_CARD_WIDTH);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.modeSelectorContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{t('progressReview.modes.selectMode')}</Text>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
          <FontAwesome name="times" size={24} color="#F7e8d3" />
        </TouchableOpacity>
      </View>

      <View style={styles.carouselWrapper}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={MODE_CARD_WIDTH}
          snapToAlignment="center"
          contentContainerStyle={styles.carouselContent}
        >
          {Object.values(INTENSITY_LEVELS).map((mode) => (
            <View key={mode} style={styles.carouselCardContainer}>
              <ModeCard 
                mode={mode} 
                isSelected={selectedMode === mode}
                onPress={() => handleModeSelect(mode)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.pageIndicators}>
        {Object.values(INTENSITY_LEVELS).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pageIndicator,
              currentIndex === index && styles.pageIndicatorActive
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = {
  modeSelectorContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: 'rgba(26,26,26,0.95)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247,232,211,0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F7e8d3',
  },
  modalCloseButton: {
    padding: 8,
  },
  carouselWrapper: {
    height: 400,
    alignItems: 'center',
  },
  carouselContent: {
    alignItems: 'center',
  },
  carouselCardContainer: {
    width: MODE_CARD_WIDTH,
    paddingHorizontal: 10,
  },
  modeCard: {
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F7e8d3',
    height: '100%',
  },
  modeCardHeader: {
    marginBottom: 12,
  },
  modeCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeCardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  modeCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F7e8d3',
  },
  modeCardDescription: {
    fontSize: 16,
    color: '#F7e8d3',
    lineHeight: 22,
    marginBottom: 16,
  },
  modeCardBestFor: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 12,
  },
  modeCardBestForTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F7e8d3',
    marginBottom: 8,
  },
  modeCardBestForText: {
    fontSize: 14,
    color: '#F7e8d3',
    lineHeight: 20,
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(247,232,211,0.3)',
    marginHorizontal: 4,
  },
  pageIndicatorActive: {
    backgroundColor: '#FF6347',
    width: 24,
  },
  premiumCard: {
    borderColor: '#9C27B0',
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    position: 'relative', // For overlay positioning
  },
  premiumTitle: {
    color: '#FFD700',
  },
  premiumBestFor: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  premiumBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  premiumText: {
    opacity: 0.7,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  comingSoonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
};

export default ModeSelectorCarousel;