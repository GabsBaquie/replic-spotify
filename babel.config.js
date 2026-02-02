// babel.config.js - Configuration Babel pour Jest

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [],
  };
};
