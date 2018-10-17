/* eslint-disable no-console */
import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
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
const cors = require('cors');
const config = require('../config');



const app = express();
const appPort = config.app.port;
const server = http.Server(app);
const io = socket(server);
const userSockets = {};


// configure app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use(cors());


// connect to database
mongoose.Promise = global.Promise;
mongoose.connect(config.db.host, {
  useNewUrlParser: true,
});


// Session storage
const sessionMware = session({
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  name: config.session.cookieName,
  resave: false,
  saveUninitialized: true,
  secret: config.session.secret,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    touchAfter: 24 * 3600,
  }),
});
app.use(sessionMware);


// Initialize passport
app.use(passport.initialize());
app.use(passport.session());


// Setup routes
app.use(require('./routes'));


// Socket IO Setup
io.use((ioSocket, next) => {
  sessionMware(ioSocket.request, {}, next);
});
io.use((activeSocket, next) => {
  jwt.verify(activeSocket.handshake.query.token, config.session.secret, (err) => {
    if (err) {
      return next(new Error('authentication error'));
    }

    return next();
  });
});
io.on('connection', (activeSocket) => {
  const decoded = jwt.decode(activeSocket.handshake.query.token);
  const ID = decoded.id;
  userSockets[ID] = activeSocket;
  console.log(`User ${ID} connected to socket: ${activeSocket.id}`);
  // console.log(`Socket session object: ${JSON.stringify(activeSocket.request.session)}`);
  //
  // if (activeSocket.request.session.passport) {
  //   console.log(`Passport user: ${activeSocket.request.session.passport.user}`);
  //
  //   ID = activeSocket.request.session.passport.user;
  //   userSockets[ID] = activeSocket;
  // }
  // console.log(userSockets);



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
