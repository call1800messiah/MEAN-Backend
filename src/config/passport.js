import Users from '../models/user.server.model';

const passport = require('passport');
const SteamStrategy = require('passport-steam');
const LocalStrategy = require('passport-local');

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

passport.use(new SteamStrategy({
  apiKey: 'Your API key here',
  realm: 'http://localhost:3001/',
  returnURL: 'http://localhost:3001/auth/steam/return',
},
(identifier, profile, done) => {
  // To keep the example simple, the user's Steam profile is returned to
  // represent the logged-in user.  In a typical application, you would want
  // to associate the Steam account with a user record in your database,
  // and return that user instead.
  console.log(identifier, profile);
  return done(null, profile);
}));
