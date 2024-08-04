/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  basePath: "/e-commerce", // Replace with your repository name
  assetPrefix: "/e-commerce/", // Replace with your repository name
  images: {
    domains: ["lh3.googleusercontent.com"], // Specify domains for images
    // remotePatterns is deprecated, use domains instead
  },
  webpack(config, { webpack }) {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};

module.exports = nextConfig;
