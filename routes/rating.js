const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Household = require('../models/Household');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/ratings
// @desc    Get all ratings (with filters)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query;

    // Get ratings based on role
    if (req.user.role === 'household') {
      // Household users can only see ratings for their own household
      const household = await Household.findOne({_id: req.user.household});
      if (!household) {
        return res.status(404).json({ message: 'Household not found for this user' });
      }
      query = Rating.find({ household: household._id });
    } else if (req.user.role === 'leader') {
      // Leaders can see ratings they created or for households in their zones
      // This query might need to be adjusted based on your data structure
      query = Rating.find({ ratedBy: req.user.id });
    } else {
      // Admins can see all ratings
      query = Rating.find();
    }

    // Add filtering
    if (req.query.household) {
      query = query.find({ household: req.query.household });
    }

    if (req.query.category) {
      query = query.find({ category: req.query.category });
    }

    if (req.query.rating) {
      query = query.find({ rating: req.query.rating });
    }

    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Rating.countDocuments(query);

    query = query.skip(startIndex).limit(limit)
                 .populate('household', 'address houseNumber')
                 .populate('ratedBy', 'name')
                 .sort({ createdAt: -1 });

    // Execute query
    const ratings = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: ratings.length,
      pagination,
      data: ratings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ratings/:id
// @desc    Get single rating
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id)
                               .populate('household', 'address houseNumber')
                               .populate('ratedBy', 'name');

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check permissions based on role
    if (req.user.role === 'household') {
      const household = await Household.findOne({ user: req.user.id });
      if (!household || household._id.toString() !== rating.household.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this rating' });
      }
    }

    res.status(200).json({
      success: true,
      data: rating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ratings
// @desc    Create a new rating
// @access  Private (Leaders only)
router.post('/', protect, authorize('leader', 'admin'), async (req, res) => {
  try {
    // Add user as rater
    req.body.ratedBy = req.user.id;

    // Check if the household exists
    const household = await Household.findById(req.body.household);
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }

    // Check if leader is authorized to rate this household (in their zone)
    if (req.user.role === 'leader') {
      // This check would depend on your data structure
      // You might need to get the leader's zones and check if household is in one of them
    }

    // Create rating
    const rating = await Rating.create(req.body);

    // Calculate average rating for the household
    const allRatings = await Rating.find({ household: req.body.household });
    const average = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length;
    
    // Update household average rating
    await Household.findByIdAndUpdate(req.body.household, {
      averageRating: average
    });

    res.status(201).json({
      success: true,
      data: rating
    });
  } catch (err) {
    // Handle duplicate rating error
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'You have already rated this household in this category. Please update your existing rating instead.' 
      });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/ratings/:id
// @desc    Update rating
// @access  Private (Leader who created it or Admin)
router.put('/:id', protect, authorize('leader', 'admin'), async (req, res) => {
  try {
    let rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user is authorized to update this rating
    if (req.user.role === 'leader' && rating.ratedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this rating' });
    }

    // Don't allow changing the household or rater
    if (req.body.household) delete req.body.household;
    if (req.body.ratedBy) delete req.body.ratedBy;

    // Update updatedAt date
    req.body.updatedAt = Date.now();

    rating = await Rating.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Recalculate average rating for the household
    const allRatings = await Rating.find({ household: rating.household });
    const average = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length;
    
    // Update household average rating
    await Household.findByIdAndUpdate(rating.household, {
      averageRating: average
    });

    res.status(200).json({
      success: true,
      data: rating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/ratings/:id
// @desc    Delete rating
// @access  Private (Leader who created it or Admin)
router.delete('/:id', protect, authorize('leader', 'admin'), async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user is authorized to delete this rating
    if (req.user.role === 'leader' && rating.ratedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this rating' });
    }

    // Store household ID for recalculation
    const householdId = rating.household;

    // Delete rating
    await rating.remove();

    // Recalculate average rating for the household
    const allRatings = await Rating.find({ household: householdId });
    
    if (allRatings.length > 0) {
      const average = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length;
      
      // Update household average rating
      await Household.findByIdAndUpdate(householdId, {
        averageRating: average
      });
    } else {
      // No ratings left, reset to 0
      await Household.findByIdAndUpdate(householdId, {
        averageRating: 0
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
