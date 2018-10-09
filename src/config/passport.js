import Users from '../models/user.server.model';

const passport = require('passport');
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy({
  passwordField: 'user[password]',
  usernameField: 'user[email]',
}, (email, password, done) => {
  Users.findOne({ email })
    .then((user) => {
      if (!user || !user.validatePassword(password)) {
        return done(null, false, { errors: { 'email or password': 'is invalid' } });
      }

      return done(null, user);
    }).catch(done);
}));
