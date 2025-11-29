import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// POST /api/contact - Handle contact form submissions
router.post('/', async (req, res) => {
  console.log('Contact form received:', req.body); // DEBUG LINE
  
  try {
    const { name, email, message } = req.body;
    
    // Insert into database
    const result = await pool.query(
      'INSERT INTO contact_submissions (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );
    
    console.log('Contact saved to database:', result.rows[0]); // DEBUG LINE
    
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
