/* eslint-disable no-underscore-dangle */
import Users from '../models/user.server.model';
import { createUserFromSteam } from '../controllers/auth';

const passport = require('passport');
const SteamStrategy = require('passport-steam');
const LocalStrategy = require('passport-local');
const config = require('../../config');

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  Users.findById(id, (err, user) => {
    done(err, user);
  });
});

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
    apiKey: config.steam.apiKey,
    realm: `${config.app.host}:${config.app.port}`,
    returnURL: `${config.app.host}:${config.app.port}${config.api.path}${config.api.version}/users/steam/return`,
  },
  (identifier, profile, done) => {
    createUserFromSteam(profile).then((user) => done(null, user)).catch(done);
  }));
}
