/* eslint-disable no-console */
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import SourceMapSupport from 'source-map-support';
import http from 'http';
import socket from 'socket.io';
import {
  createData,
  deleteData,
  retrieveData,
  updateData,
} from './controllers/crud';



const app = express();
const server = http.Server(app);
const io = socket(server);
const port = process.env.PORT || 3001;

// configure app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


io.on('connection', (activeSocket) => {
  console.log(`Connected to Socket!! ${activeSocket.id}`);

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
});


// connect to database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/mean-backend', {
  useNewUrlParser: true,
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
