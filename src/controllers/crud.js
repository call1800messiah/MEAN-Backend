/* eslint-disable no-console */
import Data from '../models/data.server.model';



export const retrieveData = (data, io) => {
  if (data === null) {
    console.log('Sending all data');
    Data.find({}, (err, dataList) => {
      io.emit('retrieveAllData', dataList);
    });
  }
};

export const createData = (data, io) => {
  const newData = new Data({ content: data, label: 'Name' });
  newData.save((err, result) => {
    if (err) {
      console.log(`Error creating data: ${err}`);
    } else {
      io.emit('dataCreated', result);
    }
  });
};

export const updateData = (data, io) => {
  Data.findOneAndUpdate(
    { _id: data._id },
    { content: data.content },
    { new: true },
    (err, updated) => {
      if (err) {
        console.log(`Error updating data: ${err}`);
      } else {
        io.emit('dataUpdated', updated);
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
