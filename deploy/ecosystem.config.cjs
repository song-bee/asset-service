const path = require('path')
const root = path.join(__dirname, '..')

module.exports = {
  apps: [
    {
      name: 'asset-service',
      script: path.join(root, 'src/app.js'),
      cwd: root,
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
}
