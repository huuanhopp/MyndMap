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
  ImageBackground,
  TextInput,
  StatusBar,
  FlatList,
  Switch,
  Vibration,
  ActivityIndicator
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { db } from './firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { useUser } from '../hooks/userHook';
import styles from '../styles/GroceryListScreenStyles';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import DraggableFlatList from 'react-native-draggable-flatlist';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width, height } = Dimensions.get('window');

// Store sections (categories) with visual cues and ordering
const STORE_SECTIONS = [
  { id: "produce", name: "Produce", color: "#4CAF50", icon: "leaf", order: 1 },
  { id: "dairy", name: "Dairy & Eggs", color: "#2196F3", icon: "glass", order: 2 },
  { id: "bakery", name: "Bakery", color: "#FFC107", icon: "birthday-cake", order: 3 },
  { id: "meat", name: "Meat & Seafood", color: "#F44336", icon: "cutlery", order: 4 },
  { id: "frozen", name: "Frozen Foods", color: "#00BCD4", icon: "snowflake-o", order: 5 },
  { id: "pantry", name: "Pantry", color: "#FF9800", icon: "archive", order: 6 },
  { id: "snacks", name: "Snacks", color: "#9C27B0", icon: "cookie", order: 7 },
  { id: "beverages", name: "Beverages", color: "#607D8B", icon: "coffee", order: 8 },
  { id: "household", name: "Household", color: "#795548", icon: "home", order: 9 },
  { id: "personal", name: "Personal Care", color: "#E91E63", icon: "user-md", order: 10 },
  { id: "other", name: "Other", color: "#9E9E9E", icon: "shopping-basket", order: 11 }
];

// Priority levels with clear visual indicators
const PRIORITY_LEVELS = [
  { id: "essential", name: "Essential", color: "#F44336", icon: "exclamation-circle" },
  { id: "needed", name: "Needed", color: "#FF9800", icon: "exclamation" },
  { id: "optional", name: "Optional", color: "#8BC34A", icon: "check-circle" }
];

// Item quantity presets for quick selection
const QUANTITY_PRESETS = ["1", "2", "3", "4", "5", "6", "10", "12"];

const GroceryListScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();
  const confettiRef = useRef(null);
  
  // Main state management
  const [isLoading, setIsLoading] = useState(true);
  const [groceryItems, setGroceryItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [selectedSection, setSelectedSection] = useState('produce');
  const [selectedPriority, setSelectedPriority] = useState('needed');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'remaining', 'completed'
  const [isCustomQuantity, setIsCustomQuantity] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroceryList, setActiveGroceryList] = useState(null);
  const [groceryLists, setGroceryLists] = useState([]);
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isEditingItem, setIsEditingItem] = useState(null);
  const [showSections, setShowSections] = useState(true); // Grouping toggle
  const [isSortingEnabled, setIsSortingEnabled] = useState(true);
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [shoppingTimeStart, setShoppingTimeStart] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [actualTime, setActualTime] = useState(0);
  const [sortOrder, setSortOrder] = useState('section'); // 'section', 'priority', 'alphabetical'
  
  const itemInputRef = useRef(null);
  
  // Animation setup
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Handle section selection
  const handleSectionSelect = (section) => {
    setSelectedSection(section);
  };
  
  // Handle priority selection
  const handlePrioritySelect = (priority) => {
    setSelectedPriority(priority);
  };
  
  // Handle quantity selection
  const handleQuantitySelect = (quantity) => {
    setItemQuantity(quantity);
    setIsCustomQuantity(false);
  };
  
  // Focus management for improved UX
  useEffect(() => {
    if (isEditingItem) {
      itemInputRef.current && itemInputRef.current.focus();
    }
  }, [isEditingItem]);
  
  // Fetch grocery lists and items when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        navigation.navigate('Login');
        return;
      }
      
      const unsubscribeLists = fetchGroceryLists();
      const unsubscribeItems = fetchGroceryItems();
      
      return () => {
        unsubscribeLists && unsubscribeLists();
        unsubscribeItems && unsubscribeItems();
      };
    }, [user, navigation, activeGroceryList])
  );
  
  // Fetch user's grocery lists
  const fetchGroceryLists = useCallback(() => {
    if (!user?.uid) {
      setGroceryLists([]);
      return () => {};
    }
    
    const q = query(
      collection(db, "groceryLists"),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );
    
    return onSnapshot(q,
      (querySnapshot) => {
        const lists = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setGroceryLists(lists);
        
        // Set active list to most recent if none selected
        if (lists.length > 0 && !activeGroceryList) {
          setActiveGroceryList(lists[0].id);
        }
      },
      (error) => {
        console.error("Error fetching grocery lists:", error);
        Alert.alert("Error", "Failed to load your grocery lists");
      }
    );
  }, [user, activeGroceryList]);
  
  // Fetch items for the active grocery list
  const fetchGroceryItems = useCallback(() => {
    if (!user?.uid || !activeGroceryList) {
      setGroceryItems([]);
      setIsLoading(false);
      return () => {};
    }
    
    const q = query(
      collection(db, "groceryItems"),
      where("listId", "==", activeGroceryList)
    );
    
    return onSnapshot(q,
      (querySnapshot) => {
        let items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          section: doc.data().section || 'other',
          priority: doc.data().priority || 'needed',
          quantity: doc.data().quantity || '1',
          completed: doc.data().completed || false,
          order: doc.data().order || 0
        }));
        
        // Sort items based on user preference
        items = sortItems(items, sortOrder);
        
        setGroceryItems(items);
        setIsLoading(false);
        
        // Calculate estimated shopping time - rough estimate based on item count
        const remainingItems = items.filter(item => !item.completed).length;
        // Average 30 seconds per item plus 5 minutes base time
        setEstimatedTime(Math.max(5, Math.round((remainingItems * 0.5) + 5)));
        
        // If list is complete, show celebration
        if (items.length > 0 && items.every(item => item.completed) && isShoppingMode) {
          handleCompletedShopping();
        }
      },
      (error) => {
        console.error("Error fetching grocery items:", error);
        Alert.alert("Error", "Failed to load your grocery items");
        setIsLoading(false);
      }
    );
  }, [user, activeGroceryList, sortOrder, isShoppingMode]);
  
  // Sort items based on current sort order
  const sortItems = (items, order) => {
    let sortedItems = [...items];
    
    switch (order) {
      case 'section':
        // Sort by store section order first, then by priority
        sortedItems.sort((a, b) => {
          const sectionA = STORE_SECTIONS.find(s => s.id === a.section) || STORE_SECTIONS[STORE_SECTIONS.length - 1];
          const sectionB = STORE_SECTIONS.find(s => s.id === b.section) || STORE_SECTIONS[STORE_SECTIONS.length - 1];
          
          if (sectionA.order !== sectionB.order) {
            return sectionA.order - sectionB.order;
          }
          
          // Within same section, sort by priority
          const priorityA = PRIORITY_LEVELS.findIndex(p => p.id === a.priority);
          const priorityB = PRIORITY_LEVELS.findIndex(p => p.id === b.priority);
          
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          
          // Within same priority, sort alphabetically
          return a.name.localeCompare(b.name);
        });
        break;
        
      case 'priority':
        // Sort by priority first, then alphabetically
        sortedItems.sort((a, b) => {
          const priorityA = PRIORITY_LEVELS.findIndex(p => p.id === a.priority);
          const priorityB = PRIORITY_LEVELS.findIndex(p => p.id === b.priority);
          
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          
          // Within same priority, sort alphabetically
          return a.name.localeCompare(b.name);
        });
        break;
        
      case 'alphabetical':
        // Sort alphabetically
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
        
      case 'custom':
        // Use custom order (draggable list)
        sortedItems.sort((a, b) => a.order - b.order);
        break;
    }
    
    // Always put completed items at the bottom within their groups
    return sortedItems;
  };
  
  // Create a new grocery list
  const handleCreateList = async () => {
    if (!user?.uid || !newListName.trim()) {
      if (!newListName.trim()) {
        Alert.alert("Error", "Please enter a name for your grocery list");
      }
      return;
    }
    
    try {
      const listData = {
        userId: user.uid,
        name: newListName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itemCount: 0,
        completedCount: 0
      };
      
      const docRef = await addDoc(collection(db, "groceryLists"), listData);
      setActiveGroceryList(docRef.id);
      setNewListName('');
      setIsCreatingNewList(false);
      
      // Focus on new item input
      setTimeout(() => {
        itemInputRef.current && itemInputRef.current.focus();
      }, 300);
      
    } catch (error) {
      console.error("Error creating grocery list:", error);
      Alert.alert("Error", "Failed to create grocery list");
    }
  };
  
  // Add or update grocery item
  const handleAddItem = async () => {
    if (!user?.uid || !activeGroceryList || !newItemName.trim()) {
      if (!newItemName.trim()) {
        Alert.alert("Error", "Please enter an item name");
      } else if (!activeGroceryList) {
        setIsCreatingNewList(true);
      }
      return;
    }
    
    try {
      const section = STORE_SECTIONS.find(s => s.id === selectedSection);
      const priority = PRIORITY_LEVELS.find(p => p.id === selectedPriority);
      
      const itemData = {
        listId: activeGroceryList,
        userId: user.uid,
        name: newItemName.trim(),
        section: selectedSection,
        sectionName: section?.name || 'Other',
        sectionColor: section?.color || '#9E9E9E',
        priority: selectedPriority,
        priorityName: priority?.name || 'Needed',
        priorityColor: priority?.color || '#FF9800',
        quantity: itemQuantity,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Order for custom sorting - add to end of list
        order: groceryItems.length
      };
      
      if (isEditingItem) {
        // Update existing item
        await updateDoc(doc(db, "groceryItems", isEditingItem.id), {
          ...itemData,
          createdAt: isEditingItem.createdAt,
          completed: isEditingItem.completed,
          order: isEditingItem.order
        });
        
        // Provide haptic feedback for edit
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Vibration.vibrate(50);
        }
        
      } else {
        // Add new item
        await addDoc(collection(db, "groceryItems"), itemData);
        
        // Update list metadata
        const listRef = doc(db, "groceryLists", activeGroceryList);
        await updateDoc(listRef, {
          updatedAt: new Date().toISOString(),
          itemCount: groceryItems.length + 1
        });
        
        // Provide haptic feedback for add
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          Vibration.vibrate(30);
        }
      }
      
      // Reset form
      setNewItemName('');
      setIsEditingItem(null);
      
      // Keep focus on input for quick entry of multiple items
      setTimeout(() => {
        itemInputRef.current && itemInputRef.current.focus();
      }, 50);
      
    } catch (error) {
      console.error("Error saving grocery item:", error);
      Alert.alert("Error", "Failed to save item");
    }
  };
  
  // Toggle item completion status with visual feedback
  const handleToggleCompletion = async (item) => {
    try {
      const newCompletionStatus = !item.completed;
      
      // Update the item in Firestore
      await updateDoc(doc(db, "groceryItems", item.id), {
        completed: newCompletionStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Provide appropriate haptic feedback
      if (newCompletionStatus) {
        // Stronger feedback for completion (dopamine hit)
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Vibration.vibrate([0, 50, 30, 100]);
        }
      } else {
        // Lighter feedback for un-checking
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          Vibration.vibrate(20);
        }
      }
      
      // Update list metadata
      const listRef = doc(db, "groceryLists", activeGroceryList);
      const completedCount = groceryItems.filter(i => 
        i.id !== item.id ? i.completed : newCompletionStatus
      ).length;
      
      await updateDoc(listRef, {
        updatedAt: new Date().toISOString(),
        completedCount: completedCount
      });
      
    } catch (error) {
      console.error("Error toggling item completion:", error);
      Alert.alert("Error", "Failed to update item");
    }
  };
  
  // Handle deleting an item
  const handleDeleteItem = (itemId) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "groceryItems", itemId));
              
              // Update list metadata
              const listRef = doc(db, "groceryLists", activeGroceryList);
              await updateDoc(listRef, {
                updatedAt: new Date().toISOString(),
                itemCount: groceryItems.length - 1,
                completedCount: groceryItems.filter(i => i.id !== itemId && i.completed).length
              });
              
              // Provide haptic feedback
              if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              } else {
                Vibration.vibrate(100);
              }
              
            } catch (error) {
              console.error("Error deleting item:", error);
              Alert.alert("Error", "Failed to delete item");
            }
          }
        }
      ]
    );
  };
  
  // Handle editing an item
  const handleEditItem = (item) => {
    setIsEditingItem(item);
    setNewItemName(item.name);
    setSelectedSection(item.section);
    setSelectedPriority(item.priority);
    setItemQuantity(item.quantity);
    setIsCustomQuantity(!QUANTITY_PRESETS.includes(item.quantity));
    
    // Scroll to input
    setTimeout(() => {
      itemInputRef.current && itemInputRef.current.focus();
    }, 100);
  };
  
  // Toggle shopping mode
  const handleToggleShoppingMode = () => {
    if (!isShoppingMode) {
      // Starting shopping mode
      setShoppingTimeStart(new Date());
      setIsShoppingMode(true);
      
      // Haptic feedback for starting shopping
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Vibration.vibrate([0, 50, 30, 50]);
      }
      
      // Update the view to show remaining items
      setViewMode('remaining');
      
      Alert.alert(
        "Shopping Mode Activated",
        `Estimated shopping time: ${estimatedTime} minutes\n\nItems will be grouped by store section for efficient shopping.`,
        [{ text: "Let's Shop!", style: "default" }]
      );
      
    } else {
      // Ending shopping mode
      const endTime = new Date();
      const elapsedMinutes = Math.round((endTime - shoppingTimeStart) / 60000);
      setActualTime(elapsedMinutes);
      
      Alert.alert(
        "Finish Shopping?",
        `You've been shopping for approximately ${elapsedMinutes} minutes.`,
        [
          { text: "Keep Shopping", style: "cancel" },
          { 
            text: "Finish", 
            style: "default",
            onPress: () => {
              setIsShoppingMode(false);
              setViewMode('all');
              
              // Display shopping summary
              const remainingItems = groceryItems.filter(item => !item.completed).length;
              const completedItems = groceryItems.filter(item => item.completed).length;
              
              if (remainingItems === 0 && completedItems > 0) {
                handleCompletedShopping();
              } else {
                Alert.alert(
                  "Shopping Summary",
                  `Time spent: ${elapsedMinutes} minutes\nItems purchased: ${completedItems}\nItems remaining: ${remainingItems}`
                );
              }
            }
          }
        ]
      );
    }
  };
  
  // Handle completed shopping with celebration
  const handleCompletedShopping = () => {
    setShowCompletionAnimation(true);
    
    // Trigger confetti
    setTimeout(() => {
      confettiRef.current && confettiRef.current.start();
    }, 300);
    
    // Show completion alert
    setTimeout(() => {
      const endTime = new Date();
      const elapsedMinutes = Math.round((endTime - shoppingTimeStart) / 60000);
      setActualTime(elapsedMinutes);
      
      Alert.alert(
        "🎉 Shopping Complete! 🎉",
        `Great job! You completed your shopping in ${elapsedMinutes} minutes.\n\nWould you like to clear completed items?`,
        [
          { text: "Keep Items", style: "cancel" },
          { 
            text: "Clear Completed", 
            style: "default",
            onPress: () => handleClearCompleted()
          }
        ]
      );
      
      setIsShoppingMode(false);
      setShowCompletionAnimation(false);
      
    }, 2000);
  };
  
  // Clear completed items
  const handleClearCompleted = async () => {
    try {
      // Get all completed items
      const completedItems = groceryItems.filter(item => item.completed);
      
      // Delete each completed item
      const deletePromises = completedItems.map(item => 
        deleteDoc(doc(db, "groceryItems", item.id))
      );
      
      await Promise.all(deletePromises);
      
      // Update list metadata
      const listRef = doc(db, "groceryLists", activeGroceryList);
      await updateDoc(listRef, {
        updatedAt: new Date().toISOString(),
        itemCount: groceryItems.length - completedItems.length,
        completedCount: 0
      });
      
      // Provide haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Vibration.vibrate([0, 30, 20, 40]);
      }
      
    } catch (error) {
      console.error("Error clearing completed items:", error);
      Alert.alert("Error", "Failed to clear completed items");
    }
  };
  
  // Handle custom item reordering
  const handleReorderItems = async ({ data }) => {
    setGroceryItems(data);
    
    try {
      // Update order field for each item
      const updatePromises = data.map((item, index) => 
        updateDoc(doc(db, "groceryItems", item.id), { order: index })
      );
      
      await Promise.all(updatePromises);
      
      // Set sort order to custom
      setSortOrder('custom');
      
    } catch (error) {
      console.error("Error reordering items:", error);
      Alert.alert("Error", "Failed to save item order");
    }
  };
  
  // Show help information
  const handleHelpPress = () => {
    Alert.alert(
      "Grocery List Help",
      "This grocery list is designed to help manage ADHD challenges when shopping:\n\n" +
      "• Items are organized by store sections for easier navigation\n" +
      "• Priority levels help focus on essential items first\n" +
      "• Shopping mode provides time estimates and dopamine-boosting feedback\n" +
      "• Visual cues and haptic feedback provide sensory reinforcement\n\n" +
      "Tips:\n" +
      "• Use 'Shopping Mode' to stay focused and track your time\n" +
      "• Check off items as you shop for satisfying visual progress\n" +
      "• Try different sort orders to match your shopping style\n" +
      "• Drag items to customize your exact shopping path\n\n" +
      "For more help, contact support."
    );
  };
  
  // Filter items based on view mode and search
  const getFilteredItems = () => {
    // Start with all items
    let filtered = [...groceryItems];
    
    // Apply view mode filter
    if (viewMode === 'remaining') {
      filtered = filtered.filter(item => !item.completed);
    } else if (viewMode === 'completed') {
      filtered = filtered.filter(item => item.completed);
    }
    
    // Apply search filter if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.sectionName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };
  
  // Group items by section (for section view)
  const getGroupedItems = () => {
    const filteredItems = getFilteredItems();
    const grouped = {};
    
    // Group items by section
    filteredItems.forEach(item => {
      if (!grouped[item.section]) {
        const sectionData = STORE_SECTIONS.find(s => s.id === item.section) || 
                           { id: item.section, name: item.sectionName || 'Other', color: item.sectionColor || '#9E9E9E' };
        
        grouped[item.section] = {
          section: item.section,
          sectionName: sectionData.name,
          sectionColor: sectionData.color,
          icon: sectionData.icon,
          items: []
        };
      }
      
      grouped[item.section].items.push(item);
    });
    
    // Convert to array and sort by section order
    return Object.values(grouped).sort((a, b) => {
      const sectionA = STORE_SECTIONS.find(s => s.id === a.section) || { order: 999 };
      const sectionB = STORE_SECTIONS.find(s => s.id === b.section) || { order: 999 };
      return sectionA.order - sectionB.order;
    });
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#F7e8d3" />
        <Text style={styles.loadingText}>Loading Grocery List...</Text>
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
                { opacity: fadeAnim }
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
  
                <Text style={styles.title}>Grocery List</Text>
  
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleHelpPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <FontAwesome name="question-circle" size={24} color="#F7E8D3" />
                </TouchableOpacity>
              </View>
              
              {/* List Selector / Create New List */}
              {isCreatingNewList ? (
                <View style={styles.newListContainer}>
                  <TextInput
                    style={styles.newListInput}
                    placeholder="Enter list name..."
                    placeholderTextColor="rgba(247, 232, 211, 0.5)"
                    value={newListName}
                    onChangeText={setNewListName}
                    autoFocus
                  />
                  <View style={styles.newListButtons}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => setIsCreatingNewList(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.createButton,
                        !newListName.trim() && styles.disabledButton
                      ]}
                      onPress={handleCreateList}
                      disabled={!newListName.trim()}
                    >
                      <Text style={styles.createButtonText}>Create List</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.listSelectorContainer}>
                  {groceryLists.length > 0 ? (
                    <View style={styles.listSelector}>
                      <FlatList
                        data={groceryLists}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[
                              styles.listItem,
                              activeGroceryList === item.id && styles.activeListItem
                            ]}
                            onPress={() => setActiveGroceryList(item.id)}
                          >
                            <Text 
                              style={[
                                styles.listItemText,
                                activeGroceryList === item.id && styles.activeListItemText
                              ]}
                              numberOfLines={1}
                            >
                              {item.name}
                            </Text>
                            <Text style={styles.listItemCount}>
                              {item.completedCount}/{item.itemCount}
                            </Text>
                          </TouchableOpacity>
                        )}
                        keyExtractor={item => item.id}
                        ListFooterComponent={
                          <TouchableOpacity
                            style={styles.newListButton}
                            onPress={() => setIsCreatingNewList(true)}
                          >
                            <FontAwesome name="plus" size={16} color="#F7E8D3" />
                            <Text style={styles.newListButtonText}>New List</Text>
                          </TouchableOpacity>
                        }
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.createFirstListButton}
                      onPress={() => setIsCreatingNewList(true)}
                    >
                      <FontAwesome name="plus" size={16} color="#F7E8D3" />
                      <Text style={styles.createFirstListButtonText}>Create Your First Grocery List</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              
              {/* Search Bar */}
              {groceryLists.length > 0 && activeGroceryList && (
                <View style={styles.searchContainer}>
                  <FontAwesome name="search" size={16} color="#F7E8D3" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search items..."
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
              )}
              
              {/* Controls and Options */}
              {groceryLists.length > 0 && activeGroceryList && (
                <View style={styles.controlsContainer}>
                  {/* View Mode Tabs */}
                  <View style={styles.viewModeTabs}>
                    <TouchableOpacity
                      style={[styles.viewModeTab, viewMode === 'all' && styles.activeViewModeTab]}
                      onPress={() => setViewMode('all')}
                    >
                      <Text style={[styles.viewModeTabText, viewMode === 'all' && styles.activeViewModeTabText]}>
                        All
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.viewModeTab, viewMode === 'remaining' && styles.activeViewModeTab]}
                      onPress={() => setViewMode('remaining')}
                    >
                      <Text style={[styles.viewModeTabText, viewMode === 'remaining' && styles.activeViewModeTabText]}>
                        Remaining
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.viewModeTab, viewMode === 'completed' && styles.activeViewModeTab]}
                      onPress={() => setViewMode('completed')}
                    >
                      <Text style={[styles.viewModeTabText, viewMode === 'completed' && styles.activeViewModeTabText]}>
                        Completed
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Sort and View Options */}
                  <View style={styles.optionsRow}>
                    <View style={styles.optionGroup}>
                      <Text style={styles.optionLabel}>Group by section</Text>
                      <Switch
                        value={showSections}
                        onValueChange={setShowSections}
                        trackColor={{ false: "#3e3e3e", true: "#81b0ff" }}
                        thumbColor={showSections ? "#2196F3" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                      />
                    </View>
                    
                    <View style={styles.optionGroup}>
                      <Text style={styles.optionLabel}>Sort by:</Text>
                      <TouchableOpacity
                        style={styles.sortButton}
                        onPress={() => {
                          // Cycle through sort options
                          const sortOptions = ['section', 'priority', 'alphabetical', 'custom'];
                          const currentIndex = sortOptions.indexOf(sortOrder);
                          const nextIndex = (currentIndex + 1) % sortOptions.length;
                          setSortOrder(sortOptions[nextIndex]);
                        }}
                      >
                        <Text style={styles.sortButtonText}>
                          {sortOrder === 'section' ? 'Store Section' :
                           sortOrder === 'priority' ? 'Priority' :
                           sortOrder === 'alphabetical' ? 'A-Z' : 'Custom'}
                        </Text>
                        <FontAwesome name="sort" size={14} color="#F7E8D3" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              
              {/* Shopping Mode Button */}
              {groceryLists.length > 0 && activeGroceryList && groceryItems.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.shoppingModeButton,
                    isShoppingMode && styles.shoppingModeActiveButton
                  ]}
                  onPress={handleToggleShoppingMode}
                >
                  <FontAwesome 
                    name={isShoppingMode ? "pause" : "play"} 
                    size={16} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.shoppingModeButtonText}>
                    {isShoppingMode 
                      ? `Shopping in Progress (${estimatedTime} min est.)` 
                      : "Start Shopping Mode"}
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Item Input Section */}
              {groceryLists.length > 0 && activeGroceryList && (
                <View style={styles.itemInputSection}>
                  <View style={styles.itemInputRow}>
                    <TextInput
                      ref={itemInputRef}
                      style={styles.itemInput}
                      placeholder="Add item to your list..."
                      placeholderTextColor="rgba(247, 232, 211, 0.5)"
                      value={newItemName}
                      onChangeText={setNewItemName}
                      returnKeyType="done"
                      onSubmitEditing={handleAddItem}
                    />
                    <TouchableOpacity
                      style={[
                        styles.addItemButton,
                        !newItemName.trim() && styles.addItemButtonDisabled
                      ]}
                      onPress={handleAddItem}
                      disabled={!newItemName.trim()}
                    >
                      <FontAwesome name={isEditingItem ? "save" : "plus"} size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.itemOptionsContainer}>
                    {/* Section Selector - Horizontal Scroll */}
                    <Text style={styles.optionSectionTitle}>Store Section:</Text>
                    <FlatList
                      data={STORE_SECTIONS}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.sectionButton,
                            selectedSection === item.id && styles.selectedSectionButton,
                            { borderColor: item.color }
                          ]}
                          onPress={() => handleSectionSelect(item.id)}
                        >
                          <FontAwesome 
                            name={item.icon} 
                            size={14}
                            color={selectedSection === item.id ? item.color : "#F7E8D3"}  
                          />
                          <Text 
                            style={[
                              styles.sectionButtonText,
                              selectedSection === item.id && { color: item.color }
                            ]}
                          >
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                      keyExtractor={item => item.id}
                      style={styles.sectionList}
                    />
                    
                    {/* Priority Selector */}
                    <Text style={styles.optionSectionTitle}>Priority:</Text>
                    <View style={styles.priorityContainer}>
                      {PRIORITY_LEVELS.map(priority => (
                        <TouchableOpacity
                          key={priority.id}
                          style={[
                            styles.priorityButton,
                            selectedPriority === priority.id && styles.selectedPriorityButton,
                            { borderColor: priority.color }
                          ]}
                          onPress={() => handlePrioritySelect(priority.id)}
                        >
                          <FontAwesome 
                            name={priority.icon} 
                            size={14}
                            color={selectedPriority === priority.id ? priority.color : "#F7E8D3"}  
                          />
                          <Text 
                            style={[
                              styles.priorityButtonText,
                              selectedPriority === priority.id && { color: priority.color }
                            ]}
                          >
                            {priority.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    {/* Quantity Selector */}
                    <Text style={styles.optionSectionTitle}>Quantity:</Text>
                    <View style={styles.quantityContainer}>
                      {isCustomQuantity ? (
                        <View style={styles.customQuantityContainer}>
                          <TextInput
                            style={styles.customQuantityInput}
                            value={itemQuantity}
                            onChangeText={setItemQuantity}
                            keyboardType="number-pad"
                            maxLength={5}
                          />
                          <TouchableOpacity
                            style={styles.quantityPresetButton}
                            onPress={() => setIsCustomQuantity(false)}
                          >
                            <Text style={styles.quantityPresetButtonText}>Presets</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.quantityPresetsContainer}>
                          <FlatList
                            data={QUANTITY_PRESETS}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                              <TouchableOpacity
                                style={[
                                  styles.quantityPresetChip,
                                  itemQuantity === item && styles.selectedQuantityPresetChip
                                ]}
                                onPress={() => handleQuantitySelect(item)}
                              >
                                <Text style={[
                                  styles.quantityPresetChipText,
                                  itemQuantity === item && styles.selectedQuantityPresetChipText
                                ]}>
                                  {item}
                                </Text>
                              </TouchableOpacity>
                            )}
                            keyExtractor={item => item}
                          />
                          <TouchableOpacity
                            style={styles.customQuantityButton}
                            onPress={() => setIsCustomQuantity(true)}
                          >
                            <Text style={styles.customQuantityButtonText}>Custom</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}
              
              {/* Grocery Items List */}
              {groceryLists.length > 0 && activeGroceryList && (
                <View style={styles.itemsContainer}>
                  {groceryItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <FontAwesome name="shopping-basket" size={48} color="#F7e8d3" style={styles.emptyIcon} />
                      <Text style={styles.emptyText}>
                        Your grocery list is empty
                      </Text>
                      <Text style={styles.emptySubtext}>
                        Add items above to get started
                      </Text>
                    </View>
                  ) : getFilteredItems().length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <FontAwesome name="filter" size={32} color="#F7e8d3" style={styles.emptyIcon} />
                      <Text style={styles.emptyText}>
                        {searchQuery 
                          ? "No items match your search" 
                          : viewMode === 'remaining' 
                            ? "All items are completed!" 
                            : "No completed items yet"}
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
                  ) : showSections ? (
                    // Grouped by sections
                    <FlatList
                      data={getGroupedItems()}
                      renderItem={({ item: sectionGroup }) => (
                        <View style={styles.sectionGroup}>
                          <View style={[
                            styles.sectionHeader, 
                            { borderLeftColor: sectionGroup.sectionColor }
                          ]}>
                            <FontAwesome 
                              name={STORE_SECTIONS.find(s => s.id === sectionGroup.section)?.icon || "tag"} 
                              size={16} 
                              color={sectionGroup.sectionColor} 
                            />
                            <Text style={styles.sectionHeaderText}>{sectionGroup.sectionName}</Text>
                            <Text style={styles.sectionItemCount}>
                              {sectionGroup.items.length} {sectionGroup.items.length === 1 ? 'item' : 'items'}
                            </Text>
                          </View>
                          {sectionGroup.items.map(item => renderGroceryItem(item))}
                        </View>
                      )}
                      keyExtractor={item => item.section}
                      showsVerticalScrollIndicator={false}
                      style={styles.groceryList}
                      contentContainerStyle={styles.groceryListContent}
                    />
                  ) : sortOrder === 'custom' ? (
                    // Custom draggable list
                    <DraggableFlatList
                      data={getFilteredItems()}
                      renderItem={renderDraggableItem}
                      keyExtractor={item => item.id}
                      onDragEnd={handleReorderItems}
                      showsVerticalScrollIndicator={false}
                      style={styles.groceryList}
                      contentContainerStyle={styles.groceryListContent}
                    />
                  ) : (
                    // Regular flat list
                    <FlatList
                      data={getFilteredItems()}
                      renderItem={({ item }) => renderGroceryItem(item)}
                      keyExtractor={item => item.id}
                      showsVerticalScrollIndicator={false}
                      style={styles.groceryList}
                      contentContainerStyle={styles.groceryListContent}
                    />
                  )}
                </View>
              )}
              
              {/* Celebration Animation */}
              {showCompletionAnimation && (
                <ConfettiCannon
                  ref={confettiRef}
                  count={100}
                  origin={{ x: width / 2, y: height }}
                  autoStart={false}
                  fadeOut
                  colors={['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0']}
                />
              )}
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </View>
  );
};

