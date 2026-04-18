/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for Stellar SDK and browser-only modules
 webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    // Ignore Node.js specific modules on client-side
    config.externals.push({
      'sodium-native': 'sodium-native',
      'require-addon': 'require-addon',
    });
  }
  return config;
},
  // Transpile Stellar packages
  transpilePackages: ['@creit.tech/stellar-wallets-kit'],
};

module.exports = nextConfig;
