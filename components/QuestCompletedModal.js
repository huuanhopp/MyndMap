import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Image, FlatList, Dimensions, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';

const QuestCompletedModal = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategorySelection, setShowCategorySelection] = useState(false);

  const tipCategories = useMemo(() => [
    t('questCompletedModal.categories.gettingStarted'),
    t('questCompletedModal.categories.executiveFunction'),
    t('questCompletedModal.categories.timeManagement'),
    t('questCompletedModal.categories.organization'),
    t('questCompletedModal.categories.focusAndConcentration')
  ], [t]);

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose(); // Call the onClose prop after animation completes
    });
  };

  const randomTip = useMemo(() => {
    const getCategoryKey = (category) => {
      const keys = {
        [t('questCompletedModal.categories.gettingStarted')]: 'gettingStarted',
        [t('questCompletedModal.categories.executiveFunction')]: 'executiveFunction',
        [t('questCompletedModal.categories.timeManagement')]: 'timeManagement',
        [t('questCompletedModal.categories.organization')]: 'organization',
        [t('questCompletedModal.categories.focusAndConcentration')]: 'focusAndConcentration'
      };
      return keys[category];
    };

    if (selectedCategory) {
      const categoryKey = getCategoryKey(selectedCategory);
      const categoryTips = t(`questCompletedModal.tips.${categoryKey}`, { returnObjects: true });
      const randomIndex = Math.floor(Math.random() * categoryTips.length);
      return categoryTips[randomIndex];
    } else {
      const allTips = tipCategories.flatMap(category => 
        t(`questCompletedModal.tips.${getCategoryKey(category)}`, { returnObjects: true })
      );
      const randomIndex = Math.floor(Math.random() * allTips.length);
      return allTips[randomIndex];
    }
  }, [visible, selectedCategory, t, tipCategories]);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryButton, selectedCategory === item && styles.selectedCategoryButton]}
      onPress={() => {
        setSelectedCategory(item);
        setShowCategorySelection(false);
      }}
    >
      <Text style={styles.categoryButtonText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Image 
              source={require('../assets/celebration.png')} 
              style={styles.headerImage}
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{t('questCompletedModal.title')}</Text>
            <Text style={styles.subtitle}>{t('questCompletedModal.subtitle')}</Text>
            
            <View style={styles.tipContainer}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={require('../assets/Arne.jpeg')} 
                  style={styles.avatar}
                />
                <View style={styles.badge} />
              </View>
              <Text style={styles.tipText}>{randomTip}</Text>
            </View>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => setShowCategorySelection(true)}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>
                {t('questCompletedModal.chooseTipsButton')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                {t('questCompletedModal.closeButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Selection Modal */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={showCategorySelection}
          onRequestClose={() => setShowCategorySelection(false)}
        >
          <View style={styles.categoryModalContainer}>
            <View style={styles.categoryModal}>
              <Text style={styles.categoryModalTitle}>
                {t('questCompletedModal.categoryModalTitle')}
              </Text>
              
              <FlatList
                data={tipCategories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item}
                style={styles.categoryList}
                contentContainerStyle={styles.listContent}
              />

              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => setShowCategorySelection(false)}
              >
                <Text style={styles.secondaryButtonText}>
                  {t('questCompletedModal.backButton')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#2a2a2a',
    borderRadius: 25,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    height: 100,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerImage: {
    width: 120,
    height: 120,
    marginTop: -20,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'PressStart2P-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#f7e8d3',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
    fontFamily: 'PressStart2P-Regular',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 71, 0.3)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FF6347',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6347',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    fontFamily: 'PressStart2P-Regular',
  },
  primaryButton: {
    backgroundColor: '#FF6347',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'PressStart2P-Regular',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 71, 0.5)',
  },
  secondaryButtonText: {
    color: '#f7e8d3',
    textAlign: 'center',
    fontFamily: 'PressStart2P-Regular',
    fontSize: 12,
  },
  categoryModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModal: {
    width: '90%',
    backgroundColor: '#2a2a2a',
    borderRadius: 25,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  categoryModalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'PressStart2P-Regular',
  },
  categoryList: {
    width: '100%',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 8,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 71, 0.3)',
  },
  selectedCategoryButton: {
    backgroundColor: '#FF6347',
    borderColor: '#FF4500',
  },
  categoryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'PressStart2P-Regular',
    fontSize: 14,
  },
});

export default QuestCompletedModal;