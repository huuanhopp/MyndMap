import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext"; // Import from centralized AuthContext
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import OnboardingScreen from "./OnboardingScreen";

const SignupScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setPasswordVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const { signup } = useAuth(); // Use the centralized Auth Context

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert(t('signup.error'), t('signup.emailPasswordRequired'));
      return;
    }

    try {
      setLoading(true);
      
      // Use the signup function from AuthContext with additional user data
      const user = await signup(email, password, {
        name: "MyndMapper",
        language: i18n.language,
      });

      // Store user info in AsyncStorage
      await AsyncStorage.setItem("userId", user.uid);
      await AsyncStorage.setItem("isAuthorized", "true");

      Alert.alert(t('signup.success'), t('signup.accountCreated'), [
        { text: t('signup.ok'), onPress: () => navigation.navigate("Onboarding") },
      ]);
    } catch (error) {
      Alert.alert(t('signup.error'), t(`signup.${error.code}`) || error.message);
      console.error("Error signing up:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="arrow-left" size={24} color="#1a1a1a" />
      </TouchableOpacity>
      <Text style={styles.title}>{t('signup.forgeYourAccount')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('signup.email')}
        placeholderTextColor="#1a1a1a"
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={t('signup.password')}
          placeholderTextColor="#1a1a1a"
          secureTextEntry={!isPasswordVisible}
          onChangeText={setPassword}
          returnKeyType="go"
        />
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => setPasswordVisibility(!isPasswordVisible)}
        >
          <FontAwesome
            name={isPasswordVisible ? "eye" : "eye-slash"}
            size={20}
            color="#1a1a1a"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{t('signup.enlist')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.smallText}>{t('signup.alreadyALegend')}</Text>
      </TouchableOpacity>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#1a1a1a" />
          <Text style={styles.loadingText}>{t('signup.forgingDestiny')}</Text>
        </View>
      )}
    </View>
  );
};

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
});

export default SignupScreen;