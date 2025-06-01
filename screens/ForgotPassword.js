import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ImageBackground, 
  StyleSheet, 
  Image,
  ActivityIndicator 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext'; // Use centralized AuthContext

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth(); // Use the centralized auth context

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      // Use the forgotPassword function from the AuthContext
      await forgotPassword(email);
      
      Alert.alert(
        'Password Reset Email Sent',
        'Check thy inbox for instructions to reset thy password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('Error sending password reset email:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to send password reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require("../assets/forgot_password.png")} style={styles.container}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require("../assets/back_arrow.png")} style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.title}>Forgotten your Key?</Text>
        <Text style={styles.subtitle}>Enter your email to receive a password reset link:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter thy email..."
          placeholderTextColor="#1a1a1a"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.smallText}>Remember your password? Return to Login!</Text>
        </TouchableOpacity>
        <Image source={require("../assets/login_one.png")} style={styles.bottomLeftImage} />
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1a1a1a" />
            <Text style={styles.loadingText}>Sending recovery magic...</Text>
          </View>
        )}
      </View>
    </ImageBackground>
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(247, 232, 211, 0.95)', // Semi-transparent overlay
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
  },
  backArrow: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "center",
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
  bottomLeftImage: {
    width: 170,
    height: 170,
    position: "absolute",
    bottom: 20,
    left: 0,
    resizeMode: "contain",
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
  loadingText: {
    marginTop: 10,
    color: "#1a1a1a",
  },
});

export default ForgotPasswordScreen;