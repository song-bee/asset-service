const path = require('path')

module.exports = {
  apps: [
    {
      name: 'asset-service',
      script: path.join(__dirname, '..', 'src/app.js'),
      cwd: path.join(__dirname, '..'),
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
}
