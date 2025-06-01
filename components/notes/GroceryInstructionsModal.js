import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image 
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";

const GroceryInstructionsModal = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>How to Use Groceries</Text>
              <TouchableOpacity 
                onPress={onClose}
                style={styles.closeButton}
              >
                <FontAwesome name="times" size={20} color="#F7e8d3" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.section}>
              <Text style={styles.subtitle}>Two Ways to Organize</Text>
              
              <Text style={styles.sectionTitle}>1. Meal-Based List</Text>
              <Text style={styles.text}>
                • Create meals and add ingredients for each{'\n'}
                • Perfect for meal planning{'\n'}
                • Track quantities and costs per ingredient{'\n'}
                • Organize ingredients by dish
              </Text>

              <Text style={styles.sectionTitle}>2. Simple List</Text>
              <Text style={styles.text}>
                • Quick and straightforward grocery list{'\n'}
                • Add items directly without meal association{'\n'}
                • Track quantities and costs{'\n'}
                • Perfect for basic shopping lists
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.subtitle}>Tips</Text>
              <Text style={styles.text}>
                • Switch between modes anytime{'\n'}
                • Use quantities to track how much you need{'\n'}
                • Add costs to estimate your budget{'\n'}
                • Delete items by swiping left
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.gotItButton}
              onPress={onClose}
            >
              <Text style={styles.gotItText}>Got it!</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(247, 232, 211, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247, 232, 211, 0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F7e8d3',
  },
  closeButton: {
    padding: 5,
  },
  section: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6347',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F7e8d3',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#F7e8d3',
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 12,
  },
  gotItButton: {
    backgroundColor: '#FF6347',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  gotItText: {
    color: '#F7e8d3',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroceryInstructionsModal;