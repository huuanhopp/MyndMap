import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

const Particle = ({ size, duration, delay, color, backgroundOpacity }) => {
  const position = useRef(new Animated.ValueXY({
    x: Math.random() * width,
    y: Math.random() * height
  })).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Initial delay before starting animation
    const initialAnimation = Animated.delay(delay);
    // Main animation loop
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          // Move particle to a new random position
          Animated.timing(position, {
            toValue: {
              x: Math.random() * width,
              y: Math.random() * height,
            },
            duration: duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          // Fade in
          Animated.timing(opacity, {
            toValue: Math.random() * 0.2 + 0.1,
            duration: duration * 0.4,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
        // Hold opacity for a moment
        Animated.timing(opacity, {
          toValue: Math.random() * 0.2 + 0.1,
          duration: duration * 0.2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // Fade out
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration * 0.4,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    );
    
    // Start with delay, then loop
    Animated.sequence([
      initialAnimation,
      loopAnimation
    ]).start();
    
    return () => {
      // Clean up animation when component unmounts
      position.stopAnimation();
      opacity.stopAnimation();
    };
  }, []);
  
  // Combine the particle's opacity with the background opacity if provided
  const finalOpacity = backgroundOpacity ? Animated.multiply(opacity, backgroundOpacity) : opacity;
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        backgroundColor: color || '#F7E8D3',
        borderRadius: size / 2,
        opacity: finalOpacity,
        transform: [
          { translateX: position.x },
          { translateY: position.y },
        ],
        // Add a solid background color instead of relying on opacity alone
        // This helps the shadow calculation
        backgroundColor: color || '#F7E8D3'
      }}
    />
  );
};

const ParticleAnimation = ({ count = 30, backgroundOpacity }) => {
  // Create an array of particle configurations
  const particles = Array(count).fill().map((_, i) => ({
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8000 + 7000,
    delay: Math.random() * 3000,
    color: Math.random() > 0.7 ? '#FF6347' : '#F7E8D3',
  }));
  
  return (
    <View style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 1,
      pointerEvents: 'none',
      // Add a solid background color (can be transparent)
      backgroundColor: 'transparent'
    }}>
      {particles.map((particle, index) => (
        <Particle
          key={index}
          size={particle.size}
          duration={particle.duration}
          delay={particle.delay}
          color={particle.color}
          backgroundOpacity={backgroundOpacity}
        />
      ))}
    </View>
  );
};

export default ParticleAnimation;