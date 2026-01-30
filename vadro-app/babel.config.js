module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Si tu as d'autres plugins, ils vont ici
      'react-native-reanimated/plugin', // <--- IL DOIT ÊTRE EN DERNIER !
    ],
  };
};