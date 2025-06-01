import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// DetailModal Component
const DetailModal = ({ visible, onClose, section }) => {
  const { t } = useTranslation();

  if (!section) return null;

  const hasDetailedContent = t(`wiki.sections.${section}.detail`, { returnObjects: true }) !== `wiki.sections.${section}.detail`;

  const sectionTranslations = hasDetailedContent ? {
    title: t(`wiki.sections.${section}.detail.title`),
    overview: t(`wiki.sections.${section}.detail.overview`),
    keyPoints: [
      t(`wiki.sections.${section}.detail.keyPoints.point1`),
      t(`wiki.sections.${section}.detail.keyPoints.point2`),
      t(`wiki.sections.${section}.detail.keyPoints.point3`)
    ],
    challenges: [
      t(`wiki.sections.${section}.detail.challenges.challenge1`),
      t(`wiki.sections.${section}.detail.challenges.challenge2`),
      t(`wiki.sections.${section}.detail.challenges.challenge3`),
      t(`wiki.sections.${section}.detail.challenges.challenge4`)
    ],
    caseStudy: {
      title: t(`wiki.sections.${section}.detail.caseStudy.title`),
      context: t(`wiki.sections.${section}.detail.caseStudy.context`),
      problem: t(`wiki.sections.${section}.detail.caseStudy.problem`),
      solution: t(`wiki.sections.${section}.detail.caseStudy.solution`),
      steps: [
        t(`wiki.sections.${section}.detail.caseStudy.steps.step1`),
        t(`wiki.sections.${section}.detail.caseStudy.steps.step2`),
        t(`wiki.sections.${section}.detail.caseStudy.steps.step3`),
        t(`wiki.sections.${section}.detail.caseStudy.steps.step4`)
      ],
      outcome: t(`wiki.sections.${section}.detail.caseStudy.outcome`)
    }
  } : {
    title: t(`wiki.sections.${section}.title`),
    overview: t(`wiki.sections.${section}.description`),
    keyPoints: Object.values(t(`wiki.sections.${section}.tips`, { returnObjects: true })),
    challenges: [],
    caseStudy: null
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.detailContainer}>
        <View style={styles.detailContent}>
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.detailTitle}>
              {sectionTranslations.title}
            </Text>
          </View>

          <ScrollView style={styles.detailScrollContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('wiki.common.overview')}</Text>
              <Text style={styles.detailText}>
                {sectionTranslations.overview}
              </Text>
            </View>

            {sectionTranslations.keyPoints.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>{t('wiki.common.keyPoints')}</Text>
                {sectionTranslations.keyPoints.map((point, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <FontAwesome name="circle" size={8} color="#FF6347" style={styles.bulletIcon} />
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}

            {sectionTranslations.challenges?.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>{t('wiki.common.challenges')}</Text>
                {sectionTranslations.challenges.map((challenge, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <FontAwesome name="exclamation-circle" size={12} color="#FF6347" style={styles.bulletIcon} />
                    <Text style={styles.bulletText}>{challenge}</Text>
                  </View>
                ))}
              </View>
            )}

            {sectionTranslations.caseStudy && (
              <View style={styles.caseStudySection}>
                <Text style={styles.caseStudyTitle}>
                  {sectionTranslations.caseStudy.title}
                </Text>
                <View style={styles.caseStudyContent}>
                  <Text style={styles.caseStudyText}>
                    <Text style={styles.boldText}>{t('wiki.common.context')}: </Text>
                    {sectionTranslations.caseStudy.context}
                  </Text>
                  <Text style={styles.caseStudyText}>
                    <Text style={styles.boldText}>{t('wiki.common.problem')}: </Text>
                    {sectionTranslations.caseStudy.problem}
                  </Text>
                  <Text style={styles.caseStudyText}>
                    <Text style={styles.boldText}>{t('wiki.common.solution')}: </Text>
                    {sectionTranslations.caseStudy.solution}
                  </Text>
                  <View style={styles.caseStudySteps}>
                    {sectionTranslations.caseStudy.steps.map((step, index) => (
                      <View key={index} style={styles.bulletPoint}>
                        <FontAwesome name="check" size={12} color="#4CAF50" style={styles.bulletIcon} />
                        <Text style={styles.bulletText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.caseStudyText}>
                    <Text style={styles.boldText}>{t('wiki.common.outcome')}: </Text>
                    {sectionTranslations.caseStudy.outcome}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// HelpModal Component
const HelpModal = ({ visible, onClose }) => {
  const { t } = useTranslation();

  const helpSections = [
    {
      title: t('wiki.help.modalTitle'),
      content: t('wiki.help.description'),
      icon: 'info-circle'
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.helpContainer}>
        <View style={styles.helpContent}>
          <View style={styles.helpHeader}>
            <Text style={styles.helpHeaderText}>{t('wiki.help.modalTitle')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.helpScrollContent}>
            <View style={styles.helpSection}>
              <View style={styles.helpSectionHeader}>
                <FontAwesome name="info-circle" size={24} color="#FF6347" />
                <Text style={styles.helpSectionTitle}>{t('wiki.help.modalTitle')}</Text>
              </View>
              <Text style={styles.helpSectionContent}>
                {t('wiki.help.description')}
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// QuickAction Component
const QuickAction = ({ type }) => {
  const { t } = useTranslation();
  const items = Object.values(t(`wiki.sections.${type}.quickCheck.items`, { returnObjects: true }));

  return (
    <View style={styles.quickActionContainer}>
      <View style={styles.quickActionHeader}>
        <Text style={styles.quickActionTitle}>
          {t(`wiki.sections.${type}.quickCheck.title`)}
        </Text>
      </View>
      <View style={styles.quickActionItems}>
        {items.map((item, index) => (
          <View key={index} style={styles.questionItem}>
            <FontAwesome name="question-circle" size={16} color="#FF6347" style={styles.questionIcon} />
            <Text style={styles.questionText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Main Wiki Component
const Wiki = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('executive');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const sections = ['executive', 'timeManagement', 'challenges', 'strategies', 'technology'];

  const handleBackPress = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      navigation.goBack();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleBackPress}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleBackPress} 
              style={styles.closeButton}
            >
              <FontAwesome name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.title}>{t('wiki.title')}</Text>
            <TouchableOpacity 
              onPress={() => setShowHelp(true)} 
              style={styles.helpButton}
            >
              <FontAwesome name="info-circle" size={24} color="#FF6347" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.tabsContainer}
            horizontal 
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={width / 2.5}
          >
            {sections.map((section) => (
              <TouchableOpacity
                key={section}
                style={[
                  styles.tab,
                  activeTab === section && styles.activeTab,
                ]}
                onPress={() => setActiveTab(section)}
              >
                <View style={styles.tabContent}>
                  <FontAwesome 
                    name={section === 'executive' ? 'lightbulb-o' :
                          section === 'timeManagement' ? 'clock-o' :
                          section === 'challenges' ? 'exclamation-triangle' :
                          section === 'strategies' ? 'check-square-o' :
                          'mobile'}
                    size={24} 
                    color={activeTab === section ? "#FF6347" : "#1A1A1A"} 
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === section && styles.activeTabText
                  ]}>
                    {t(`wiki.sections.${section}.title`)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.contentContainer}>
            <View style={styles.categoryContainer}>
              <QuickAction type={activeTab} />
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>{t('wiki.common.quickTips')}</Text>
                {Object.values(t(`wiki.sections.${activeTab}.tips`, { returnObjects: true })).map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <FontAwesome 
                      name="lightbulb-o" 
                      size={16} 
                      color="#FF6347" 
                      style={styles.tipIcon} 
                    />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity 
                style={styles.readMoreButton}
                onPress={() => {
                  setSelectedSection(activeTab);
                  setShowDetail(true);
                }}
              >
                <Text style={styles.readMoreText}>{t('wiki.common.learnMore')}</Text>
                <FontAwesome name="arrow-right" size={12} color="#FF6347" />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <DetailModal 
            visible={showDetail}
            onClose={() => setShowDetail(false)}
            section={selectedSection}
          />

          <HelpModal 
            visible={showHelp}
            onClose={() => setShowHelp(false)}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.0)',
    paddingTop: 20
  },
  content: {
    flex: 1,
    backgroundColor: '#f7e8d3',
    borderRadius: 20,
    padding: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 26, 26, 0.1)'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A'
  },
  closeButton: {
    padding: 8,
    borderRadius: 20
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    height: 100, // Added fixed height
  },
  tab: {
    marginRight: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: width / 3 - 20,
    paddingVertical: 15, // Added padding instead of height percentage
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  tabText: {
    fontSize: 14,
    marginTop: 10,
    color: '#1A1A1A',
    textAlign: 'center',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#FF6347',
    fontWeight: 'bold'
  },
  contentContainer: {
    marginTop: 0  // Removed negative margin
  },
  categoryContainer: {
    padding: 10,
  },
  quickActionContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 10  // Reduced margin
  },
  quickActionHeader: {
    marginBottom: 15
  },
  quickActionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 5
  },
  quickActionItems: {
    borderLeftWidth: 2,
    borderLeftColor: '#FF6347',
    paddingLeft: 15
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)'
  },
  questionIcon: {
    marginRight: 12,
    marginTop: 3
  },
  questionText: {
    fontSize: 16,
    color: '#f7e8d3',
    flex: 1,
    lineHeight: 24
  },
  tipsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: 10
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 26, 26, 0.1)'
  },
  tipIcon: {
    marginRight: 15
  },
  tipText: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 24
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  readMoreText: {
    color: '#FF6347',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8
  },
  helpButton: {
    padding: 8,
    borderRadius: 20
  },
  helpContainer: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  helpContent: {
    width: '95%',
    backgroundColor: '#f7e8d3',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%'
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 26, 26, 0.1)'
  },
  helpHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A'
  },
  helpScrollContent: {
    flex: 1
  },
  helpSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15
  },
  helpSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  helpSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 12
  },
  helpSectionContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24
  },
  detailContainer: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.9)'
  },
  detailContent: {
    flex: 1,
    backgroundColor: '#f7e8d3',
    margin: 10,
    borderRadius: 20,
    padding: 15
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 26, 26, 0.1)'
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
    marginLeft: 15
  },
  detailScrollContent: {
    flex: 1
  },
  detailSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5
  },
  bulletIcon: {
    marginRight: 10,
    marginTop: 5
  },
  bulletText: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 24
  },
  caseStudySection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10
  },
  caseStudyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 15
  },
  caseStudyContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15
  },
  caseStudyText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 10,
    lineHeight: 24
  },
  caseStudySteps: {
    marginVertical: 10,
    paddingLeft: 10
  },
  boldText: {
    fontWeight: 'bold'
  }
});

export default Wiki;
