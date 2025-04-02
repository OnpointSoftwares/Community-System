const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please provide a message']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NyumbaKumiZone',
    required: true
  },
  // If specific households are targeted, otherwise sent to all in zone
  targetHouseholds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
});

module.exports = mongoose.model('Alert', AlertSchema);
