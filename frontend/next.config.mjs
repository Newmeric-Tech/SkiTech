import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname),
  transpilePackages: ['framer-motion', 'motion-dom', 'motion-utils'],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
    };
    if (!isServer) {
      config.resolve.alias['motion-dom'] = path.resolve(__dirname, 'node_modules/motion-dom');
      config.resolve.alias['motion-utils'] = path.resolve(__dirname, 'node_modules/motion-utils');
    }
    return config;
  },
};

export default nextConfig;
