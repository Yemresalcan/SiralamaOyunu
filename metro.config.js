const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase ile ilgili sorunları çözmek için
config.resolver.sourceExts.push('cjs');

// React Native Hermes Engine ile uyumluluk için
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;