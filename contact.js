import pool from '../config/database.js';

// Use in your route like this:
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO contact_submissions (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );
    // ... send email
  } catch (error) {
    // handle error
  }
});
