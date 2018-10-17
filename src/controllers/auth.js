import passport from 'passport';
import User from '../models/user.server.model';



export const login = function login(req, res) {
  return passport.authenticate('local', (err, user, info) => {
    let token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if (user) {
      token = user.generateJWT();
      res.status(200);
      res.json({
        token,
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);
};


export const loginWithSteam = function loginWithSteam(req, res) {
  return passport.authenticate('steam', (err, user, info) => {
    let param = '';

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if (user) {
      param = `?token=${user.generateJWT()}`;
    } else {
      console.log(info);
      // param = `?info=${info}`;
    }

    res.redirect(`http://localhost:4200/auth${param}`);
  })(req, res);
};


export const register = function register(req, res) {
  console.log('Registering user');
  const user = new User();

  if (!req.body.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if (!req.body.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  user.name = req.body.name;
  user.email = req.body.email;

  user.setPassword(req.body.password);

  return user.save(() => {
    const token = user.generateJWT();
    res.status(200);
    res.json({
      token,
    });
  });
};


export const createUserFromSteam = function createUserFromSteam(profile) {
  console.log('Creating user from steam:', profile);
  const promise = User.findOne({ steamId: profile.id }).exec();
  return promise.then((user) => {
    if (user === null) {
      const newUser = new User();
      newUser.steamId = profile.id;
      newUser.name = profile.displayName;
      newUser.save();

      return newUser;
    }

    return user;
  })
    .catch((err) => {
      console.log(err);
    });
};
