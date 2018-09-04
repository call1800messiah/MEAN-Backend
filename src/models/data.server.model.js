import mongoose from 'mongoose';

const Schema = mongoose.Schema({
  content: String,
  created: {
    default: Date.now,
    type: Date,
  },
  label: {
    default: '',
    type: String,
  },
}, {
  collection: 'info',
});

export default mongoose.model('Data', Schema);
