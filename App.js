// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { UserProvider } from './hooks/userHook';
import i18n from './i18n'; // We'll create this
import MainOptions from './screens/MainOptions';

// Import screens
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import MyndBudget from "./screens/MyndBudget";
import Wiki from "./screens/Wiki";
import AchievementsScreen from "./screens/AchievementsScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import SubscriptionScreen from './screens/SubscriptionScreen';
import ForgotPasswordScreen from "./screens/ForgotPassword";
import DiscussionForumScreen from './screens/DiscussionForumScreen';
import OrganizationProgressScreen from "./screens/OrganizationProgressScreen";
import SplashScreenComponent from "./screens/SplashScreen"; // Import with a different name
import GeneralForumScreen from './screens/GeneralForumScreen';
import BreakdownText from "./screens/BreakdownText";
import HomeScreen from "./screens/HomeScreen";
import SetReminderScreen from "./screens/SetReminderScreen";
import PrivacyPolicy from "./screens/PrivacyPolicy";
import LeaderboardScreen from "./screens/LeaderboardScreen";
import TermsOfService from "./screens/TermsofService";
import TaskModal from "./components/TaskModal";
import NotesScreen from "./screens/NotesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AchievementScreen from "./screens/AchievementScreen";
import MenuScreen from "./components/MenuScreen";
import MindCoolingFeature from "./screens/MindCoolingFeature";
import GroceryListScreen from "./screens/GroceryListScreen";
import CalendarScreen from './calendar/CalendarScreen';
import MoodChecker from './MoodChecker/MoodChecker';

const Stack = createStackNavigator();

export default function App() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    // Initialize i18n
    i18n.init().then(() => {
      setIsI18nInitialized(true);
    });
  }, []);

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  if (!isI18nInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <UserProvider onLanguageChange={handleLanguageChange}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          {/*<Stack.Screen name="MainOptions" component={MainOptions} />*/}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          {/*<Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />*/}
          {/*<Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />*/}
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