// Helper function to render a grocery item
const renderGroceryItem = (item) => {
  const priorityData = PRIORITY_LEVELS.find(p => p.id === item.priority) || 
                      { id: 'needed', color: '#FF9800', icon: 'exclamation' };
                      
  const sectionData = STORE_SECTIONS.find(s => s.id === item.section) || 
                     { id: 'other', color: '#9E9E9E', icon: 'tag' };
  
  return (
    <Animated.View 
      key={item.id}
      style={[
        styles.groceryItem,
        item.completed && styles.completedGroceryItem,
        { borderLeftColor: sectionData.color }
      ]}
    >
      {/* Checkbox */}
      <TouchableOpacity
        style={[
          styles.itemCheckbox,
          item.completed && styles.checkedItemCheckbox,
          { borderColor: item.completed ? sectionData.color : '#F7E8D3' }
        ]}
        onPress={() => handleToggleCompletion(item)}
      >
        {item.completed && (
          <FontAwesome name="check" size={16} color={sectionData.color} />
        )}
      </TouchableOpacity>
      
      {/* Item Content */}
      <View style={styles.itemContent}>
        <View style={styles.itemNameRow}>
          <Text style={[
            styles.itemName, 
            item.completed && styles.completedItemName
          ]}>
            {item.name}
          </Text>
          
          {/* Quantity */}
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityBadgeText}>
              ×{item.quantity}
            </Text>
          </View>
        </View>
        
        {/* Item Meta Info */}
        <View style={styles.itemMetaInfo}>
          {/* Priority */}
          <View style={[
            styles.priorityBadge,
            { borderColor: priorityData.color }
          ]}>
            <FontAwesome name={priorityData.icon} size={10} color={priorityData.color} />
            <Text style={[styles.priorityBadgeText, { color: priorityData.color }]}>
              {priorityData.name}
            </Text>
          </View>
          
          {/* Section */}
          <View style={styles.sectionBadge}>
            <FontAwesome name={sectionData.icon} size={10} color="#F7E8D3" />
            <Text style={styles.sectionBadgeText}>{sectionData.name}</Text>
          </View>
        </View>
      </View>
      
      {/* Item Actions */}
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.itemActionButton}
          onPress={() => handleEditItem(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="pencil" size={16} color="#F7E8D3" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.itemActionButton}
          onPress={() => handleDeleteItem(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="trash" size={16} color="#FF6347" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Helper function to render a draggable item
const renderDraggableItem = ({ item, drag, isActive }) => {
  return (
    <TouchableOpacity
      onLongPress={drag}
      activeOpacity={0.7}
      style={[
        styles.draggableItem,
        isActive && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
      ]}
    >
      <FontAwesome name="bars" size={18} color="#F7E8D3" style={styles.dragHandle} />
      {renderGroceryItem(item)}
    </TouchableOpacity>
  );
};

export default GroceryListScreen;