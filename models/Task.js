const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide task details'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['cleanliness', 'security', 'community_participation', 'maintenance', 'other'],
    default: 'other'
  },
  completedAt: {
    type: Date
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: [300, 'Feedback cannot be more than 300 characters']
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

// Update the updatedAt timestamp before saving
TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// When task is completed, set completedAt date
TaskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
