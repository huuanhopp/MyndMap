import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
  Easing,
  ActivityIndicator,
  FlatList,
  ImageBackground,
  TextInput,
  StatusBar
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { db } from './firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useUser } from '../hooks/userHook';
import { NoteItem } from '../components/notes/NoteItem';
import { CategoryModal } from '../components/notes/CategoryModal';
import styles from '../styles/NotesScreenStyles';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import GroceryListScreen from './GroceryListScreen';

const { width, height } = Dimensions.get('window');

// Enhanced categories with better visual hierarchy
const CATEGORIES = [
  { id: "Tasks", cogLoad: "high", color: "#4CAF50", icon: "check-square-o" },
  { id: "Ideas", cogLoad: "medium", color: "#2196F3", icon: "lightbulb-o" },
  { id: "Personal", cogLoad: "medium", color: "#9C27B0", icon: "user" },
  { id: "Work", cogLoad: "high", color: "#FF9800", icon: "briefcase" },
  { id: "Quick", cogLoad: "low", color: "#8BC34A", icon: "bolt" },
  { id: "Remember", cogLoad: "low", color: "#FFC107", icon: "bell" },
  { id: "Other", cogLoad: "low", color: "#757575", icon: "tag" }
];

// Energy level options with clear visual mapping
const ENERGY_LEVELS = [
  { id: 'low', label: 'Low Focus', color: '#8BC34A', icon: 'battery-1' },
  { id: 'medium', label: 'Medium Focus', color: '#FFC107', icon: 'battery-2' },
  { id: 'high', label: 'High Focus', color: '#F44336', icon: 'battery-3' }
];

// Time estimate options
const TIME_ESTIMATES = [
  { label: "< 5m", value: "< 5m", color: "#8BC34A" },
  { label: "15m", value: "15m", color: "#FFC107" },
  { label: "30m", value: "30m", color: "#FF9800" },
  { label: "1h+", value: "1h+", color: "#F44336" }
];

const GroceryListButton = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity
      style={styles.groceryListButton}
      onPress={() => navigation.navigate('Grocery')}
    >
      <View style={styles.groceryIconContainer}>
        <FontAwesome name="shopping-basket" size={18} color="#4CAF50" />
      </View>
      <Text style={styles.groceryListButtonText}>Grocery List</Text>
    </TouchableOpacity>
  );
};

// Simplified Time Estimate Selector
const TimeEstimateSelector = ({ value, onChange }) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.timeEstimateContainer}>
      <View style={styles.timeOptionsRow}>
        {TIME_ESTIMATES.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timeOptionButton,
              { borderColor: option.color },
              value === option.value && { backgroundColor: `${option.color}30` }
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text 
              style={[
                styles.timeOptionText, 
                { color: value === option.value ? option.color : '#F7E8D3' },
                value === option.value && { fontWeight: '600' }
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Tags Input with improved keyboard handling
const TagsInput = ({ tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');
  const { t } = useTranslation();
  
  const addTag = () => {
    if (!inputValue.trim()) return;
    const newTags = [...tags, inputValue.trim()];
    onTagsChange(newTags);
    setInputValue('');
  };
  
  const removeTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onTagsChange(newTags);
  };
  
  return (
    <View style={styles.tagsContainer}>
      <View style={styles.tagsInputRow}>
        <TextInput
          style={styles.tagInput}
          placeholder="Add tags... (Press Enter to add)"
          placeholderTextColor="rgba(247, 232, 211, 0.5)"
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={addTag}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
          <FontAwesome name="plus" size={14} color="#F7E8D3" />
        </TouchableOpacity>
      </View>
      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(index)}>
                <FontAwesome name="times" size={12} color="#F7E8D3" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Clean, minimalist filter component
const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.filterTabsContainer}>
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === 'all' && styles.activeFilterTab]}
        onPress={() => onFilterChange('all')}
      >
        <Text style={[styles.filterTabText, activeFilter === 'all' && styles.activeFilterTabText]}>All</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === 'low' && styles.activeFilterTab]}
        onPress={() => onFilterChange('low')}
      >
        <Text style={[styles.filterTabText, activeFilter === 'low' && styles.activeFilterTabText]}>Low Focus</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === 'medium' && styles.activeFilterTab]}
        onPress={() => onFilterChange('medium')}
      >
        <Text style={[styles.filterTabText, activeFilter === 'medium' && styles.activeFilterTabText]}>Medium</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === 'high' && styles.activeFilterTab]}
        onPress={() => onFilterChange('high')}
      >
        <Text style={[styles.filterTabText, activeFilter === 'high' && styles.activeFilterTabText]}>High Focus</Text>
      </TouchableOpacity>
    </View>
  );
};

const NotesScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();
  
  // Main state management
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Tasks');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [energyLevel, setEnergyLevel] = useState(null);
  const [timeEstimate, setTimeEstimate] = useState('');
  const [tags, setTags] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Keyboard handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Animation setup
  useEffect(() => {
    // Simple fade in animation for professional feel
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Fetch notes when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        navigation.navigate('Login');
        return;
      }
      
      const unsubscribe = fetchNotes();
      return () => unsubscribe && unsubscribe();
    }, [user, navigation])
  );
  
  const fetchNotes = useCallback(() => {
    if (!user?.uid) {
      setIsLoading(false);
      setNotes([]);
      return () => {};
    }

    const q = query(
      collection(db, "notes"), 
      where("userId", "==", user.uid)
    );
    
    return onSnapshot(q, 
      (querySnapshot) => {
        const notesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure consistent format for all notes
          tags: doc.data().tags || [],
          timeEstimate: doc.data().timeEstimate || '',
          energyLevel: doc.data().energyLevel || 'medium',
          category: doc.data().category || 'Other'
        }));
        
        // Sort by most recent first
        setNotes(notesList.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        setIsLoading(false);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      },
      (error) => {
        console.error("Error fetching notes:", error);
        Alert.alert(
          "Error",
          t('notes.loading')
        );
        setIsLoading(false);
      }
    );
  }, [user, fadeAnim, t]);
  
  // Add new note
  const handleAddNote = async () => {
    if (!user?.uid || !newNote.trim()) {
      if (!newNote.trim()) {
        Alert.alert(
          "Empty Note",
          "Please add some content to your note before saving."
        );
      }
      return;
    }
  
    try {
      // Find the category object
      const categoryObj = CATEGORIES.find(cat => cat.id === selectedCategory) || CATEGORIES[0];
      
      const noteData = {
        userId: user.uid,
        content: newNote.trim(),
        category: selectedCategory,
        categoryColor: categoryObj.color,
        cognitiveLoad: categoryObj.cogLoad || 'medium',
        energyLevel: energyLevel || 'medium',
        timeEstimate: timeEstimate,
        tags: tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
  
      if (editingNote) {
        await updateDoc(doc(db, "notes", editingNote.id), {
          ...noteData,
          createdAt: editingNote.createdAt
        });
        setEditingNote(null);
      } else {
        await addDoc(collection(db, "notes"), noteData);
      }
      
      resetForm();
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error saving note:", error);
      Alert.alert(
        "Error",
        "Failed to save note. Please try again."
      );
    }
  };
  
  const handleHelpPress = () => {
    Alert.alert(
      t('notes.helpTitle'),
      t('notes.helpWelcome') + '\n\n' +
      t('notes.helpCreating') + '\n' +
      t('notes.helpCreatingSteps') + '\n\n' +
      t('notes.helpCategories') + '\n' +
      t('notes.helpCategoriesDetails') + '\n\n' +
      t('notes.helpEditing') + '\n' +
      t('notes.helpEditingSteps') + '\n\n' +
      t('notes.helpFiltering') + '\n' +
      t('notes.helpFilteringDetails') + '\n\n' +
      t('notes.helpGroceries') + '\n' +
      t('notes.helpGroceriesDetails') + '\n\n' +
      t('notes.helpRemember')
    );
  };

  const handleDeleteNote = async (noteId) => {
    try {
      Alert.alert(
        t('notes.alerts.deleteNoteTitle'),
        t('notes.alerts.deleteNoteMessage'),
        [
          {
            text: t('notes.cancel'),
            style: "cancel"
          },
          {
            text: "Delete",
            onPress: async () => {
              await deleteDoc(doc(db, "notes", noteId));
            },
            style: "destructive"
          }
        ]
      );
    } catch (error) {
      console.error("Error deleting note:", error);
      Alert.alert(
        "Error",
        "Failed to delete note. Please try again."
      );
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNewNote(note.content);
    setSelectedCategory(note.category);
    setEnergyLevel(note.energyLevel);
    setTimeEstimate(note.timeEstimate || '');
    setTags(note.tags || []);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const resetForm = () => {
    setEditingNote(null);
    setNewNote('');
    setSelectedCategory('Tasks');
    setEnergyLevel(null);
    setTimeEstimate('');
    setTags([]);
  };
  
  const filteredNotes = notes.filter(note => {
    // Cognitive load filter
    if (activeFilter !== 'all' && note.cognitiveLoad !== activeFilter && note.energyLevel !== activeFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesContent = note.content.toLowerCase().includes(query);
      const matchesCategory = note.category.toLowerCase().includes(query);
      const matchesTags = note.tags && note.tags.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesContent && !matchesCategory && !matchesTags) {
        return false;
      }
    }
    
    return true;
  });

  const contentTranslateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#F7e8d3" />
        <Text style={styles.loadingText}>{t('notes.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require('../assets/splash.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: contentTranslateY }],
                }
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
  <TouchableOpacity
    style={styles.headerButton}
    onPress={() => navigation.goBack()}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <FontAwesome name="arrow-left" size={24} color="#F7E8D3" />
  </TouchableOpacity>

  <Text style={styles.title}>{t('notes.title')}</Text>

  <View style={styles.headerActions}>
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => navigation.navigate('Grocery')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <FontAwesome name="shopping-basket" size={22} color="#4CAF50" />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.headerButton}
      onPress={handleHelpPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <FontAwesome name="question-circle" size={24} color="#F7E8D3" />
    </TouchableOpacity>
  </View>
</View>
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <FontAwesome name="search" size={16} color="#F7E8D3" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search notes, tags, categories..."
                  placeholderTextColor="rgba(247, 232, 211, 0.5)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery ? (
                  <TouchableOpacity 
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <FontAwesome name="times-circle" size={16} color="#F7E8D3" />
                  </TouchableOpacity>
                ) : null}
              </View>
              
              {/* Filter Tabs */}
              <FilterTabs
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
              />
  
              {/* Input Section */}
              <View style={[
                styles.inputSection,
                isInputFocused && styles.inputSectionFocused
              ]}>
                <TextInput
                  style={styles.noteInput}
                  placeholder={t('notes.noteContent')}
                  placeholderTextColor="rgba(247, 232, 211, 0.5)"
                  multiline
                  value={newNote}
                  onChangeText={setNewNote}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  maxLength={500}
                />
                
                <View style={styles.inputOptionsRow}>
                  {/* Category Selector */}
                  <TouchableOpacity
                    style={styles.categoryPill}
                    onPress={() => setShowCategoryModal(true)}
                  >
                    <FontAwesome
                      name={CATEGORIES.find(cat => cat.id === selectedCategory)?.icon || "tag"}
                      size={14}
                      color={CATEGORIES.find(cat => cat.id === selectedCategory)?.color || "#F7E8D3"}
                    />
                    <Text style={styles.categoryPillText}>
                      {t(`notes.categories.${selectedCategory.toLowerCase()}`)}
                    </Text>
                    <FontAwesome name="chevron-down" size={12} color="#F7E8D3" />
                  </TouchableOpacity>
                  
                  {/* Energy Level Selector */}
                  <View style={styles.energyLevelContainer}>
                    {ENERGY_LEVELS.map(level => (
                      <TouchableOpacity
                        key={level.id}
                        style={[
                          styles.energyLevelButton,
                          energyLevel === level.id && { borderColor: level.color, backgroundColor: `${level.color}30` }
                        ]}
                        onPress={() => setEnergyLevel(level.id)}
                      >
                        <FontAwesome name={level.icon} size={16} color={energyLevel === level.id ? level.color : '#F7E8D3'} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Time Estimate Selector */}
                <TimeEstimateSelector
                  value={timeEstimate}
                  onChange={setTimeEstimate}
                />
                
                {/* Tags Input */}
                <TagsInput
                  tags={tags}
                  onTagsChange={setTags}
                />
                
                {/* Character count */}
                <Text style={styles.characterCount}>
                  {newNote.length}/500 characters
                </Text>
                
                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {editingNote && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={resetForm}
                    >
                      <Text style={styles.actionButtonText}>{t('notes.cancel')}</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[
                      styles.actionButton, 
                      (!newNote.trim() && styles.actionButtonDisabled)
                    ]}
                    onPress={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    <Text style={styles.actionButtonText}>{editingNote ? t('notes.saveNote') : t('notes.addNote')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
  
              {/* Notes List */}
              <FlatList
                data={filteredNotes}
                renderItem={({ item }) => {
                  // Find the color for the note's category
                  const categoryObj = CATEGORIES.find(cat => cat.id === item.category) || 
                                      { id: item.category, color: "#757575", icon: "tag", cogLoad: "medium" };
                  
                  // Find the energy level
                  const energyObj = ENERGY_LEVELS.find(level => level.id === item.energyLevel) || ENERGY_LEVELS[1];
                  
                  // Format the date
                  const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    return date.toLocaleDateString(undefined, { 
                      month: 'short',
                      day: 'numeric',
                      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    });
                  };
                  
                  return (
                    <Animated.View style={{ opacity: fadeAnim }}>
                      <TouchableOpacity
                        style={[
                          styles.noteItem,
                          { borderLeftColor: categoryObj.color || item.categoryColor || '#757575' }
                        ]}
                        onPress={() => handleEditNote(item)}
                        activeOpacity={0.7}
                      >
                        {/* Note Header */}
                        <View style={styles.noteItemHeader}>
                          <View style={styles.noteItemCategory}>
                            <FontAwesome
                              name={categoryObj.icon}
                              size={12}
                              color={categoryObj.color}
                              style={styles.categoryIcon}
                            />
                            <Text style={[styles.categoryText, { color: categoryObj.color }]}>
                              {t(`notes.categories.${item.category.toLowerCase()}`)}
                            </Text>
                          </View>
                          
                          <View style={styles.noteItemMeta}>
                            {/* Energy level */}
                            {item.energyLevel && (
                              <View style={[
                                styles.energyBadge, 
                                { borderColor: energyObj.color }
                              ]}>
                                <FontAwesome name={energyObj.icon} size={10} color={energyObj.color} />
                              </View>
                            )}
                            
                            {/* Time estimate */}
                            {item.timeEstimate && (
                              <View style={styles.timeBadge}>
                                <FontAwesome name="clock-o" size={10} color="#F7E8D3" />
                                <Text style={styles.timeBadgeText}>{item.timeEstimate}</Text>
                              </View>
                            )}
                            
                            {/* Date */}
                            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                          </View>
                        </View>
                        
                        {/* Note Content */}
                        <Text style={styles.noteContent} numberOfLines={4}>
                          {item.content}
                        </Text>
                        
                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <View style={styles.tagsRow}>
                            {item.tags.map((tag, index) => (
                              <View key={index} style={styles.tagDisplay}>
                                <Text style={styles.tagDisplayText}>{tag}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        
                        {/* Action Buttons */}
                        <View style={styles.noteItemActions}>
                          <TouchableOpacity
                            style={styles.noteItemActionButton}
                            onPress={() => handleDeleteNote(item.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <FontAwesome name="trash" size={16} color="#FF6347" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                }}
                keyExtractor={item => item.id}
                style={styles.notesList}
                contentContainerStyle={styles.notesListContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <FontAwesome name="sticky-note-o" size={48} color="#F7e8d3" style={styles.emptyIcon} />
                    <Text style={styles.emptyText}>
                      {t('notes.emptyList')}
                    </Text>
                    {searchQuery && (
                      <TouchableOpacity
                        style={styles.clearSearchButton}
                        onPress={() => setSearchQuery('')}
                      >
                        <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                }
              />
  
              {/* Category Modal */}
              <CategoryModal
                visible={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                onSelect={handleCategorySelect}
                categories={CATEGORIES.map(cat => cat.id)}
                selectedCategory={selectedCategory}
                categoryData={CATEGORIES}
              />
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </View>
  );
};

export default NotesScreen;