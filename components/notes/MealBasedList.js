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

const MealBasedList = ({ meals, setMeals }) => {
  const [newMeal, setNewMeal] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [newItem, setNewItem] = useState({
    content: '',
    quantity: '',
    cost: ''
  });

  const addMeal = () => {
    if (newMeal.trim()) {
      const meal = {
        id: Date.now().toString(),
        name: newMeal.trim(),
        items: []
      };
      setMeals([...meals, meal]);
      setNewMeal('');
    }
  };

  const addItemToMeal = (mealId) => {
    if (!newItem.content.trim()) return;

    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: [...meal.items, {
            id: Date.now().toString(),
            ...newItem
          }]
        };
      }
      return meal;
    }));
    setNewItem({ content: '', quantity: '', cost: '' });
  };

  const deleteItem = (mealId, itemId) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: meal.items.filter(item => item.id !== itemId)
        };
      }
      return meal;
    }));
  };

  const deleteMeal = (mealId) => {
    setMeals(meals.filter(meal => meal.id !== mealId));
  };

  const renderItem = ({ item: meal }) => (
    <Animated.View style={styles.mealContainer}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>{meal.name}</Text>
        <TouchableOpacity 
          onPress={() => deleteMeal(meal.id)}
          style={styles.deleteButton}
        >
          <FontAwesome name="trash" size={16} color="#FF6347" />
        </TouchableOpacity>
      </View>

      {selectedMeal === meal.id && (
        <View style={styles.addItemForm}>
          <TextInput
            style={styles.itemInput}
            value={newItem.content}
            onChangeText={text => setNewItem({...newItem, content: text})}
            placeholder="Item name"
            placeholderTextColor="rgba(247, 232, 211, 0.5)"
          />
          <View style={styles.itemDetails}>
            <TextInput
              style={[styles.itemInput, styles.smallInput]}
              value={newItem.quantity}
              onChangeText={text => setNewItem({...newItem, quantity: text})}
              placeholder="Qty"
              placeholderTextColor="rgba(247, 232, 211, 0.5)"
            />
            <TextInput
              style={[styles.itemInput, styles.smallInput]}
              value={newItem.cost}
              onChangeText={text => setNewItem({...newItem, cost: text})}
              placeholder="Cost"
              placeholderTextColor="rgba(247, 232, 211, 0.5)"
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity 
            style={styles.addItemButton}
            onPress={() => addItemToMeal(meal.id)}
          >
            <FontAwesome name="plus" size={12} color="#F7e8d3" />
            <Text style={styles.buttonText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      )}

      {meal.items.length > 0 ? (
        <FlatList
          data={meal.items}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <View style={styles.itemContent}>
                <Text style={styles.itemText}>{item.content}</Text>
                <View style={styles.itemMetadata}>
                  {item.quantity && (
                    <Text style={styles.metadataText}>Qty: {item.quantity}</Text>
                  )}
                  {item.cost && (
                    <Text style={styles.metadataText}>¥{item.cost}</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => deleteItem(meal.id, item.id)}
                style={styles.deleteItemButton}
              >
                <FontAwesome name="times" size={14} color="#FF6347" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.emptyText}>No items added yet</Text>
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setSelectedMeal(selectedMeal === meal.id ? null : meal.id)}
      >
        <FontAwesome 
          name={selectedMeal === meal.id ? "minus" : "plus"} 
          size={12} 
          color="#F7e8d3" 
        />
        <Text style={styles.buttonText}>
          {selectedMeal === meal.id ? "Cancel" : "Add Items"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.addMealContainer}>
        <TextInput
          style={styles.mealInput}
          value={newMeal}
          onChangeText={setNewMeal}
          placeholder="Add a new meal..."
          placeholderTextColor="rgba(247, 232, 211, 0.5)"
        />
        <TouchableOpacity 
          style={styles.addMealButton} 
          onPress={addMeal}
        >
          <FontAwesome name="plus" size={16} color="#F7e8d3" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={meals}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Add your first meal to get started</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addMealContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 8,
  },
  mealInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F7e8d3',
    fontSize: 14,
  },
  addMealButton: {
    backgroundColor: '#FF6347',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitle: {
    color: '#F7e8d3',
    fontSize: 16,
    fontWeight: '600',
  },
  addItemForm: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  itemInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#F7e8d3',
    fontSize: 13,
  },
  smallInput: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    color: '#F7e8d3',
    fontSize: 14,
  },
  itemMetadata: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  metadataText: {
    color: '#F7e8d3',
    fontSize: 12,
    opacity: 0.7,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 99, 71, 0.2)',
    borderRadius: 6,
    paddingVertical: 8,
    marginTop: 8,
    gap: 6,
  },
  buttonText: {
    color: '#F7e8d3',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyText: {
    color: '#F7e8d3',
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteItemButton: {
    padding: 4,
    marginLeft: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6347',
    borderRadius: 6,
    paddingVertical: 8,
    marginTop: 8,
    gap: 6,
  },
});

export default MealBasedList;