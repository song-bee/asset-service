module.exports = {
  apps: [
    {
      name: 'asset-service',
      script: './src/app.js',
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
}
