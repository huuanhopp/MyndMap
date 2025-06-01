import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  Animated 
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";

const SimpleList = ({ items, setItems }) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      const item = {
        id: Date.now().toString(),
        name: newItem.trim(),
        quantity: '',
        cost: ''
      };
      setItems([...items, item]);
      setNewItem('');
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const renderItem = ({ item }) => (
    <Animated.View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.itemDetails}>
        <TextInput
          style={styles.detailInput}
          value={item.quantity}
          onChangeText={(text) => updateItem(item.id, 'quantity', text)}
          placeholder="Qty"
          placeholderTextColor="rgba(247, 232, 211, 0.5)"
        />
        <View style={styles.costInput}>
          <Text style={styles.currencySymbol}>¥</Text>
          <TextInput
            style={[styles.detailInput, { paddingLeft: 0 }]}
            value={item.cost}
            onChangeText={(text) => updateItem(item.id, 'cost', text)}
            placeholder="Cost"
            placeholderTextColor="rgba(247, 232, 211, 0.5)"
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity 
          onPress={() => deleteItem(item.id)}
          style={styles.deleteButton}
        >
          <FontAwesome name="trash" size={16} color="#FF6347" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add a new item..."
          placeholderTextColor="rgba(247, 232, 211, 0.5)"
          onSubmitEditing={addItem}
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={addItem}
        >
          <FontAwesome name="plus" size={16} color="#F7e8d3" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Add your first item to get started</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F7e8d3',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#FF6347',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  itemName: {
    color: '#F7e8d3',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#F7e8d3',
    fontSize: 13,
  },
  costInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  currencySymbol: {
    color: '#F7e8d3',
    fontSize: 13,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    color: '#F7e8d3',
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default SimpleList;