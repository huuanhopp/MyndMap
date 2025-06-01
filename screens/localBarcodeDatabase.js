import AsyncStorage from '@react-native-async-storage/async-storage';

const BARCODE_STORAGE_KEY = '@MyApp:barcodes';

export const saveBarcode = async (barcode, productName) => {
  try {
    const existingData = await AsyncStorage.getItem(BARCODE_STORAGE_KEY);
    const barcodes = existingData ? JSON.parse(existingData) : {};
    barcodes[barcode] = productName;
    await AsyncStorage.setItem(BARCODE_STORAGE_KEY, JSON.stringify(barcodes));
  } catch (error) {
    console.error('Error saving barcode:', error);
  }
};

export const getProductName = async (barcode) => {
  try {
    const existingData = await AsyncStorage.getItem(BARCODE_STORAGE_KEY);
    const barcodes = existingData ? JSON.parse(existingData) : {};
    return barcodes[barcode] || null;
  } catch (error) {
    console.error('Error getting product name:', error);
    return null;
  }
};