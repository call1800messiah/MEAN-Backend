import Users from '../../../models/user.server.model';
import {
  login,
  loginWithSteam,
  register,
} from '../../../controllers/auth';

const router = require('express').Router();
const auth = require('../../auth');

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

router.get('/steam', (req, res) => loginWithSteam(req, res));
router.get(
  '/steam/return',
  (req, res, next) => {
    req.url = req.originalUrl;
    next();
  },
  (req, res) => loginWithSteam(req, res),
);



module.exports = router;
