import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, 
  Alert, ActivityIndicator, Animated, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView,
  Dimensions, StyleSheet, ImageBackground
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../hooks/userHook';
import { 
  db, 
  createDocument, 
  updateDocument, 
  deleteDocument, 
  listenToQuery 
} from '../screens/firebase-services.js';
import { scheduleAreaReminder } from '../notifications/firebaseUtils';
import AnimatedProgressBar from './AnimatedProgressBar';
import { useTranslation } from 'react-i18next';
import OrganizationHelpModal from './OrganizationHelpModal';

const { width, height } = Dimensions.get('window');

const OrganizationProgressScreen = ({ onClose }) => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [areas, setAreas] = useState([]);
  const [newArea, setNewArea] = useState('');
  const { t } = useTranslation();
  const [newAreaType, setNewAreaType] = useState('home');
  const [progress, setProgress] = useState(0);
  const [loading, setIsLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [timeEstimate, setTimeEstimate] = useState('15');
  const [priorityLevel, setPriorityLevel] = useState('medium');
  const flatListRef = useRef(null);
  const fadeOutAnim = useRef({}).current;

  const handleBackPress = () => {
    if (onClose) {
      onClose(); // Use the provided onClose function
    } else {
      navigation.goBack(); // Fallback to navigation.goBack()
    }
  };

  const calculateProgress = useCallback((areasData) => {
    const completedAreas = areasData.filter(area => area.completed).length;
    const newProgress = areasData.length > 0 ? completedAreas / areasData.length : 0;
    setProgress(newProgress);
  }, []);

  useEffect(() => {
    if (user) {
      // Use standardized listenToQuery method
      const conditions = [
        ['userId', '==', user.uid]
      ];
      
      const unsubscribe = listenToQuery('organizationAreas', conditions, {}, (areasData) => {
        // Add fadeAnim to each area
        const enhancedAreas = areasData.map(area => ({
          ...area,
          fadeAnim: new Animated.Value(1) // Initialize fade animation value for each task
        }));
        
        setAreas(enhancedAreas);
        calculateProgress(enhancedAreas);
        setIsLoading(false);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
  
      return () => unsubscribe();
    }
  }, [user, calculateProgress]);

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

  const addArea = async () => {
    if (newArea.trim() !== '') {
      try {
        // Use standardized createDocument method
        const docId = await createDocument('organizationAreas', {
          userId: user.uid,
          name: newArea,
          type: newAreaType,
          completed: false,
          lastChecked: new Date(),
          timeEstimate: timeEstimate,
          priority: priorityLevel
        });
        
        // Reset form fields
        setNewArea('');
        setTimeEstimate('15');
        setPriorityLevel('medium');
        
        // Scroll to the end of the list
        flatListRef.current.scrollToEnd({ animated: true });
        
        // Optional: Show success message
        Alert.alert(t('organization.success'), t('organization.areaAddedSuccessfully'));
        
      } catch (error) {
        console.error('Error adding area:', error);
        Alert.alert(t('organization.error'), t('organization.failedToAddArea'));
      }
    }
  };

  const toggleArea = async (id, completed, name) => {
    try {
      if (!completed) {
        // Find the task and its animation value
        const task = areas.find(area => area.id === id);
        if (!task) return;

        // Start fade out animation
        Animated.timing(task.fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(async () => {
          // Update the database after animation completes using standardized method
          await updateDocument('organizationAreas', id, {
            completed: true,
            completedAt: new Date(),
            lastChecked: new Date()
          });
        });
      } else {
        // For uncompleting a task using standardized method
        await updateDocument('organizationAreas', id, {
          completed: false,
          completedAt: null,
          lastChecked: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating area:', error);
      Alert.alert(t('organization.error'), t('organization.failedToUpdateArea'));
    }
  };

  const toggleAreaType = async (id, currentType) => {
    const newType = currentType === 'home' ? 'office' : 'home';
    try {
      await updateDocument('organizationAreas', id, {
        type: newType,
        lastChecked: new Date()
      });
    } catch (error) {
      console.error('Error updating area type:', error);
      Alert.alert(t('organization.error'), t('organization.failedToUpdateAreaType'));
    }
  };

  const deleteArea = async (id) => {
    Alert.alert(
      t('organization.deleteArea'),
      t('organization.deleteConfirmation'),
      [
        { text: t('organization.cancel'), style: "cancel" },
        { text: t('organization.delete'), onPress: async () => {
          try {
            await deleteDocument('organizationAreas', id);
          } catch (error) {
            console.error('Error deleting area:', error);
            Alert.alert(t('organization.error'), t('organization.failedToDeleteArea'));
          }
        }}
      ]
    );
  };

  const goToHomeScreen = () => {
    if (onClose) {
      onClose();
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const renderArea = ({ item }) => {
    // Check if we should show this item
    if (item.completed && !showCompleted) {
      return null;
    }
  
    return (
      <Animated.View
        style={[
          styles.areaItem,
          {
            opacity: item.fadeAnim,
            display: item.completed && !showCompleted ? 'none' : 'flex',
          },
          item.priority === 'high' && styles.highPriorityArea,
          item.priority === 'medium' && styles.mediumPriorityArea,
          item.priority === 'low' && styles.lowPriorityArea,
        ]}
      >
        <TouchableOpacity 
          onPress={() => toggleArea(item.id, item.completed, item.name)} 
          style={styles.areaContent}
        >
          <View style={[styles.checkbox, item.completed && styles.checked]} />
          <View style={styles.areaInfoContainer}>
            <Text 
              style={[
                styles.areaText, 
                item.completed && styles.completedText
              ]}
            >
              {item.name}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.timeEstimate}>~{item.timeEstimate} mins</Text>
              {item.completed && item.completedAt && (
                <Text style={styles.completedDate}>
                  Done: {new Date(item.completedAt?.toDate()).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            onPress={() => toggleAreaType(item.id, item.type)} 
            style={styles.typeButton}
          >
            <FontAwesome 
              name={item.type === 'home' ? 'home' : 'building'} 
              size={24} 
              color="#4CAF50" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => deleteArea(item.id)} 
            style={styles.deleteButton}
          >
            <FontAwesome 
              name="trash-o" 
              size={24} 
              color="#FF6347" 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>{t('organization.loading')}</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../assets/splash.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardContainer}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <FontAwesome name="arrow-left" size={24} color="#f7e8d3" />
              </TouchableOpacity>
              <Text style={styles.title}>{t('organization.title')}</Text>
              <TouchableOpacity 
                onPress={handleOpenHelpModal}
                style={styles.tipsButton}
              >
                <FontAwesome name="lightbulb-o" size={24} color="#f7e8d3" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={() => setShowCompleted(!showCompleted)} 
                style={styles.toggleButton}
              >
                <FontAwesome 
                  name={showCompleted ? "eye-slash" : "eye"} 
                  size={18} 
                  color="#f7e8d3" 
                />
                <Text style={styles.toggleButtonText}>
                  {showCompleted ? t('organization.hideCompleted') : t('organization.showCompleted')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contentContainer}>
              <AnimatedProgressBar progress={progress} duration={1000} />
              <Text style={styles.progressText}>
                {`${Math.round(progress * 100)}% ${t('organization.complete')}`}
              </Text>
              
              <FlatList
                ref={flatListRef}
                data={areas}
                renderItem={renderArea}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={newArea}
                  onChangeText={setNewArea}
                  placeholder={t('organization.addNewArea')}
                  placeholderTextColor="#f7e8d3"
                />
                <TouchableOpacity 
                  onPress={() => setNewAreaType(newAreaType === 'home' ? 'office' : 'home')} 
                  style={styles.iconButton}
                >
                  <FontAwesome 
                    name={newAreaType === 'home' ? 'home' : 'building'} 
                    size={24} 
                    color="#4CAF50" 
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={addArea} style={styles.addButton}>
                  <FontAwesome name="plus" size={20} color="#f7e8d3" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputOptions}>
                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={styles.timeInput}
                    value={timeEstimate}
                    onChangeText={setTimeEstimate}
                    keyboardType="numeric"
                    placeholder={t('organization.timeEstimate')}
                    placeholderTextColor="#f7e8d3"
                  />
                  <Text style={styles.timeLabel}>{t('organization.minutes')}</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.priorityButton, styles[`priority${priorityLevel}`]]}
                  onPress={() => {
                    const levels = ['low', 'medium', 'high'];
                    const currentIndex = levels.indexOf(priorityLevel);
                    setPriorityLevel(levels[(currentIndex + 1) % 3]);
                  }}
                >
                  <Text style={styles.priorityButtonText}>
                    {t(`organization.priority.${priorityLevel}`)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* New Help Modal Implementation */}
            <OrganizationHelpModal
              visible={showHelpModal}
              onClose={handleCloseHelpModal}
              fadeAnim={fadeAnim}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: 15,
    backgroundColor: 'transparent',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#f7e8d3",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#f7e8d3',
  },
  list: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingBottom: 20,
  },
  inputContainer: {
    padding: 15,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#FF6347',
    borderRadius: 8,
    padding: 12,
    color: '#f7e8d3',
    backgroundColor: 'rgba(26,26,26,0.8)',
    fontSize: 16,
  },
  iconButton: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(26,26,26,0.8)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 45,
    height: 45,
    backgroundColor: '#FF6347',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,26,26,0.8)',
    padding: 7.5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF6347',
    marginBottom: 10,
  },
  areaContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 5,
  },
  areaInfoContainer: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FF6347',
    borderRadius: 12,
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#FF6347',
  },
  areaText: {
    fontSize: 16,
    flex: 1,
    color: '#f7e8d3',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#f7e8d3',
    opacity: 0.7,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,26,26,0.8)',
    borderRadius: 8,
    padding: 8,
  },
  timeInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#FF6347',
    borderRadius: 5,
    padding: 5,
    marginRight: 10,
    color: '#f7e8d3',
    backgroundColor: 'rgba(26,26,26,0.8)',
    textAlign: 'center',
  },
  timeLabel: {
    color: '#f7e8d3',
    marginLeft: 5,
    fontSize: 14,
    opacity: 0.8,
  },
  priorityButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  prioritylow: {
    backgroundColor: '#4CAF50',
  },
  prioritymedium: {
    backgroundColor: '#FFA500',
  },
  priorityhigh: {
    backgroundColor: '#FF6347',
  },
  priorityButtonText: {
    color: '#f7e8d3',
    fontWeight: 'bold',
    fontSize: 14,
  },
  highPriorityArea: {
    borderColor: '#FF6347',
    borderWidth: 3,
  },
  mediumPriorityArea: {
    borderColor: '#FFA500',
    borderWidth: 2,
  },
  lowPriorityArea: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  tipsButton: {
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedDate: {
    fontSize: 12,
    color: '#f7e8d3',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  timeEstimate: {
    fontSize: 12,
    color: '#f7e8d3',
    opacity: 0.7,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,26,26,0.5)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    gap: 8,
  },
  toggleButtonText: {
    color: '#f7e8d3',
    fontSize: 12,
  },
  inputOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  loadingText: {
    color: '#F7e8d3',
    fontSize: 16,
    marginTop: 10,
  },
});

export default OrganizationProgressScreen;