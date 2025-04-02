const mongoose = require('mongoose');

const NyumbaKumiZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a zone name'],
    unique: true,
    trim: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  households: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NyumbaKumiZone', NyumbaKumiZoneSchema);
