const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  caller: {
    type: String,
    ref: 'User',
  }, // Reference to the caller
  callee: {
    type: String,
    ref: 'User',
  }, // Reference to the callee
  startTime: {type: Date, default: Date.now},
  endTime: Date,
  // Add more fields as needed
});

const Call = mongoose.model('Call', callSchema);
module.exports = Call;
