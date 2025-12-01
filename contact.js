import express from 'express';
import pool from '../config/database.js';
import sendContactNotification from '../services/emailService.js';

const router = express.Router();

// POST /api/contact - Handle contact form submissions
import { body, validationResult } from 'express-validator';

// POST /api/contact - Handle contact form submissions
router.post('/', [
  // Validation rules
  body('name').notEmpty().trim().escape().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('message').notEmpty().trim().escape().isLength({ min: 10, max: 1000 })
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }

  console.log('Contact form received:', req.body);
  
  try {
    const { name, email, message } = req.body;
    
    // Insert into database
    const result = await pool.query(
      'INSERT INTO contact_submissions (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );
    
    console.log('Contact saved to database:', result.rows[0]);
    
    // Send email notification
    await sendContactNotification({ name, email, message });
    
    res.status(201).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting contact form' 
    });
  }
});
export default router;
