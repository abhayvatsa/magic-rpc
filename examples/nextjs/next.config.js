module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.node = {
        fs: 'empty',
        net: 'empty',
      }
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}
