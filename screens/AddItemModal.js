import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

const AddItemModal = ({ visible, onClose, onAdd }) => {
  const [item, setItem] = useState({ name: '', quantity: '', cost: '', currency: 'USD' });
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN'];

  const handleAdd = () => {
    onAdd(item);
    setItem({ name: '', quantity: '', cost: '', currency: 'USD' });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView>
            <Text style={styles.modalTitle}>Add New Item</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Item Name</Text>
              <TextInput
                style={styles.input}
                value={item.name}
                onChangeText={(text) => setItem({...item, name: text})}
                placeholder="Enter item name"
                placeholderTextColor="#a0a0a0"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={item.quantity}
                onChangeText={(text) => setItem({...item, quantity: text})}
                placeholder="Enter quantity"
                placeholderTextColor="#a0a0a0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cost</Text>
              <View style={styles.costContainer}>
                <TextInput
                  style={[styles.input, styles.costInput]}
                  value={item.cost}
                  onChangeText={(text) => setItem({...item, cost: text})}
                  placeholder="Enter cost"
                  placeholderTextColor="#a0a0a0"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.currencyButton}
                  onPress={() => setShowCurrencyPicker(true)}
                >
                  <Text style={styles.currencyButtonText}>{item.currency}</Text>
                  <FontAwesome name="caret-down" size={16} color="#F7e8d3" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showCurrencyPicker}
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View style={styles.pickerModalView}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
              <Text style={styles.pickerHeaderButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={item.currency}
            onValueChange={(itemValue) => {
              setItem({...item, currency: itemValue});
              setShowCurrencyPicker(false);
            }}
          >
            {currencies.map((currency) => (
              <Picker.Item key={currency} label={currency} value={currency} />
            ))}
          </Picker>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F7e8d3',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#F7e8d3',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(247, 232, 211, 0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#F7e8d3',
    fontSize: 16,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costInput: {
    flex: 2,
    marginRight: 10,
  },
  currencyButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 232, 211, 0.1)',
    borderRadius: 10,
    padding: 15,
  },
  currencyButtonText: {
    color: '#F7e8d3',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#F7e8d3',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#F7e8d3',
    fontSize: 16,
  },
  pickerModalView: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247, 232, 211, 0.1)',
  },
  pickerHeaderButton: {
    color: '#F7e8d3',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddItemModal;