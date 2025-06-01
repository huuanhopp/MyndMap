import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";

export const CategoryModal = ({ visible, onClose, onSelect, categories, selectedCategory }) => {
  // Get icon for each category
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Tasks': return 'tasks';
      case 'Ideas': return 'lightbulb-o';
      case 'Personal': return 'user';
      case 'Work': return 'briefcase';
      case 'Projects': return 'folder';
      case 'Goals': return 'flag';
      case 'Groceries': return 'shopping-basket';
      case 'Other': return 'ellipsis-h';
      default: return 'circle';
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseIcon}
            >
              <FontAwesome name="times" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  item === selectedCategory && styles.selectedCategory
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <FontAwesome
                  name={getCategoryIcon(item)}
                  size={20}
                  color={item === selectedCategory ? '#FF6347' : '#1A1A1A'}
                  style={styles.categoryIcon}
                />
                <Text style={[
                  styles.categoryOptionText,
                  item === selectedCategory && styles.selectedCategoryText
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#F7E8D3',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 26, 26, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalCloseIcon: {
    padding: 5,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(26, 26, 26, 0.05)',
  },
  selectedCategory: {
    backgroundColor: 'rgba(255, 99, 71, 0.15)',
  },
  categoryIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  selectedCategoryText: {
    color: '#FF6347',
    fontWeight: '500',
  },
};