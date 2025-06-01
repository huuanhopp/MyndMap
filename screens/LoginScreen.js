import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext"; // Updated to use AuthContext
import { testFirebaseConnection, testCreateUser, testLogin } from "../utils/firebaseTest";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState(null);
  const { t } = useTranslation();
  const { login, authError } = useAuth(); // Using the centralized AuthContext

  useEffect(() => {
    const checkLoginStatus = async () => {
      const attempts = await AsyncStorage.getItem('loginAttempts');
      const lockoutEnd = await AsyncStorage.getItem('lockoutEndTime');
      
      if (lockoutEnd) {
        const currentTime = new Date().getTime();
        if (currentTime < parseInt(lockoutEnd)) {
          setLockoutEndTime(parseInt(lockoutEnd));
          setLoginAttempts(parseInt(attempts) || 0);
        } else {
          // Reset if lockout period has expired
          await AsyncStorage.multiRemove(['loginAttempts', 'lockoutEndTime']);
          setLoginAttempts(0);
          setLockoutEndTime(null);
        }
      } else if (attempts) {
        setLoginAttempts(parseInt(attempts));
      }
    };
    
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    console.log('Quest to enter the realm initiated');
    console.log('Email:', email);
    console.log('Password length:', password.length);

    // Debug Firebase connection
    const connectionTest = await testFirebaseConnection();
    console.log('Firebase connection test:', connectionTest);

    // Check if user is currently locked out
    if (lockoutEndTime) {
      const currentTime = new Date().getTime();
      if (currentTime < lockoutEndTime) {
        const minutesLeft = Math.ceil((lockoutEndTime - currentTime) / (1000 * 60));
        Alert.alert(
          t('login.tooManyAttempts'),
          t('login.lockoutMessage', { minutes: minutesLeft })
        );
        return;
      } else {
        // Reset lockout if time has expired
        await AsyncStorage.multiRemove(['loginAttempts', 'lockoutEndTime']);
        setLoginAttempts(0);
        setLockoutEndTime(null);
      }
    }
  
    if (!email.trim() || !password.trim()) {
      console.log('Missing Field');
      Alert.alert(t('login.invalidEmail'), t('login.invalidEmailMessage'));
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Wrong Email');
      Alert.alert(t('login.invalidEmail'), t('login.invalidEmailMessage'));
      return;
    }
  
    if (password.length < 8) {
      console.log('Weak Key: Key too short');
      Alert.alert(t('login.feebleKey'), t('login.feebleKeyMessage'));
      return;
    }

    try {
      console.log('Attempting to unlock the gates of the realm');
      setLoading(true);
      
      // Test direct Firebase login first
      console.log('Testing direct Firebase login...');
      const directTest = await testLogin(email, password);
      console.log('Direct Firebase test result:', directTest);
      
      if (!directTest.success) {
        if (directTest.code === 'auth/user-not-found') {
          Alert.alert(
            'Account Not Found', 
            'No account exists with this email. Would you like to create one?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Create Account', onPress: () => navigation.navigate('Signup') }
            ]
          );
          return;
        }
      }
      
      // Using the login function from AuthContext with additional debugging
      console.log('Calling AuthContext login with email:', email);
      const user = await login(email, password);
      
      if (user) {
        console.log('User authenticated successfully:', user.uid);
        await AsyncStorage.multiRemove(['loginAttempts', 'lockoutEndTime']);
        await AsyncStorage.setItem('userId', user.uid);
        await AsyncStorage.setItem('isAuthorized', 'true');
        setLoginAttempts(0);
        setLockoutEndTime(null);
        
        // Force a small delay to ensure Firebase has time to register the authentication
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check onboarding status and navigate accordingly
        if (user.completedOnboarding) {
          console.log('User has completed onboarding, navigating to Home');
          navigation.navigate('Home');
        } else {
          console.log('User has not completed onboarding, navigating to Onboarding');
          navigation.navigate('Onboarding');
        }
      } else {
        console.error('Login successful but no user returned');
        Alert.alert(
          t('login.errorTitle'),
          t('login.unexpectedError')
        );
      }
    } catch (error) {
      console.error('Quest error:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error:', JSON.stringify(error));
      
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      await AsyncStorage.setItem('loginAttempts', newAttempts.toString());
      
      if (newAttempts >= 3) {
        // Set 30-minute lockout
        const lockoutEnd = new Date().getTime() + (30 * 60 * 1000);
        setLockoutEndTime(lockoutEnd);
        await AsyncStorage.setItem('lockoutEndTime', lockoutEnd.toString());
        Alert.alert(
          t('login.tooManyAttempts'),
          t('login.lockoutInitialMessage')
        );
        return;
      }

      switch(error.code) {
        case 'auth/user-not-found':
          Alert.alert(t('login.unknownTraveler'), t('login.unknownTravelerMessage'));
          break;
        case 'auth/wrong-password':
          Alert.alert(t('login.incorrectKey'), t('login.incorrectKeyMessage'));
          break;
        case 'auth/too-many-requests':
          Alert.alert(t('login.tooManyAttempts'), t('login.tooManyAttemptsMessage'));
          break;
        case 'auth/network-request-failed':
          Alert.alert(t('login.connectionLost'), t('login.connectionLostMessage'));
          break;
        default:
          Alert.alert(t('login.mysteriousForces'), t('login.mysteriousForcesMessage'));
      }
    } finally {
      setLoading(false);
      console.log('The quest to enter the realm concludes');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="arrow-left" size={24} color="#1a1a1a" />
      </TouchableOpacity>
      <Text style={styles.title}>{t('login.enterYourRealm')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('login.email')}
        placeholderTextColor="#1a1a1a"
        onChangeText={(text) => setEmail(text)}
        value={email}
        returnKeyType="next"
        onSubmitEditing={() => this.passwordInput.focus()}
        blurOnSubmit={false}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={t('login.password')}
          placeholderTextColor="#1a1a1a"
          secureTextEntry={!showPassword}
          onChangeText={(text) => setPassword(text)}
          value={password}
          ref={(input) => { this.passwordInput = input; }}
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPasswordText}>{t('login.forgotPassword')}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{t('login.embark')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.smallText}>{t('login.noQuestLog')}</Text>
      </TouchableOpacity>
      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: '#f7e8d3' }]}>
          <ActivityIndicator size="large" color="#1a1a1a" />
          <Text style={styles.loadingText}>{t('login.summoning')}</Text>
        </View>
      )}
    </View>
  );
};

export default LoginScreen;
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7e8d3",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#1a1a1a",
  },
  input: {
    width: "85%",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderColor: "#1a1a1a",
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderColor: "#1a1a1a",
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
  },
  iconContainer: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "bold"
  },
  button: {
    backgroundColor: '#1a1a1a',
    borderColor: '#FF6347',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
  },
  buttonText: {
    color: "#F7e8d3",
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  smallText: {
    color: "#1a1a1a",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold"
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(247, 232, 211, 0.95)',
  },
  loadingText: {
    marginTop: 10,
    color: "#1a1a1a",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(247, 232, 211, 0.95)',
  },
});
