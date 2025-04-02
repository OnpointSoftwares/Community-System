const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true
  },
  ratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating between 1 and 5']
  },
  comment: {
    type: String
  },
  category: {
    type: String,
    enum: ['cleanliness', 'security', 'community_participation', 'noise_level', 'general'],
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one rating per household per category
RatingSchema.index({ household: 1, ratedBy: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
