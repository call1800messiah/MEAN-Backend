import passport from 'passport';
import Users from '../../models/user.server.model';
import {
  login,
  register,
} from '../../controllers/auth';

const router = require('express').Router();
const auth = require('../auth');

router.get('/current', auth.required, (req, res) => {
  const { payload: { id } } = req;

  return Users.findById(id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});
router.post('/login', auth.optional, (req, res) => login(req, res));
router.post('/register', auth.optional, (req, res) => register(req, res));

router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }), (req, res) => { res.redirect('/'); });
router.get('/steam/return', (req, res, next) => {
  req.url = req.originalUrl;
  next();
},
passport.authenticate('steam', { failureRedirect: '/' }),
(req, res) => {
  res.redirect('/');
});



module.exports = router;
