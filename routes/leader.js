const express = require('express');
const router = express.Router();
const User = require('../models/User');
const NyumbaKumiZone = require('../models/NyumbaKumiZone');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/leaders
// @desc    Get all Nyumba Kumi leaders
// @access  Public
router.get('/', async (req, res) => {
  try {
    const leaders = await User.find({ role: 'leader' }).select('-password');

    res.status(200).json({
      success: true,
      count: leaders.length,
      data: leaders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaders/:id
// @desc    Get leader by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Validate the ID parameter
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid leader ID provided' });
    }
    
    // Check if it's a valid ObjectId format to prevent casting errors
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid leader ID format' });
    }
    
    const leader = await User.findOne({ 
      _id: req.params.id,
      role: 'leader'
    }).select('-password');

    if (!leader) {
      return res.status(404).json({ message: 'Leader not found' });
    }

    res.status(200).json({
      success: true,
      data: leader
    });
  } catch (err) {
    console.error('Error fetching leader:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaders/:id/zones
// @desc    Get zones managed by a leader
// @access  Public
router.get('/:id/zones', async (req, res) => {
  try {
    // Validate the ID parameter
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid leader ID provided' });
    }
    
    // Check if it's a valid ObjectId format to prevent casting errors
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid leader ID format' });
    }
    
    const zones = await NyumbaKumiZone.find({ leader: req.params.id });

    res.status(200).json({
      success: true,
      count: zones.length,
      data: zones
    });
  } catch (err) {
    console.error('Error fetching zones:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leaders/:id/zones
// @desc    Create a new zone for a leader
// @access  Private (Admin only)
router.post('/:id/zones', protect, authorize('admin'), async (req, res) => {
  try {
    // Validate the ID parameter
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid leader ID provided' });
    }
    
    // Check if it's a valid ObjectId format to prevent casting errors
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid leader ID format' });
    }
    
    // Check if leader exists
    const leader = await User.findOne({ 
      _id: req.params.id,
      role: 'leader'
    });

    if (!leader) {
      return res.status(404).json({ message: 'Leader not found' });
    }

    // Create zone with leader as manager
    req.body.leader = req.params.id;
    const zone = await NyumbaKumiZone.create(req.body);

    res.status(201).json({
      success: true,
      data: zone
    });
  } catch (err) {
    console.error('Error creating zone:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leaders/:id
// @desc    Update leader profile
// @access  Private (Admin or the leader themselves)
router.put('/:id', protect, async (req, res) => {
  try {
    // Validate the ID parameter
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid leader ID provided' });
    }
    
    // Check if it's a valid ObjectId format to prevent casting errors
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid leader ID format' });
    }
    
    let leader = await User.findOne({ 
      _id: req.params.id,
      role: 'leader'
    });

    if (!leader) {
      return res.status(404).json({ message: 'Leader not found' });
    }

    // Make sure user is the leader or an admin
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Remove password field if it's in the request body
    if (req.body.password) {
      delete req.body.password;
    }

    // Don't allow role change through this endpoint
    if (req.body.role) {
      delete req.body.role;
    }

    leader = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      data: leader
    });
  } catch (err) {
    console.error('Error updating leader profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
