import axios from 'axios';

export const lookupFoodBarcode = async (barcode) => {
  try {
    console.log(`Looking up food barcode: ${barcode}`);
    const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    console.log('Open Food Facts API Response:', response.data);

    if (response.data && response.data.status === 1) {
      return response.data.product.product_name || response.data.product.generic_name;
    } else {
      console.log('Food product not found in database');
      return null;
    }
  } catch (error) {
    console.error('Error looking up food barcode:', error.response ? error.response.data : error.message);
    return null;
  }
};

export const lookupMiscBarcode = async (barcode) => {
  try {
    console.log(`Looking up miscellaneous barcode: ${barcode}`);
    const response = await axios.get(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
    console.log('UPCItemDB API Response:', response.data);

    if (response.data && response.data.items && response.data.items.length > 0) {
      return response.data.items[0].title;
    } else {
      console.log('Miscellaneous product not found in database');
      return null;
    }
  } catch (error) {
    console.error('Error looking up miscellaneous barcode:', error.response ? error.response.data : error.message);
    return null;
  }
};