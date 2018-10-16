import Users from '../models/user.server.model';

const passport = require('passport');
const SteamStrategy = require('passport-steam');
const LocalStrategy = require('passport-local');
const config = require('../../config');

passport.use(new LocalStrategy({
  passwordField: 'password',
  usernameField: 'email',
}, (email, password, done) => {
  Users.findOne({ email })
    .then((user) => {
      if (!user || !user.validatePassword(password)) {
        return done(null, false, { errors: { 'email or password': 'is invalid' } });
      }

      return done(null, user);
    }).catch(done);
}));

if (config.steamApiKey !== null) {
  passport.use(new SteamStrategy({
    apiKey: config.steamApiKey,
    realm: `${config.app.host}:${config.app.port}`,
    returnURL: `${config.app.host}:${config.app.port}${config.api.path}${config.api.version}/steam/return`,
  },
  (identifier, profile, done) => {
    // To keep the example simple, the user's Steam profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the Steam account with a user record in your database,
    // and return that user instead.
    console.log(identifier, profile);
    return done(null, profile);
  }));
}
