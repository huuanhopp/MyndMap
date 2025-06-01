import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, ScrollView,
  Alert, ImageBackground, ActivityIndicator, 
  Vibration, Animated, KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { 
  db, 
  getDocument, 
  updateDocument, 
  createDocument, 
  deleteDocument, 
  listenToQuery, 
  listenToDocument 
} from "../screens/firebase-services.js";
import { useUser } from "../hooks/userHook.js";
import splashImage from '../assets/splash.png';
import { useTranslation } from 'react-i18next'; 
import MyndBudgetHelpModal from '../components/MyndBudgetHelpModal'; // Import the help modal component

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const MyndBudget = ({ navigation }) => {
  const { user } = useUser();
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState('0');
  const [fixedCostsBudget, setFixedCostsBudget] = useState('0');
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Other', isFixedCost: false, seasonalEvent: null });
  const [isLoading, setIsLoading] = useState(true);
  const [dailySpent, setDailySpent] = useState({ fixed: 0, variable: 0 });
  const [streakCount, setStreakCount] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const { t, i18n } = useTranslation();
  const [budgetPeriod, setBudgetPeriod] = useState('Monthly');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showFixedCosts, setShowFixedCosts] = useState(true);
  const [showBudgetPeriodOptions, setShowBudgetPeriodOptions] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState('All');
  const [selectedCurrency, setSelectedCurrency] = useState(
    i18n.language === 'ja' ? 'JPY' : 'USD'
  );


  const categories = useMemo(() => [
    t('myndBudget.categories.food'),
    t('myndBudget.categories.transport'),
    t('myndBudget.categories.entertainment'),
    t('myndBudget.categories.utilities'),
    t('myndBudget.categories.other')
  ], [t]);

  const seasonalEvents = useMemo(() => [
    t('myndBudget.seasonalEvents.newYear'),
    t('myndBudget.seasonalEvents.cherryBlossom'),
    t('myndBudget.seasonalEvents.goldenWeek'),
    t('myndBudget.seasonalEvents.obon'),
    t('myndBudget.seasonalEvents.christmas')
  ], [t]);

  useEffect(() => {
    const fetchUserCurrency = async () => {
      if (user) {
        // Use standardized getDocument method
        const userData = await getDocument("users", user.uid);
        if (userData && userData.preferredCurrency) {
          setSelectedCurrency(userData.preferredCurrency);
        }
      }
    };
    fetchUserCurrency();
  }, [user]);

  // Animation effect for help modal
  useEffect(() => {
    if (showHelpModal) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showHelpModal, fadeAnim]);

  useEffect(() => {
    if (user) {
      // Use standardized listenToQuery method
      const conditions = [
        ["userId", "==", user.uid]
      ];
      
      const unsubscribe = listenToQuery("expenses", conditions, {}, (expenseList) => {
        setExpenses(expenseList);
        updateDailySpent(expenseList);
        setIsLoading(false);
      });

      // Use standardized listenToDocument method
      const budgetUnsubscribe = listenToDocument("users", user.uid, (userData) => {
        if (userData) {
          if (userData.budget) {
            setBudget(userData.budget.toString());
          }
          if (userData.fixedCostsBudget) {
            setFixedCostsBudget(userData.fixedCostsBudget.toString());
          }
          if (userData.streakCount) {
            setStreakCount(userData.streakCount);
          }
          if (userData.budgetPeriod) {
            setBudgetPeriod(userData.budgetPeriod);
          }
        }
        setIsLoading(false);
      });

      return () => {
        unsubscribe();
        budgetUnsubscribe();
      };
    }
  }, [user]);

  const formatCurrency = useCallback((amount) => {
    const currencySettings = {
      'JPY': { locale: 'ja-JP', minimumFractionDigits: 0, maximumFractionDigits: 0 },
      'USD': { locale: 'en-US', minimumFractionDigits: 2, maximumFractionDigits: 2 },
      'GBP': { locale: 'en-GB', minimumFractionDigits: 2, maximumFractionDigits: 2 },
      'EUR': { locale: 'en-IE', minimumFractionDigits: 2, maximumFractionDigits: 2 }
    };

    const settings = currencySettings[selectedCurrency] || currencySettings['USD'];
    
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: settings.minimumFractionDigits,
      maximumFractionDigits: settings.maximumFractionDigits
    }).format(amount);
  }, [selectedCurrency]);

  const updateUserCurrency = async (currency) => {
    try {
      // Use standardized updateDocument method
      await updateDocument("users", user.uid, {
        preferredCurrency: currency
      });
      setSelectedCurrency(currency);
      Vibration.vibrate([0, 100, 50, 100]);
    } catch (error) {
      console.error("Error updating currency:", error);
      Alert.alert(t('myndBudget.alerts.error'), t('myndBudget.alerts.failedToUpdate'));
    }
  };

  const CurrencySelector = () => {
    const currencies = i18n.language === 'ja' 
      ? [{ code: 'JPY', label: '円' }]
      : [
          { code: 'USD', label: '$' },
          { code: 'GBP', label: '£' },
          { code: 'EUR', label: '€' }
        ];
        
    return (
      <View style={styles.currencySelectorContainer}>
        <Text style={styles.currencyLabel}>{t('myndBudget.selectCurrency')}</Text>
        <View style={styles.currencyButtons}>
          {currencies.map(currency => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.currencyButton,
                selectedCurrency === currency.code && styles.selectedCurrencyButton
              ]}
              onPress={() => updateUserCurrency(currency.code)}
            >
              <Text style={[
                styles.currencyButtonText,
                selectedCurrency === currency.code && styles.selectedCurrencyButtonText
              ]}>
                {currency.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Add this function
  const goToHomeScreen = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  // Modified updateDailySpent function to properly handle variable expenses
  const updateDailySpent = useCallback((expenseList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayExpenses = expenseList.filter(expense => {
      const expenseDate = expense.date ? new Date(expense.date) : new Date();
      expenseDate.setHours(0, 0, 0, 0);
      return expenseDate.getTime() === today.getTime();
    });
    
    const fixedTotal = todayExpenses.reduce((sum, expense) => 
      expense.isFixedCost ? sum + parseFloat(expense.amount || 0) : sum, 0
    );
    
    const variableTotal = todayExpenses.reduce((sum, expense) => 
      !expense.isFixedCost ? sum + parseFloat(expense.amount || 0) : sum, 0
    );

    setDailySpent({
      fixed: Math.round(fixedTotal * 100) / 100,
      variable: Math.round(variableTotal * 100) / 100
    });
  }, []);

  // Modified addExpense function to ensure proper handling of isFixedCost
  const addExpense = async () => {
    if (newExpense.name && newExpense.amount && newExpense.category) {
      const expenseAmount = parseFloat(newExpense.amount);
      if (isNaN(expenseAmount) || expenseAmount <= 0) {
        Alert.alert(t('myndBudget.alerts.invalidAmount'), t('myndBudget.alerts.invalidAmountMessage'));
        return;
      }
      
      try {
        const now = new Date();
        const tempId = `temp_${now.getTime()}`;
        const newExpenseData = {
          userId: user.uid,
          name: newExpense.name,
          amount: expenseAmount,
          category: newExpense.category,
          isFixedCost: Boolean(newExpense.isFixedCost), // Ensure boolean type
          seasonalEvent: newExpense.seasonalEvent,
          date: now.toISOString(),
          createdAt: now.getTime()
        };

        // Optimistically update the UI
        setExpenses(prevExpenses => {
          const updatedExpenses = [...prevExpenses, { id: tempId, ...newExpenseData }];
          return updatedExpenses.sort((a, b) => 
            (b.createdAt || new Date(b.date).getTime()) - 
            (a.createdAt || new Date(a.date).getTime())
          );
        });
        
        // Use standardized createDocument method
        const docId = await createDocument("expenses", newExpenseData);
        
        // Update UI with the real document ID
        setExpenses(prevExpenses => 
          prevExpenses.map(exp => exp.id === tempId ? { ...exp, id: docId } : exp)
        );

        // Update daily spent calculations with the new expense
        updateDailySpent([...expenses, { ...newExpenseData, id: docId }]);

        console.log("Expense added with ID: ", docId);
        setNewExpense({ name: '', amount: '', category: 'Other', isFixedCost: false, seasonalEvent: null });
        hideAddExpenseModal();
        Vibration.vibrate(100);
        Alert.alert(t('myndBudget.alerts.success'), t('myndBudget.alerts.expenseAdded'));
      } catch (error) {
        console.error("Error adding expense:", error);
        Alert.alert(t('myndBudget.alerts.error'), t('myndBudget.alerts.failedToAdd'));
      }
    } else {
      Alert.alert(t('myndBudget.alerts.invalidInput'), t('myndBudget.alerts.invalidInputMessage'));
    }
  };


  const deleteExpense = async (id) => {
    try {
      // Use standardized deleteDocument method
      await deleteDocument("expenses", id);
      Vibration.vibrate(50);
    } catch (error) {
      console.error("Error deleting expense:", error);
      Alert.alert(t('myndBudget.alerts.error'), t('myndBudget.alerts.failedToDelete'));
    }
  };

  const updateBudget = async () => {
    const budgetAmount = parseFloat(budget);
    const fixedCostsBudgetAmount = parseFloat(fixedCostsBudget);
    if (isNaN(budgetAmount) || budgetAmount <= 0 || isNaN(fixedCostsBudgetAmount) || fixedCostsBudgetAmount < 0) {
      Alert.alert(t('myndBudget.alerts.invalidBudget'), t('myndBudget.alerts.invalidBudgetMessage'));
      return;
    }

    try {
      // Use standardized updateDocument method
      await updateDocument("users", user.uid, { 
        budget: budgetAmount,
        fixedCostsBudget: fixedCostsBudgetAmount,
        budgetPeriod: budgetPeriod
      });
      Alert.alert(t('myndBudget.alerts.success'), t('myndBudget.alerts.budgetUpdated'));
      Vibration.vibrate([0, 100, 50, 100]);
    } catch (error) {
      console.error("Error updating budgets:", error);
      Alert.alert(t('myndBudget.alerts.error'), t('myndBudget.alerts.failedToUpdate'));
    }
  };

  const showAddExpenseModal = () => {
    setShowAddExpense(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideAddExpenseModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowAddExpense(false));
  };

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

  const toggleCostType = () => {
    setShowFixedCosts(!showFixedCosts);
  };

  const toggleBudgetPeriodOptions = () => {
    setShowBudgetPeriodOptions(!showBudgetPeriodOptions);
  };

  const selectBudgetPeriod = (period) => {
    setBudgetPeriod(period);
    setShowBudgetPeriodOptions(false);
  };

  const toggleExpenseFilter = () => {
    setExpenseFilter(current => {
      switch(current) {
        case 'All': return 'Fixed';
        case 'Fixed': return 'Variable';
        case 'Variable': return 'All';
      }
    });
  };

  // Modified renderExpenseItem to properly handle expense filtering
  const renderExpenseItem = useCallback((item) => {
    // Early return if the item doesn't match the current filter
    if (expenseFilter === 'Fixed' && !item.isFixedCost) return null;
    if (expenseFilter === 'Variable' && item.isFixedCost) return null;

    return (
      <AnimatedTouchableOpacity 
        key={item.id}
        style={[styles.expenseItem, { 
          borderLeftColor: getCategoryColor(item.category), 
          borderLeftWidth: 5,
          backgroundColor: item.isFixedCost ? 'rgba(65, 105, 225, 0.2)' : 'rgba(255, 99, 71, 0.2)'
        }]}
        onPress={() => Alert.alert(
          t('myndBudget.expenseDetails'), 
          `${t('myndBudget.name')}: ${item.name}\n${t('myndBudget.amount')}: ${formatCurrency(item.amount)}\n${t('myndBudget.category')}: ${item.category}\n${t('myndBudget.type')}: ${item.isFixedCost ? t('myndBudget.fixedCost') : t('myndBudget.variableCost')}${item.seasonalEvent ? `\n${t('myndBudget.event')}: ${item.seasonalEvent}` : ''}`
        )}
        accessibilityLabel={`${t('myndBudget.expense')}: ${item.name}, ${t('myndBudget.amount')}: ${formatCurrency(item.amount)}, ${t('myndBudget.category')}: ${item.category}`}
      >
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseName}>{item.name}</Text>
          <View style={styles.expenseMetadata}>
            <Text style={styles.expenseCategory}>{item.category}</Text>
            <Text style={[styles.expenseType, { 
              color: item.isFixedCost ? '#4169E1' : '#FF6347'
            }]}>
              {item.isFixedCost ? t('myndBudget.fixedCost') : t('myndBudget.variableCost')}
            </Text>
          </View>
        </View>
        <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
        <TouchableOpacity 
          onPress={() => deleteExpense(item.id)} 
          style={styles.deleteButton}
          accessibilityLabel={`${t('myndBudget.deleteExpense')} ${item.name}`}
        >
          <FontAwesome name="trash" size={16} color="#FF6347" />
        </TouchableOpacity>
      </AnimatedTouchableOpacity>
    );
  }, [formatCurrency, getCategoryColor, deleteExpense, expenseFilter, t]);

  const getCategoryColor = useCallback((category) => {
    const colors = {
      [t('myndBudget.categories.food')]: '#FF6347',
      [t('myndBudget.categories.transport')]: '#4169E1',
      [t('myndBudget.categories.entertainment')]: '#FFD700',
      [t('myndBudget.categories.utilities')]: '#32CD32',
      [t('myndBudget.categories.other')]: '#8A2BE2'
    };
    return colors[category] || colors[t('myndBudget.categories.other')];
  }, [t]);

  const renderBudgetProgress = useCallback(() => {
    const totalBudget = parseFloat(budget);
    const fixedBudget = parseFloat(fixedCostsBudget);
    const variableBudget = totalBudget - fixedBudget;
    
    const fixedProgress = fixedBudget > 0 ? Math.min((dailySpent.fixed / fixedBudget) * 100, 100) : 0;
    const variableProgress = variableBudget > 0 ? Math.min((dailySpent.variable / variableBudget) * 100, 100) : 0;
    
    const fixedColor = fixedProgress > 80 ? '#FF0000' : fixedProgress > 60 ? '#FFA500' : '#32CD32';
    const variableColor = variableProgress > 80 ? '#FF0000' : variableProgress > 60 ? '#FFA500' : '#32CD32';

    const progress = showFixedCosts ? fixedProgress : variableProgress;
    const color = showFixedCosts ? fixedColor : variableColor;
    
    return (
      <TouchableOpacity style={styles.progressContainer} onPress={toggleCostType}>
        <Text style={styles.budgetLabel}>
          {showFixedCosts 
            ? t('myndBudget.fixedCostsProgressLabel') 
            : t('myndBudget.variableCostsProgressLabel')
          }
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
          <Text style={styles.progressBarText}>{`${progress.toFixed(1)}%`}</Text>
        </View>
        <Text style={styles.tapToToggle}>{t('myndBudget.progressBarCaption')}</Text>
      </TouchableOpacity>
    );
  }, [budget, fixedCostsBudget, dailySpent, showFixedCosts, t, toggleCostType]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F7e8d3" />
        <Text style={styles.loadingText}>{t('myndBudget.loading')}</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={splashImage} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.overlay}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <FontAwesome name="arrow-left" size={24} color="#F7e8d3" />
            </TouchableOpacity>
            <Text style={styles.title}>{t('myndBudget.title')}</Text>
            <TouchableOpacity onPress={handleOpenHelpModal} style={styles.helpButton}>
              <FontAwesome name="question-circle" size={24} color="#F7e8d3" />
            </TouchableOpacity>
          </View>
          <ScrollView 
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.budgetContainer}>
              <View style={styles.budgetInputContainer}>
                <Text style={styles.budgetLabel}>{t('myndBudget.totalBudgetLabel')}</Text>
                <TextInput
                  style={styles.budgetInput}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                  placeholder={t('myndBudget.enterTotalBudget')}
                  placeholderTextColor="#888"
                />
              </View>
              <View style={styles.budgetInputContainer}>
                <Text style={styles.budgetLabel}>{t('myndBudget.fixedCostsBudgetLabel')}</Text>
                <TextInput
                  style={styles.budgetInput}
                  value={fixedCostsBudget}
                  onChangeText={setFixedCostsBudget}
                  keyboardType="numeric"
                  placeholder={t('myndBudget.enterFixedCostsBudget')}
                  placeholderTextColor="#888"
                />
              </View>
            </View>
  
            <View style={styles.budgetActionsContainer}>
              <TouchableOpacity 
                style={styles.budgetPeriodButton} 
                onPress={toggleBudgetPeriodOptions}
              >
                <Text style={styles.budgetPeriodButtonText}>
                  {t('myndBudget.budgetPeriodLabel')}: {t(`myndBudget.budgetPeriods.${budgetPeriod.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.updateButton} onPress={updateBudget}>
                <Text style={styles.buttonText}>{t('myndBudget.update')}</Text>
              </TouchableOpacity>
            </View>
  
            {showBudgetPeriodOptions && (
              <View style={styles.budgetPeriodOptions}>
                {['Daily', 'Weekly', 'Monthly', 'Biweekly', 'Payday'].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[styles.periodOption, budgetPeriod === period && styles.selectedPeriod]}
                    onPress={() => selectBudgetPeriod(period)}
                  >
                    <Text style={styles.periodOptionText}>
                      {t(`myndBudget.budgetPeriods.${period.toLowerCase()}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
  
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                {t('myndBudget.fixedCostsTodayText')}: {formatCurrency(dailySpent.fixed)}
              </Text>
              <Text style={styles.summaryText}>
                {t('myndBudget.variableCostsTodayText')}: {formatCurrency(dailySpent.variable)}
              </Text>
              <Text style={styles.streakText}>
                {t('myndBudget.budgetStreak')}: {streakCount} {t('myndBudget.days')}
              </Text>
              {renderBudgetProgress()}
            </View>
  
            <View style={styles.expenseHeaderContainer}>
              <Text style={styles.expensesTitle}>{t('myndBudget.recentExpenses')}</Text>
              <TouchableOpacity onPress={toggleExpenseFilter} style={styles.filterButton}>
                <Text style={styles.filterButtonText}>
                  {t(`myndBudget.${expenseFilter.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            </View>
  
            {expenses.slice(0, 5).map(item => renderExpenseItem(item))}
          </ScrollView>
  
          <View style={styles.addExpenseContainer}>
            <TouchableOpacity 
              style={styles.addExpenseButton} 
              onPress={showAddExpenseModal}
            >
              <Text style={styles.addExpenseButtonText}>{t('myndBudget.addExpense')}</Text>
            </TouchableOpacity>
          </View>
  
          {showAddExpense && (
            <Animated.View style={[styles.quickAddContainer, { opacity: fadeAnim }]}>
              <TextInput
                style={styles.quickAddInput}
                value={newExpense.name}
                onChangeText={(text) => setNewExpense(prev => ({ ...prev, name: text }))}
                placeholder={t('myndBudget.expenseName')}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.quickAddInput}
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense(prev => ({ ...prev, amount: text }))}
                placeholder={t('myndBudget.amount')}
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
              <View style={styles.categoryPicker}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryButton, newExpense.category === category && styles.selectedCategory]}
                    onPress={() => setNewExpense(prev => ({ ...prev, category }))}
                  >
                    <Text style={styles.categoryButtonText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.fixedCostButton, newExpense.isFixedCost && styles.selectedFixedCost]}
                onPress={() => setNewExpense(prev => ({ ...prev, isFixedCost: !prev.isFixedCost }))}
              >
                <Text style={styles.fixedCostButtonText}>
                  {newExpense.isFixedCost 
                    ? t('myndBudget.addExpenseFixedCost') 
                    : t('myndBudget.addExpenseVariableCost')
                  }
                </Text>
              </TouchableOpacity>
              <View style={styles.seasonalEventPicker}>
                {seasonalEvents.map(event => (
                  <TouchableOpacity
                    key={event}
                    style={[styles.seasonalEventButton, newExpense.seasonalEvent === event && styles.selectedSeasonalEvent]}
                    onPress={() => setNewExpense(prev => ({ ...prev, seasonalEvent: prev.seasonalEvent === event ? null : event }))}
                  >
                    <Text style={styles.seasonalEventButtonText}>{event}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.addButton} onPress={addExpense}>
                <Text style={styles.buttonText}>{t('myndBudget.addExpense')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={hideAddExpenseModal}>
                <Text style={styles.closeButtonText}>{t('myndBudget.close')}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
  
      {/* New Help Modal Implementation */}
      <MyndBudgetHelpModal
        visible={showHelpModal}
        onClose={handleCloseHelpModal}
        fadeAnim={fadeAnim}
      />
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
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingTop: 40, // Increased padding to bring the header down
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 22, // Slightly reduced from 24
    fontWeight: "700",
    color: "#F7e8d3",
    textAlign: 'center',
  },
  helpButton: {
    padding: 10,
  },
  budgetContainer: {
    marginBottom: 20,
  },
  budgetInputContainer: {
    marginBottom: 10,
  },
  budgetLabel: {
    color: '#F7e8d3',
    fontSize: 16,
    marginBottom: 5,
  },
  budgetInput: {
    backgroundColor: '#444',
    color: '#F7e8d3',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    width: '30%',
  },
  buttonText: {
    color: "#F7e8d3",
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: "center"
  },
  expenseMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  expenseType: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
  budgetPeriodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  budgetActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  budgetPeriodButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  selectedPeriod: {
    backgroundColor: '#FF6347',
  },
  budgetPeriodButtonText: {
    color: '#F7e8d3',
    fontSize: 14,
    textAlign: 'center',
  },
  budgetPeriodOptions: {
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 10,
    padding: 5,
  },
  periodOptionText: {
    color: '#F7e8d3',
    fontSize: 14,
    textAlign: 'center',
  },
  periodOption: {
    padding: 10,
    borderRadius: 5,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryText: {
    color: "#F7e8d3",
    fontSize: 16,
    marginBottom: 5,
  },
  streakText: {
    color: "#FF6347",
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBarContainer: {
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
  },
  progressBarText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#F7e8d3',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  expenseHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expensesTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#F7e8d3",
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseName: {
    color: "#F7e8d3",
    fontSize: 16,
    fontWeight: '500',
  },
  expenseCategory: {
    color: "#F7e8d3",
    fontSize: 12,
    opacity: 0.7,
  },
  expenseAmount: {
    color: "#F7e8d3",
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
  filterButton: {
    backgroundColor: '#444',
    padding: 5,
    borderRadius: 5,
  },
  filterButtonText: {
    color: '#F7e8d3',
    fontSize: 12,
  },
  deleteButton: {
    padding: 5,
  },
  addExpenseContainer: {
    marginTop: 20,
  },
  addExpenseButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addExpenseButtonText: {
    color: '#F7e8d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickAddContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#222',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  quickAddInput: {
    backgroundColor: '#444',
    color: '#F7e8d3',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryButton: {
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10,
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#FF6347',
  },
  categoryButtonText: {
    color: '#F7e8d3',
    fontSize: 14,
  },
  fixedCostButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedFixedCost: {
    backgroundColor: '#4169E1',
  },
  fixedCostButtonText: {
    color: '#F7e8d3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  seasonalEventPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  seasonalEventButton: {
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10,
    minWidth: '45%',
    alignItems: 'center',
  },
  selectedSeasonalEvent: {
    backgroundColor: '#8A2BE2',
  },
  seasonalEventButtonText: {
    color: '#F7e8d3',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: 'transparent',
    borderColor: '#f7e8d3',
    borderWidth: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#f7e8d3',
    fontSize: 16,
    fontWeight: 'bold',
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
  tapToToggle: {
    color: '#F7e8d3',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  currencySelectorContainer: {
    marginVertical: 10,
  },
  currencyLabel: {
    color: '#F7e8d3',
    fontSize: 16,
    marginBottom: 5,
  },
  currencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  currencyButton: {
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedCurrencyButton: {
    backgroundColor: '#FF6347',
  },
  currencyButtonText: {
    color: '#F7e8d3',
    fontSize: 16,
  },
  selectedCurrencyButtonText: {
    fontWeight: 'bold',
  },
});

export default MyndBudget;