const Contact = require('../models/Contact');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Public
exports.createContact = asyncHandler(async (req, res, next) => {
  const { name, email, phone, course_completed, course_interested, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return next(new ErrorResponse('Name, email and message are required fields', 400));
  }

  const contact = await Contact.create({
    name,
    email,
    phone,
    course_completed,
    course_interested,
    message
  });

  res.status(201).json({
    success: true,
    data: contact,
    message: 'Message sent successfully!'
  });
});