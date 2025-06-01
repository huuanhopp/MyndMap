import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';

const GrocerySection = ({ onAdd }) => {
  const { i18n } = useTranslation();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [activeTab, setActiveTab] = useState('simpleList'); // Default to simple list

  // Currency handling based on language
  const currencies = i18n.language === 'ja' 
    ? [{ symbol: '¥', label: '円' }]
    : [
        { symbol: '£', label: 'GBP' },
        { symbol: '$', label: 'USD' },
        { symbol: '€', label: 'EUR' }
      ];
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  const toggleCurrency = () => {
    if (currencies.length > 1) {
      const currentIndex = currencies.findIndex(c => c.symbol === selectedCurrency.symbol);
      const nextIndex = (currentIndex + 1) % currencies.length;
      setSelectedCurrency(currencies[nextIndex]);
    }
  };

  return (
    <>
      {/* Main input */}
      <TextInput
        style={styles.mainInput}
        value={itemName}
        onChangeText={setItemName}
        placeholder="Add a new item..."
        placeholderTextColor="rgba(247, 232, 211, 0.5)"
      />

      {/* Details Row */}
      <View style={styles.detailsRow}>
        <TextInput
          style={styles.quantityInput}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Qty"
          placeholderTextColor="rgba(247, 232, 211, 0.5)"
        />

        <View style={styles.costContainer}>
          <TouchableOpacity
            onPress={toggleCurrency}
            style={styles.currencyButton}
          >
            <Text style={styles.currencyText}>{selectedCurrency.symbol}</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.costInput}
            value={cost}
            onChangeText={setCost}
            placeholder="Cost"
            placeholderTextColor="rgba(247, 232, 211, 0.5)"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, !itemName && styles.addButtonDisabled]}
        onPress={() => {
          if (itemName) {
            onAdd({
              name: itemName,
              quantity,
              cost,
              currency: selectedCurrency.symbol
            });
            setItemName('');
            setQuantity('');
            setCost('');
          }
        }}
        disabled={!itemName}
      >
        <FontAwesome name="plus" size={16} color="#F7E8D3" />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  mainInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#F7E8D3',
    fontSize: 14,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quantityInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#F7E8D3',
    fontSize: 14,
  },
  costContainer: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  currencyButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(247, 232, 211, 0.1)',
  },
  currencyText: {
    color: '#F7E8D3',
    fontSize: 14,
  },
  costInput: {
    flex: 1,
    padding: 12,
    color: '#F7E8D3',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
    height: 32,
    backgroundColor: '#FF6347',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  }
});

export default GrocerySection;