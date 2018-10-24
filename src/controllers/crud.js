/* eslint-disable no-console,no-underscore-dangle */
import Data from '../models/data.server.model';



export const retrieveData = (data, socket, userID) => {
  if (data === null) {
    console.log('Sending all data');
    const options = {};
    if (!userID) {
      options.public = true;
    }
    Data.find(options, (err, dataList) => {
      socket.emit('retrieveAllData', dataList);
    });
  }
};

export const createData = (data, sockets) => {
  const newData = new Data({ content: data, label: 'Name', public: true });
  newData.save((err, result) => {
    if (err) {
      console.log(`Error creating data: ${err}`);
    } else {
      Object.values(sockets).forEach((socket) => {
        if (socket.userID !== '' || result.public) {
          socket.socket.emit('dataCreated', result);
        }
      });
    }
  });
};

export const updateData = (data, sockets) => {
  Data.findOneAndUpdate(
    { _id: data._id },
    { content: data.content },
    { new: true },
    (err, updated) => {
      if (err) {
        console.log(`Error updating data: ${err}`);
      } else {
        Object.values(sockets).forEach((socket) => {
          if (socket.userID !== '' || updated.public) {
            socket.socket.emit('dataUpdated', updated);
          }
        });
      }
    },
  );
};

export const deleteData = (data, io) => {
  console.log(data);
  Data.deleteOne({ _id: data._id }, (err) => {
    if (err) {
      console.log(`Error deleting data: ${err}`);
    } else {
      io.emit('dataDeleted', data._id);
    }
  });
};
