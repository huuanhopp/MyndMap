import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useLanguage } from './LanguageContext'; // Assume we have a LanguageContext

const LanguageScreen = ({ onClose }) => {
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
    onClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Language / 言語を選択</Text>
      <TouchableOpacity
        style={[styles.languageButton, language === 'en' && styles.selectedLanguage]}
        onPress={() => handleLanguageChange('en')}
      >
        <Image
          source={require('../assets/uk-flag.png')} // Make sure to add these flag images to your assets
          style={styles.flag}
        />
        <Text style={styles.languageText}>English</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.languageButton, language === 'ja' && styles.selectedLanguage]}
        onPress={() => handleLanguageChange('ja')}
      >
        <Image
          source={require('../assets/japan-flag.png')}
          style={styles.flag}
        />
        <Text style={styles.languageText}>日本語</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F7e8d3',
    marginBottom: 30,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
  },
  selectedLanguage: {
    backgroundColor: 'rgba(255, 99, 71, 0.5)', // Highlight selected language
  },
  flag: {
    width: 30,
    height: 20,
    marginRight: 15,
  },
  languageText: {
    color: '#F7e8d3',
    fontSize: 18,
  },
  closeButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#F7e8d3',
    fontSize: 18,
  },
});

export default LanguageScreen;