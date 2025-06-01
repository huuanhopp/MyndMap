import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';
import en from './locales/en.json';
import ja from './locales/ja.json';
import en2 from './locales/en_2.json';
import ja2 from './locales/ja_2.json';
import enOverdueNotif from './locales/en_overdue_notif.json';
import jaOverdueNotif from './locales/ja_overdue_notif.json';

// Get the device language for better default experience
const getDeviceLanguage = () => {
  try {
    // iOS detection
    if (Platform.OS === 'ios') {
      const deviceLanguage = 
        NativeModules.SettingsManager.settings.AppleLocale || 
        NativeModules.SettingsManager.settings.AppleLanguages[0] || 
        'en';
      return deviceLanguage.slice(0, 2);
    } 
    // Android detection
    else if (Platform.OS === 'android') {
      return NativeModules.I18nManager.localeIdentifier.slice(0, 2);
    }
  } catch (error) {
    console.warn('Error detecting device language:', error);
  }
  return 'en'; // Default to English
};

// Deep merge strategy to avoid duplications and conflicts
const resources = {
  en: {
    translation: {
      ...en,
      ...en2,
      ...enOverdueNotif,
    }
  },
  ja: {
    translation: {
      ...ja,
      ...ja2,
      ...jaOverdueNotif,
    }
  },
};

// Debug any translation issues in development
const isDevMode = __DEV__;

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    debug: isDevMode,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    // Improved performance
    returnEmptyString: false,
    returnNull: false,
    keySeparator: '.',
    nsSeparator: ':',
    // Better error handling
    parseMissingKeyHandler: (key) => {
      if (isDevMode) {
        console.warn(`Missing translation key: ${key}`);
      }
      return key;
    }
  });

// Handle errors better
if (isDevMode) {
  i18n.on('missingKey', (lngs, namespace, key) => {
    console.warn(`Missing translation: ${key} in ${namespace} for languages: ${lngs.join(', ')}`);
  });
}

export default i18n;