const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth');

// @route   GET /api/contacts
// @desc    Get all contacts (protected, with pagination)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Contact.countDocuments();

    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: contacts
    });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @route   POST /api/contacts
// @desc    Create new contact (public)
router.post('/', async (req, res) => {
  try {
    // Basic validation
    if (!req.body.name || !req.body.email || !req.body.message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and message are required'
      });
    }

    const contact = await Contact.create({
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      phone: req.body.phone?.trim() || null,
      message: req.body.message.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: contact
    });
  } catch (err) {
    console.error('Error creating contact:', err);
    
    // Handle duplicate key errors (if email is set as unique in schema)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'This email has already submitted a contact form'
      });
    }

    res.status(400).json({
      success: false,
      error: err.message || 'Validation Error'
    });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete a contact (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact ID format'
      });
    }

    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      deletedId: req.params.id
    });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router;