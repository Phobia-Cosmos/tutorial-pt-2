module.exports = {
  apps: [{
    name: 'tutorial-2',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'root',
      host: '47.99.89.157',
      key: '~/.ssh/id_rsa',
      ref: 'origin/main',
      repo: 'git@github.com:Phobia-Cosmos/tutorial-pt-2.git',
      path: '/root',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
};
