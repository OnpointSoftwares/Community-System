const express = require('express');
const router = express.Router();
const NyumbaKumiZone = require('../models/NyumbaKumiZone');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/nyumbakumi/zones/public
// @desc    Get all zones (public access)
// @access  Public
router.get('/zones/public', async (req, res) => {
  try {
    const zones = await NyumbaKumiZone.find().populate('leader', 'name');

    res.status(200).json({
      success: true,
      count: zones.length,
      data: zones
    });
  } catch (err) {
    console.error('Error fetching public zones:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/nyumbakumi/zones
// @desc    Get all zones
// @access  Private
router.get('/zones', protect, async (req, res) => {
  try {
    let query;

    // If user is admin, get all zones
    if (req.user.role === 'admin') {
      query = NyumbaKumiZone.find().populate('leader', 'name email phoneNumber');
    } 
    // If user is leader, only get their zones
    else if (req.user.role === 'leader') {
      query = NyumbaKumiZone.find({ leader: req.user.id }).populate('leader', 'name email phoneNumber');
    } else {
      // For household members, find zones they belong to through their household
      return res.status(403).json({ message: 'Not authorized to view zones' });
    }

    const zones = await query;

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

// @route   GET /api/nyumbakumi/zones/:id
// @desc    Get zone by ID
// @access  Private
router.get('/zones/:id', protect, async (req, res) => {
  try {
    // Validate the ID parameter
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid zone ID provided' });
    }
    
    // Check if it's a valid ObjectId format to prevent casting errors
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid zone ID format' });
    }

    const zone = await NyumbaKumiZone.findById(req.params.id)
      .populate('leader', 'name email phoneNumber')
      .populate('households');

    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Check user permissions to view this zone
    if (req.user.role !== 'admin' && 
        (req.user.role === 'leader' && zone.leader.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this zone' });
    }

    res.status(200).json({
      success: true,
      data: zone
    });
  } catch (err) {
    console.error('Error fetching zone:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/nyumbakumi/zones
// @desc    Create a new zone
// @access  Private (Admin only)
router.post('/zones', protect, authorize('admin'), async (req, res) => {
  try {
    // Check if leader exists if provided
    if (req.body.leader) {
      const leader = await User.findOne({ 
        _id: req.body.leader,
        role: 'leader'
      });

      if (!leader) {
        return res.status(404).json({ message: 'Leader not found' });
      }
    }

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

// @route   PUT /api/nyumbakumi/zones/:id
// @desc    Update zone
// @access  Private (Admin only)
router.put('/zones/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Validate the ID parameter
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid zone ID provided' });
    }
    
    // Check if it's a valid ObjectId format to prevent casting errors
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid zone ID format' });
    }

    // Check if leader exists if provided
    if (req.body.leader) {
      const leader = await User.findOne({ 
        _id: req.body.leader,
        role: 'leader'
      });

      if (!leader) {
        return res.status(404).json({ message: 'Leader not found' });
      }
    }

    let zone = await NyumbaKumiZone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    zone = await NyumbaKumiZone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('leader', 'name email phoneNumber');

    res.status(200).json({
      success: true,
      data: zone
    });
  } catch (err) {
    console.error('Error updating zone:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/nyumbakumi/zones/:id
// @desc    Delete zone
// @access  Private (Admin only)
router.delete('/zones/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Validate the ID parameter
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid zone ID provided' });
    }
    
    // Check if it's a valid ObjectId format to prevent casting errors
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid zone ID format' });
    }

    const zone = await NyumbaKumiZone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Check if zone has households
    if (zone.households && zone.households.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete zone with households. Please reassign or delete households first.' 
      });
    }

    await zone.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting zone:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
