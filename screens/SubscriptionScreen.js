import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import RNIap from 'react-native-iap';

const SubscriptionScreen = ({ onClose }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="times" size={24} color="#F7e8d3" />
          </TouchableOpacity>
          <Text style={styles.title}>Subscription Plans</Text>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.myndMapperContainer}>
            <Text style={styles.planTitle}>MyndMapper</Text>
            <Text style={styles.planDescription}>
              Access to all current features:
            </Text>
            <Text style={styles.feature}>• Task Management</Text>
            <Text style={styles.feature}>• Mood Tracking</Text>
            <Text style={styles.feature}>• Community Forum</Text>
            <Text style={styles.feature}>• Mynd Cooling</Text>
            <Text style={styles.feature}>• Mynd Budget</Text>
            <TouchableOpacity style={styles.subscribeButton}>
              <Text style={styles.subscribeButtonText}>Continue with Free Plan</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.myndMasterContainer}>
            <View style={styles.popularBanner}>
              <Text style={styles.popularText}>Popular!</Text>
            </View>
            <Text style={[styles.planTitle, styles.masterPlanTitle]}>MyndMaster</Text>
            <Text style={[styles.planDescription, styles.masterPlanDescription]}>
              Everything in MyndMapper, plus:
            </Text>
            <Text style={[styles.feature, styles.masterFeature]}>• Email integration with Calendar</Text>
            <Text style={[styles.feature, styles.masterFeature]}>• Mynd Emojis</Text>
            <TouchableOpacity style={[styles.subscribeButton, styles.masterSubscribeButton]}>
              <Text style={[styles.subscribeButtonText, styles.masterSubscribeButtonText]}>
                Subscribe for £4.99/month
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f7e8d3',
  },
  closeButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  myndMapperContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  myndMasterContainer: {
    backgroundColor: '#f7e8d3',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  popularBanner: {
    position: 'absolute',
    top: 10,
    right: -30,
    backgroundColor: '#FF6347',
    paddingHorizontal: 30,
    paddingVertical: 5,
    transform: [{ rotate: '45deg' }],
  },
  popularText: {
    color: '#f7e8d3',
    fontWeight: 'bold',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 10,
  },
  masterPlanTitle: {
    color: '#1a1a1a',
  },
  planDescription: {
    fontSize: 16,
    color: '#f7e8d3',
    marginBottom: 10,
  },
  masterPlanDescription: {
    color: '#1a1a1a',
  },
  feature: {
    fontSize: 14,
    color: '#f7e8d3',
    marginBottom: 5,
  },
  masterFeature: {
    color: '#1a1a1a',
  },
  subscribeButton: {
    backgroundColor: '#FF6347',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  masterSubscribeButton: {
    backgroundColor: '#1a1a1a',
  },
  subscribeButtonText: {
    color: '#f7e8d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  masterSubscribeButtonText: {
    color: '#f7e8d3',
  },
});

export default SubscriptionScreen;