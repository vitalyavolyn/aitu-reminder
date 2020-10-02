module.exports = {
  apps: [{
    name: 'aitu-reminder',
    script: 'index.js',
    autorestart: true,
    env: {
      GOOGLE_APPLICATION_CREDENTIALS: 'googleLogin.json'
    }
  }]
}
