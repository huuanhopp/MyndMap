import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, Animated } from "react-native";
import { Audio } from "expo-av"; // Import Audio from expo-av

const SplashScreen = ({ onAnimationComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Start fully transparent
  const soundRef = useRef(null); // Ref to hold the audio object

  useEffect(() => {
    // Load and play the splash sound
    const playSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/splash.mp3") // Load the MP3 file
        );
        soundRef.current = sound;

        // Get the duration of the audio
        const status = await sound.getStatusAsync();
        const audioDuration = status.durationMillis || 10000; // Duration in milliseconds, fallback to 10 seconds
        await sound.playAsync(); // Play the sound

        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1, // Fade in to fully visible
          duration: 750, // Fade in over 750ms
          useNativeDriver: true,
        }).start();

        // Fade out animation after the audio finishes
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0, // Fade out to fully transparent
            duration: 500, // Fade out over 500ms
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished && onAnimationComplete) {
              console.log('Splash animation complete, notifying parent component');
              onAnimationComplete();
            }
          });
        }, audioDuration - 3000); // Start fade out 3 seconds before the audio ends
      } catch (error) {
        console.error('Error playing splash sound:', error);
        
        // Fallback animation if audio fails
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.delay(4000),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          })
        ]).start(({ finished }) => {
          if (finished && onAnimationComplete) {
            console.log('Fallback splash animation complete, notifying parent component');
            onAnimationComplete();
          }
        });
      }
    };

    playSound();

    // Force a timeout to ensure we eventually move past the splash screen
    // This is a safety mechanism in case animations or sounds fail
    const safetyTimeout = setTimeout(() => {
      if (onAnimationComplete) {
        console.log('Safety timeout triggered for splash screen');
        onAnimationComplete();
      }
    }, 12000); // 12 seconds maximum splash screen time

    // Clean up the sound when the component unmounts
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync(); // Unload the sound
      }
      clearTimeout(safetyTimeout);
    };
  }, [fadeAnim, onAnimationComplete]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image source={require("../assets/mynd.png")} style={styles.logo} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7e8d3",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
});

export default SplashScreen;