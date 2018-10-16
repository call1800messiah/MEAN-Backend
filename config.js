require('dotenv').config();

const env = process.env.NODE_ENV;

const config = {
  development: {
    api: {
      path: process.env.API_PATH || '/api',
      version: process.env.API_VERSION || '/v1',
    },
    app: {
      host: process.env.APP_HOST || 'http://localhost',
      name: 'MEAN-Backend',
      port: parseInt(process.env.APP_PORT, 10) || 3001,
    },
    configId: 'development',
    db: {
      host: process.env.DB_HOST || 'mongodb://localhost/mean-backend',
    },
    session: {
      cookieName: process.env.SESSION_COOKIE_NAME || 'MEAN-Backend.sess',
      secret: process.env.SESSION_SECRET,
    },
    steam: {
      apiKey: process.env.STEAM_API_KEY || null,
    },
  },
  production: {
    configId: 'production',
  },
};


module.exports = Object.assign({}, config.development, config[env]);
