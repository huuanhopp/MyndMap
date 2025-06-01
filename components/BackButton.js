// components/BackButton.js
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

const BackButton = () => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity
      style={{
        padding: 10,
        borderRadius: 20,
        marginRight: 10,
      }}
      onPress={() => navigation.navigate('MenuScreen')} // Explicitly navigate to MenuScreen
    >
      <FontAwesome name="chevron-left" size={24} color="#1a1a1a" />
    </TouchableOpacity>
  );
};

export default BackButton;