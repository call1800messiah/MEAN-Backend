/* eslint-disable no-console */
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import compression from 'compression';
import mongoose from 'mongoose';
import session from 'express-session';
import SourceMapSupport from 'source-map-support';
import http from 'http';
import socket from 'socket.io';
import {
  createData,
  deleteData,
  retrieveData,
  updateData,
} from './controllers/crud';

const MongoStore = require('connect-mongo')(session);
require('./config/passport');

const app = express();
const server = http.Server(app);
const io = socket(server);
const port = process.env.PORT || 3001;
const sessionSecret = 'bob';
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
mongoose.connect('mongodb://localhost/mean-backend', {
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
  name: 'MEAN-Backend.sess',
  resave: false,
  saveUninitialized: true,
  secret: sessionSecret,
  store: sessionStore,
});
app.use(sessionMware);
io.use((ioSocket, next) => {
  sessionMware(ioSocket.request, ioSocket.request.res, next);
});


// add Source Map Support
SourceMapSupport.install();


// catch 404
app.use((req, res) => {
  res.status(404).send('<h2 align=center>Page Not Found!</h2>');
});


// start the server
server.listen(port, () => {
  console.log(`App Server Listening at ${port}`);
});
