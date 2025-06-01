import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ImageBackground,
  Animated,
  Modal,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "./firebaseConfig";
import { useUser } from "../hooks/userHook.js";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import splashImage from '../assets/splash.png';
import { updateUserStats, checkAndUpdateAchievements } from '../notifications/firebaseUtils.js';
import { achievements, renderAchievementIcon } from './achievementDefinitions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getLevelTitle = (level) => {
  const titles = ["Novice", "Apprentice", "Adept", "Expert", "Master"];
  return titles[Math.min(Math.floor((level - 1) / 5), titles.length - 1)];
};

const toRomanNumeral = (num) => {
  const romanNumerals = [
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];

  let result = '';
  for (let i = 0; i < romanNumerals.length; i++) {
    while (num >= romanNumerals[i].value) {
      result += romanNumerals[i].numeral;
      num -= romanNumerals[i].value;
    }
  }
  return result;
};

const AchievementScreen = () => {
  const navigation = useNavigation();
  const { userInformation } = useUser();
  const [userAchievements, setUserAchievements] = useState({});
  const [userStats, setUserStats] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showConstructionModal, setShowConstructionModal] = useState(false);

  useEffect(() => {
    if (!userInformation) return;

    const fetchUserData = async () => {
      const userStatsRef = doc(db, "userStats", userInformation.uid);
      const userStatsDoc = await getDoc(userStatsRef);
      if (userStatsDoc.exists()) {
        const stats = userStatsDoc.data();
        setUserStats(stats);

        // Check and update achievements based on completed tasks
        await checkAndUpdateAchievements(userInformation.uid, stats.tasksCompleted);
      }

      const userAchievementsRef = collection(db, "achievements");
      const userAchievementsQuery = query(userAchievementsRef, where("userId", "==", userInformation.uid));
      const userAchievementsSnapshot = await getDocs(userAchievementsQuery);

      const userAchievementsData = {};
      userAchievementsSnapshot.forEach(doc => {
        const data = doc.data();
        userAchievementsData[data.id] = data.count || 0;
      });
      setUserAchievements(userAchievementsData);

      fadeIn();
    };

    fetchUserData();
  }, [userInformation]);

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
  };

  const renderAchievement = ({ item }) => {
    const isUnlocked = userAchievements[item.id] > 0;
    return (
      <TouchableOpacity onPress={() => handleAchievementPress(item)} style={styles.achievementItem}>
        {renderAchievementIcon(item.id, 40, isUnlocked ? "#F7e8d3" : "#888")}
        <Text style={[styles.achievementName, !isUnlocked && styles.lockedText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={splashImage} style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>Behold thy grand accomplishments, noble MyndMapper!</Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Tasks Completed: {userStats.tasksCompleted || 0}</Text>
          <Text style={styles.statsText}>Streaks: {userStats.currentStreak || 0} days</Text>
          <Text style={styles.statsText}>Level: {toRomanNumeral(userStats.level || 1)} - {getLevelTitle(userStats.level || 1)}</Text>
        </View>

        <Animated.View style={[styles.achievementsArea, { opacity: fadeAnim }]}>
          <FlatList
            data={achievements}
            renderItem={renderAchievement}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.achievementsList}
          />
        </Animated.View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back to Quests</Text>
        </TouchableOpacity>

        <Modal
          visible={selectedAchievement !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedAchievement(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedAchievement && (
                <>
                  <View style={[styles.modalIconContainer, userAchievements[selectedAchievement.id] > 0 && styles.unlockedAchievement]}>
                    {renderAchievementIcon(
                      selectedAchievement.id,
                      60,
                      userAchievements[selectedAchievement.id] > 0 ? "#F7e8d3" : "#888"
                    )}
                  </View>
                  <Text style={styles.modalTitle}>{selectedAchievement.name}</Text>
                  <Text style={styles.modalDescription}>{selectedAchievement.description}</Text>
                  <Text style={styles.modalCount}>
                    Achieved: x{userAchievements[selectedAchievement.id] || 0}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedAchievement(null)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#F7e8d3",
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#F7e8d3",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  statsContainer: {
    backgroundColor: 'rgba(139, 69, 19, 0.8)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '95%',
  },
  statsText: {
    color: "#F7e8d3",
    fontSize: 14,
    marginBottom: 5,
  },
  achievementsArea: {
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 15,
    width: '95%',
    flex: 1,
  },
  achievementsList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  achievementItem: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    width: SCREEN_WIDTH * 0.28,
  },
  achievementName: {
    color: '#F7e8d3',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  lockedText: {
    color: "#888",
  },
  button: {
    backgroundColor: '#1a1a1a',
    borderColor: '#FF6347',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 20,
  },
  buttonText: {
    color: "#F7e8d3",
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalIconContainer: {
    marginBottom: 10,
  },
  unlockedAchievement: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 30,
    padding: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F7e8d3',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#F7e8d3',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalCount: {
    fontSize: 18,
    color: '#FFD700',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#F7e8d3',
    fontWeight: 'bold',
  },
});

export default AchievementScreen;