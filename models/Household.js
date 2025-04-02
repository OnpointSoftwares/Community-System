const mongoose = require('mongoose');

const HouseholdSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: [true, 'Please provide an address']
  },
  houseNumber: {
    type: String,
    required: [true, 'Please provide a house number']
  },
  numOfResidents: {
    type: Number,
    required: [true, 'Please provide the number of residents']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  nyumbaKumiZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NyumbaKumiZone',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Average rating calculated from all ratings
  averageRating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  // Array of users who belong to this household
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

module.exports = mongoose.model('Household', HouseholdSchema);
