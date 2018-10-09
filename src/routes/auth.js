const jwt = require('express-jwt');

const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;

  if (authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  return null;
};

const auth = {
  optional: jwt({
    credentialsRequired: false,
    getToken: getTokenFromHeaders,
    secret: 'secret',
    userProperty: 'payload',
  }),
  required: jwt({
    getToken: getTokenFromHeaders,
    secret: 'secret',
    userProperty: 'payload',
  }),
};

module.exports = auth;
