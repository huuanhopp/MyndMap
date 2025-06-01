// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for additional file extensions if needed
config.resolver.assetExts.push(
    // Adds support for `.db` files for SQLite databases
    'db'
);

// Add .cjs extension support for Firebase compatibility
config.resolver.sourceExts.push('cjs');

// Fix for Firebase "Component auth has not been registered yet" error
config.resolver.unstable_enablePackageExports = false;

// Add support for Firebase compatibility
config.resolver.alias = {
  ...config.resolver.alias,
  // Ensure proper Firebase module resolution
  'firebase/auth': 'firebase/auth',
  'firebase/firestore': 'firebase/firestore',
  'firebase/app': 'firebase/app',
};

// Configure transformer for better performance
config.transformer = {
  ...config.transformer,
  // Enable inline requires for better performance
  inlineRequires: true,
};

// Configure serializer for better bundle optimization
config.serializer = {
  ...config.serializer,
  // Optimize bundle size
  // getModulesRunBeforeMainModule: () => [],
};
config.resolver = {
  ...config.resolver,
  // Resolve node modules properly for Firebase
  nodeModulesPaths: [
    './node_modules',
  ],
  // Platforms to resolve for
  platforms: ['ios', 'android', 'web'],
};

module.exports = config;
