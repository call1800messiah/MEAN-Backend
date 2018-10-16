/* eslint-disable no-console */
import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import passport from 'passport';
import path from 'path';
import session from 'express-session';
import socket from 'socket.io';
import SourceMapSupport from 'source-map-support';
import {
  createData,
  deleteData,
  retrieveData,
  updateData,
} from './controllers/crud';

require('./config/passport');

const MongoStore = require('connect-mongo')(session);
const config = require('../config');

const app = express();
const server = http.Server(app);
const io = socket(server);
const appPort = config.app.port;
let sessionStore;

// configure app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(compression());
app.use(passport.initialize());
app.use(require('./routes'));


// Socket IO Setup
const userSockets = {};
io.on('connection', (activeSocket) => {
  let ID = false;
  console.log(`Connected to Socket!! ${activeSocket.id}`);
  console.log(`Socket session object: ${JSON.stringify(activeSocket.request.session)}`);

  if (activeSocket.request.session.passport) {
    console.log(`Passport user: ${activeSocket.request.session.passport.user}`);

    ID = activeSocket.request.session.passport.user;
    userSockets[ID] = activeSocket;
  }

  activeSocket.on('create', (data) => {
    console.log(`socketData: ${JSON.stringify(data)}`);
    createData(data, io);
  });

  activeSocket.on('retrieve', (data) => {
    console.log(`socketData: ${JSON.stringify(data)}`);
    retrieveData(data, io);
  });

  activeSocket.on('update', (data) => {
    console.log(`socketData: ${JSON.stringify(data)}`);
    updateData(data, io);
  });

  activeSocket.on('delete', (data) => {
    console.log(`socketData: ${JSON.stringify(data)}`);
    deleteData(data, io);
  });

  activeSocket.on('disconnect', () => {
    if (ID) {
      delete userSockets[ID];
      return console.log(`User ${ID} has disconnected`);
    }

    return console.log('Unknown user disconnected');
  });
});


// connect to database
mongoose.Promise = global.Promise;
mongoose.connect(config.db.host, {
  useNewUrlParser: true,
});


// Session storage
// eslint-disable-next-line prefer-const
sessionStore = new MongoStore({
  mongooseConnection: mongoose.connection,
  touchAfter: 24 * 3600,
});
const sessionMware = session({
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  name: config.session.cookieName,
  resave: false,
  saveUninitialized: true,
  secret: config.session.secret,
  store: sessionStore,
});
app.use(sessionMware);
io.use((ioSocket, next) => {
  sessionMware(ioSocket.request, ioSocket.request.res, next);
});
app.use(passport.session());


// add Source Map Support
SourceMapSupport.install();


// catch 404
app.use((req, res) => {
  res.status(404).send('<h2 align=center>Page Not Found!</h2>');
});


// start the server
server.listen(appPort, () => {
  console.log(`App Server Listening at ${appPort}`);
});
