const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add asset handling
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'ttf',
  'otf',
];

// Add support for aliases
config.resolver.alias = {
  '@components': path.resolve(__dirname, 'src/components'),
  '@fonts': path.resolve(__dirname, 'assets/fonts'),
  '@styles': path.resolve(__dirname, 'src/styles'),
  '@screens': path.resolve(__dirname, 'src/screens'),
};

// Ensure assets are properly resolved
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'ttf',
  'otf',
];

module.exports = config; 
