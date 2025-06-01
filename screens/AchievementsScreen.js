import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useUser } from '../hooks/userHook';
import { listenToDocument } from '../screens/firebase-services.js';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const AchievementsScreen = () => {
  const { user } = useUser();
  const [achievements, setAchievements] = useState([]);
  const navigation = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      // Use standardized listenToDocument method
      const unsubscribe = listenToDocument('userAchievements', user.uid, (userData) => {
        if (userData) {
          setAchievements(userData.achievements || []);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const achievementData = [
    { name: t('achievements.firstArea.name'), image: require('../assets/one_star.png'), description: t('achievements.firstArea.description') },
    { name: t('achievements.fiveAreas.name'), image: require('../assets/five_star.jpeg'), description: t('achievements.fiveAreas.description') },
    { name: t('achievements.tenAreas.name'), image: require('../assets/10.jpeg'), description: t('achievements.tenAreas.description') },
    { name: t('achievements.fifteenAreas.name'), image: require('../assets/15.jpeg'), description: t('achievements.fifteenAreas.description') },
    { name: t('achievements.twentyAreas.name'), image: require('../assets/20.jpeg'), description: t('achievements.twentyAreas.description') },
    { name: t('achievements.thirtyAreas.name'), image: require('../assets/30.jpeg'), description: t('achievements.thirtyAreas.description') },
    { name: t('achievements.thirtyFiveAreas.name'), image: require('../assets/35.jpeg'), description: t('achievements.thirtyFiveAreas.description') },
    { name: t('achievements.fortyAreas.name'), image: require('../assets/40.jpeg'), description: t('achievements.fortyAreas.description') },
    { name: t('achievements.fiftyAreas.name'), image: require('../assets/50.jpeg'), description: t('achievements.fiftyAreas.description') },
  ];

  const renderAchievement = ({ item }) => {
    const achievementInfo = achievementData.find(a => a.name === item);
    if (!achievementInfo) return null;
    return (
      <View style={styles.achievementItem}>
        <View style={styles.imageContainer}>
          <Image
            source={achievementInfo.image}
            style={styles.achievementImage}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.achievementName}>{achievementInfo.name}</Text>
          <Text style={styles.achievementDescription}>{achievementInfo.description}</Text>
        </View>
      </View>
    );
  };

  const goToOrganization = () => {
    navigation.navigate('Organization');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToOrganization} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('achievements.screenTitle')}</Text>
      </View>
      <FlatList
        data={achievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.achievementList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 45,
    backgroundColor: '#f7e8d3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 34,
  },
  achievementList: {
    paddingBottom: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    overflow: 'hidden',
  },
  achievementImage: {
    width: 60,
    height: 60,
  },
  textContainer: {
    marginLeft: 15,
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default AchievementsScreen;