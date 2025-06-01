import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, 
  Animated, Vibration, Switch,
  ActivityIndicator, ScrollView,
  SafeAreaView, Platform, StatusBar, StyleSheet, ImageBackground,
  Dimensions
} from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MindCoolingHelpModal from '../components/MindCoolingHelpModal';

const { width, height } = Dimensions.get('window');

const MindCoolingFeature = ({ animatedValue, onClose }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [currentThought, setCurrentThought] = useState('');
  const [thoughts, setThoughts] = useState([]);
  const [sound, setSound] = useState();
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [useHaptics, setUseHaptics] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    lastSession: null,
    notificationsEnabled: false
  });
  const [showSettings, setShowSettings] = useState(false);
  
  const timerRef = useRef(null);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    { key: 'urgent', translationKey: 'mindCooling.categories.urgent' },
    { key: 'important', translationKey: 'mindCooling.categories.important' },
    { key: 'random', translationKey: 'mindCooling.categories.random' },
    { key: 'worry', translationKey: 'mindCooling.categories.worry' }
  ];
  
  const [selectedCategory, setSelectedCategory] = useState('random');

  const audioTracks = [
    { name: t('mindCooling.track1'), file: require('../assets/meditation.wav') },
    { name: t('mindCooling.track2'), file: require('../assets/meditation_2.mp3') },
    { name: t('mindCooling.track3'), file: require('../assets/meditation_3.mp3') },
  ];

  // All your existing functions (loadSavedData, saveThoughts, etc.)
  // ...

  const loadSavedData = async () => {
    try {
      const [thoughtsData, preferencesData, statsData] = await Promise.all([
        AsyncStorage.getItem('thoughts'),
        AsyncStorage.getItem('mindCoolingPreferences'),
        AsyncStorage.getItem('sessionStats')
      ]);

      if (thoughtsData) setThoughts(JSON.parse(thoughtsData));
      
      if (preferencesData) {
        const { savedVolume, savedHaptics, savedShowCompleted } = JSON.parse(preferencesData);
        setVolume(savedVolume);
        setUseHaptics(savedHaptics);
        setShowCompleted(savedShowCompleted);
      }

      if (statsData) setSessionStats(JSON.parse(statsData));
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const saveThoughts = async (updatedThoughts) => {
    try {
      await AsyncStorage.setItem('thoughts', JSON.stringify(updatedThoughts));
    } catch (error) {
      console.error('Error saving thoughts:', error);
    }
  };

  const savePreferences = async () => {
    try {
      const preferences = {
        savedVolume: volume,
        savedHaptics: useHaptics,
        savedShowCompleted: showCompleted
      };
      await AsyncStorage.setItem('mindCoolingPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const updateSessionStats = async () => {
    const newStats = {
      totalSessions: sessionStats.totalSessions + 1,
      totalDuration: sessionStats.totalDuration + timer,
      lastSession: new Date().toISOString(),
      notificationsEnabled: sessionStats.notificationsEnabled
    };
    setSessionStats(newStats);
    try {
      await AsyncStorage.setItem('sessionStats', JSON.stringify(newStats));
    } catch (error) {
      console.error('Error saving session stats:', error);
    }
  };

  const addThought = () => {
    if (currentThought.trim() !== '') {
      const newThought = {
        id: Date.now().toString(),
        text: currentThought,
        category: selectedCategory,
        timestamp: new Date().toISOString(),
        completed: false
      };
      const updatedThoughts = [...thoughts, newThought];
      setThoughts(updatedThoughts);
      saveThoughts(updatedThoughts);
      setCurrentThought('');
      
      if (useHaptics) {
        Vibration.vibrate(50);
      }

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const toggleThoughtCompletion = (id) => {
    const updatedThoughts = thoughts.map(thought => {
      if (thought.id === id) {
        return { ...thought, completed: !thought.completed };
      }
      return thought;
    });
    setThoughts(updatedThoughts);
    saveThoughts(updatedThoughts);
    
    if (useHaptics) {
      Vibration.vibrate(100);
    }
  };

  const deleteThought = (id) => {
    const updatedThoughts = thoughts.filter(thought => thought.id !== id);
    setThoughts(updatedThoughts);
    saveThoughts(updatedThoughts);
    
    if (useHaptics) {
      Vibration.vibrate([0, 50, 50, 50]);
    }
  };

  const startTimer = useCallback(() => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
  }, [isTimerRunning]);

  const stopTimer = useCallback(() => {
    if (isTimerRunning) {
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      updateSessionStats();
    }
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (sound && isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        stopTimer();
      } else if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
        startTimer();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          audioTracks[selectedTrack].file,
          { shouldPlay: true, volume },
          (status) => {
            if (status.didJustFinish) {
              setIsPlaying(false);
              stopTimer();
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
        startTimer();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackChange = async (index) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        stopTimer();
      }
      
      setSelectedTrack(index);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioTracks[index].file,
        { shouldPlay: true, volume },
        (status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            stopTimer();
          }
        }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      startTimer();
    } catch (error) {
      console.error('Error changing track:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    if (onClose) {
      onClose();
    }
    navigation.goBack();
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
  
  const filteredThoughts = showCompleted 
    ? thoughts 
    : thoughts.filter(thought => !thought.completed);

  // Effect hooks
  useEffect(() => {
    loadSavedData();
    return () => {
      stopTimer();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (showHelpModal) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showHelpModal]);

  // We won't use this function since we're keeping original styling

  return (
    <ImageBackground source={require('../assets/splash.png')} style={styles.container}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />
          
          {/* Top Header - Light Density Zone */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
                <FontAwesome name="arrow-left" size={24} color="#f7e8d3" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>{t('mindCooling.title')}</Text>
              
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={() => setShowSettings(!showSettings)}
                >
                  <FontAwesome name="cog" size={22} color="#f7e8d3" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowHelpModal(true)}>
                  <FontAwesome name="question-circle" size={22} color="#f7e8d3" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Main Content Area - Follows Goldilocks Grid */}
          <ScrollView 
            style={styles.mainContent} 
            showsVerticalScrollIndicator={false}
            ref={scrollViewRef}
          >
            {/* Stats Bar - Minimal Density Info */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{sessionStats.totalSessions}</Text>
                <Text style={styles.statLabel}>{t('mindCooling.totalSessions')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.floor(sessionStats.totalDuration / 60)}</Text>
                <Text style={styles.statLabel}>{t('mindCooling.stats.totalMinutes')}</Text>
              </View>
            </View>
            
            {/* PRIMARY FOCUS AREA - Meditation Controls */}
            <View style={styles.primaryFocusArea}>
              <View style={styles.meditationCard}>
                <View style={styles.timer}>
                  <Text style={styles.timerText}>{formatTime(timer)}</Text>
                  <Text style={styles.timerLabel}>
                    {isTimerRunning ? t('mindCooling.meditating') : t('mindCooling.ready')}
                  </Text>
                </View>
                
                <View style={styles.trackRow}>
                  {audioTracks.map((track, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.trackButton,
                        selectedTrack === index && styles.trackButtonSelected,
                        isLoading && styles.disabledButton
                      ]}
                      onPress={() => handleTrackChange(index)}
                      disabled={isLoading}
                    >
                      <Text style={[
                        styles.trackButtonText,
                        selectedTrack === index && styles.trackButtonTextSelected
                      ]}>
                        {track.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TouchableOpacity 
                  style={[styles.playButton, isLoading && styles.disabledButton]} 
                  onPress={handlePlayPause}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#f7e8d3" />
                  ) : (
                    <>
                      <FontAwesome 
                        name={isPlaying ? "pause" : "play"} 
                        size={24} 
                        color="#f7e8d3" 
                      />
                      <Text style={styles.playButtonText}>
                        {isPlaying ? t('mindCooling.pause') : t('mindCooling.play')}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            {/* SECONDARY MODULES - Input Area */}
            <View style={styles.secondaryModulesRow}>
              <View style={styles.inputArea}>
                <View style={styles.categoriesList}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category.key}
                      style={[
                        styles.categoryChip,
                        selectedCategory === category.key && styles.categoryChipSelected
                      ]}
                      onPress={() => setSelectedCategory(category.key)}
                    >
                      <Text style={[
                        styles.categoryText,
                        selectedCategory === category.key && styles.categoryTextSelected
                      ]}>
                        {t(category.translationKey)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TextInput
                  style={styles.textInput}
                  value={currentThought}
                  onChangeText={setCurrentThought}
                  placeholder={t('mindCooling.inputPlaceholder')}
                  placeholderTextColor="rgba(247, 232, 211, 0.6)"
                  multiline
                />
    
                <TouchableOpacity 
                  style={styles.addButton} 
                  onPress={addThought}
                >
                  <Text style={styles.addButtonText}>{t('mindCooling.addThought')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* ATTENTION RESTORATION ZONE - Thoughts List with reduced complexity */}
            <View style={styles.attentionRestorationZone}>
              <View style={styles.thoughtsHeader}>
                <Text style={styles.sectionTitle}>{t('mindCooling.thoughts')}</Text>
                <TouchableOpacity onPress={() => setShowCompleted(!showCompleted)}>
                  <Text style={styles.filterText}>
                    {showCompleted ? t('mindCooling.hideCompleted') : t('mindCooling.showCompleted')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.thoughtsList}>
                {filteredThoughts.length === 0 ? (
                  <Text style={styles.emptyListText}>
                    {t('mindCooling.noThoughts', 'Thoughts you capture will appear here')}
                  </Text>
                ) : (
                  filteredThoughts.map(thought => (
                    <View 
                      key={thought.id} 
                      style={styles.thoughtItem}
                    >
                      <TouchableOpacity 
                        style={styles.completionButton}
                        onPress={() => toggleThoughtCompletion(thought.id)}
                      >
                        <FontAwesome 
                          name={thought.completed ? "check-circle" : "circle-o"} 
                          size={22} 
                          color={thought.completed ? "#4CAF50" : "#f7e8d3"} 
                        />
                      </TouchableOpacity>
      
                      <View style={styles.thoughtContent}>
                        <Text style={[
                          styles.thoughtText,
                          thought.completed && styles.thoughtTextCompleted
                        ]}>
                          {thought.text}
                        </Text>
                        <View style={styles.thoughtMeta}>
                          <Text style={styles.thoughtMetaText}>
                            {new Date(thought.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </Text>
                          <Text style={styles.thoughtCategory}>
                            {t(`mindCooling.categories.${thought.category}`)}
                          </Text>
                        </View>
                      </View>
      
                      <TouchableOpacity 
                        onPress={() => deleteThought(thought.id)}
                        style={styles.deleteButton}
                      >
                        <FontAwesome name="trash-o" size={18} color="#FF6347" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
          
          {/* Settings Panel - Slides in from side or bottom based on Goldilocks Grid */}
          {showSettings && (
            <Animated.View style={[
              styles.settingsContainer,
              { opacity: fadeAnim }
            ]}>
              <View style={styles.settingsHeader}>
                <Text style={styles.settingsTitle}>{t('mindCooling.settings.title')}</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <FontAwesome name="times" size={22} color="#f7e8d3" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.settingsList}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t('mindCooling.useHaptics')}</Text>
                  <Switch
                    value={useHaptics}
                    onValueChange={(value) => {
                      setUseHaptics(value);
                      savePreferences();
                    }}
                  />
                </View>
                
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t('mindCooling.showCompleted')}</Text>
                  <Switch
                    value={showCompleted}
                    onValueChange={(value) => {
                      setShowCompleted(value);
                      savePreferences();
                    }}
                  />
                </View>
    
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t('mindCooling.settings.notifications')}</Text>
                  <Switch
                    value={sessionStats.notificationsEnabled}
                    onValueChange={(value) => {
                      setSessionStats(prev => ({
                        ...prev,
                        notificationsEnabled: value
                      }));
                      savePreferences();
                    }}
                  />
                </View>
              </View>
            </Animated.View>
          )}
          
          {/* Help Modal */}
          <MindCoolingHelpModal
            visible={showHelpModal}
            onClose={handleCloseHelpModal}
            fadeAnim={fadeAnim}
          />
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

export default MindCoolingFeature;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  safeArea: {
    flex: 1,
  },
  // Header - Transparent like original
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f7e8d3',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Main Content
  mainContent: {
    flex: 1,
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f7e8d3',
  },
  statLabel: {
    fontSize: 12,
    color: '#f7e8d3',
    opacity: 0.7,
    marginTop: 4,
  },
  // PRIMARY FOCUS AREA - maintain original styling
  primaryFocusArea: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    marginBottom: 8,
  },
  meditationCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 16,
  },
  timer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#f7e8d3',
  },
  timerLabel: {
    fontSize: 14,
    color: '#f7e8d3',
    opacity: 0.7,
    marginTop: 4,
  },
  trackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  trackButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a69bd',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 105, 189, 0.1)',
  },
  trackButtonSelected: {
    backgroundColor: '#4a69bd',
  },
  trackButtonText: {
    color: '#f7e8d3',
    opacity: 0.9,
  },
  trackButtonTextSelected: {
    opacity: 1,
    fontWeight: '600',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a69bd',
    padding: 14,
    borderRadius: 8,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  playButtonText: {
    color: '#f7e8d3',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // SECONDARY MODULES
  secondaryModulesRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  inputArea: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 16,
  },
  categoriesList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6347',
    backgroundColor: 'rgba(255,99,71,0.1)',
    minWidth: '22%',
    alignItems: 'center',
  },
  categoryChipSelected: {
    backgroundColor: '#FF6347',
  },
  categoryText: {
    color: '#FF6347',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#f7e8d3',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#f7e8d3',
    borderRadius: 8,
    padding: 14,
    minHeight: 50,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#FF6347',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#f7e8d3',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // ATTENTION RESTORATION ZONE - with original styling
  attentionRestorationZone: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 8,
    padding: 16,
  },
  thoughtsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f7e8d3',
  },
  filterText: {
    color: '#4a69bd',
    fontSize: 14,
  },
  thoughtsList: {
    flex: 1,
  },
  thoughtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  completionButton: {
    padding: 4,
  },
  thoughtContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  thoughtText: {
    fontSize: 16,
    color: '#f7e8d3',
    marginBottom: 4,
  },
  thoughtTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  thoughtMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thoughtMetaText: {
    fontSize: 12,
    color: '#f7e8d3',
    opacity: 0.7,
  },
  thoughtCategory: {
    fontSize: 12,
    color: '#FF6347',
  },
  deleteButton: {
    padding: 6,
  },
  emptyListText: {
    color: 'rgba(247, 232, 211, 0.6)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  
  // Settings Panel - More professional styling
  settingsContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: 'rgba(20, 20, 20, 0.92)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.15)',
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    zIndex: 100,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f7e8d3',
  },
  settingsList: {
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLabel: {
    fontSize: 16,
    color: '#f7e8d3',
  },
  
  // Common styles
  disabledButton: {
    opacity: 0.5,
  },
});