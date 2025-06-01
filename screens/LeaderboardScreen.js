import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView, Animated, StyleSheet } from 'react-native';
import { useUser } from '../hooks/userHook';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { db } from '../firebase/init';
import LeaderboardHelpModal from '../components/LeaderboardHelpModal'; // Import the new help modal component

const LeaderboardScreen = ({onClose}) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const navigation = useNavigation();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  const handleBackPress = () => {
    if (onClose) {
      onClose(); // Use the provided onClose function
    } else {
      navigation.goBack(); // Fallback to navigation.goBack()
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  // Effect for handling help modal fade animation
  useEffect(() => {
    if (showHelpModal) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showHelpModal, fadeAnim]);

  const handleOpenHelpModal = () => {
    setShowHelpModal(true);
  };

  const handleCloseHelpModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowHelpModal(false);
    });
  };

  // Updated fetchLeaderboardData implementation using React Native Firebase syntax
  const fetchLeaderboardData = async () => {
    try {
      // Create a query to get users ordered by tasksCompleted in descending order
      const querySnapshot = await db.collection('users')
        .orderBy('tasksCompleted', 'desc')
        .limit(20)
        .get();
      
      // Process the results
      const leaderboard = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Anonymous User',
        tasksCompleted: doc.data().tasksCompleted || 0
      }));
      
      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      throw error;
    }
  };

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching leaderboard data...");
      const data = await fetchLeaderboardData();
      console.log("Fetched leaderboard data:", data);
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      setError(t('leaderboard.error'));
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderItem = ({ item, index }) => {
    const isTopThree = index < 3;
    const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    
    return (
      <Animated.View 
        style={[
          styles.itemContainer,
          item.id === user?.uid && styles.currentUserItem,
          isTopThree && styles.topThreeContainer
        ]}
      >
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <FontAwesome 
              name="trophy" 
              size={22} 
              color={rankColors[index]} 
              style={styles.trophyIcon}
            />
          ) : (
            <Text style={styles.rankText}>#{index + 1}</Text>
          )}
        </View>
        
        <View style={styles.userInfoContainer}>
          <View style={styles.userDetailsContainer}>
            <Text style={styles.userText}>{item.name}</Text>
            <Text style={styles.tasksLabel}>{t('leaderboard.tasksCompleted')}</Text>
          </View>
          
          <View style={styles.tasksContainer}>
            <Text style={styles.tasksNumber}>{item.tasksCompleted}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>{t('leaderboard.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#FF6347" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleOpenHelpModal} style={styles.helpButton}>
          <FontAwesome name="question-circle" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('leaderboard.title')}</Text>
          <Text style={styles.subtitle}>{t('leaderboard.subtitle')}</Text>
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadLeaderboardData} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>{t('leaderboard.retryButton')}</Text>
            </TouchableOpacity>
          </View>
        ) : leaderboardData.length === 0 ? (
          <Text style={styles.noDataText}>{t('leaderboard.noData')}</Text>
        ) : (
          <FlatList
            data={leaderboardData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>

      {/* New Help Modal Implementation */}
      <LeaderboardHelpModal
        visible={showHelpModal}
        onClose={handleCloseHelpModal}
        fadeAnim={fadeAnim}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7E8D3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensures back and help buttons are on opposite sides
    padding: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#FF6347',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: "600"
  },
  backButton: {
    marginRight: 20,
  },
  backButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 40, // 'paddingBottom' = moves content 'up', not 'down'. 
  },
  titleContainer: {
    alignItems: 'center',
    paddingBottom: 30, // Increased padding to move list up
    marginTop: -20, // Negative margin to move Arne image up
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  errorText: {
    color: '#FF6347',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    color: '#F7e8d3',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nameHeader: {
    flex: 1,
    textAlign: 'left',
    marginLeft: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  currentUserItem: {
    backgroundColor: 'rgba(2f55, 99, 71, 0.2)',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f7e8d3',
  },
  userText: {
    fontSize: 16,
    color: '#f7e8d3',
    fontWeight: '500',
    marginBottom: 6, // Increased spacing between name and tasks label
  },
  tasksText: {
    fontSize: 18,
    color: '#F7e8d3',
    width: 50,
    textAlign: 'right',
  },
  loadingText: {
    color: '#F7e8d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  forumButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  forumButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpButton: {
    padding: 10,
    marginLeft: 20, // Adjust as needed for spacing
  },
  topThreeContainer: {
    borderWidth: 1,
    borderColor: '#FF6347',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyIcon: {
    marginRight: 5,
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15, // Increased spacing from rank
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FF6347',
    borderWidth: 1,
    borderColor: '#FF6347',
  },
  avatarText: {
    color: '#F7e8d3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetailsContainer: {
    flex: 1,
    marginLeft: 25, // Increased spacing from avatar
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tasksLabel: {
    color: '#F7E8DE',
    fontSize: 14,
    marginRight: 5,
  },
  listContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  currentUserItem: {
    backgroundColor: '#FF6347',
  },
  avatarContainer: {
    width: 35, // Smaller avatar
    height: 35, // Smaller avatar
    borderRadius: 17.5,
    overflow: 'hidden',
    backgroundColor: '#FF6347',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksNumber: {
    fontSize: 24, // Bigger task number
    color: '#f7e8d3',
    fontWeight: 'bold', // Bold task number
  },
  tasksContainer: {
    marginLeft: 'auto',
    paddingLeft: 20, // Increased spacing from user details
  }
});

export default LeaderboardScreen;