'use strict'

const config = {
  local: {
    port: 8000,
    env: 'local',
    email_port: 8000,
    
    baseUrl: 'http://localhost:3000/',
    siteURL: 'http://localhost:3000/',
    backendBaseUrl: 'http://localhost:8000/',
    imageBaseUrl: 'http://localhost:8000',
    
    env : "local",
    smtp: {
      service: 'gmail',
      host: 'smtp.gmail.com',
      mailUserName: 'ankurram5@gmail.com',
      host: 'smtp.gmail.com',
      mailUsername: 'ankurram5@gmail.com',
      verificationMail: ''
  },
  },
}

module.exports.get = function get(env) {
  return config[env] || config.default
}
