const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Google Sign-In popup postMessage (fixes COOP warnings)
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      middleware(req, res, next);
    };
  },
};

module.exports = config;
