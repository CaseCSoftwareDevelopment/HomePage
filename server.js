// server.js
console.log('=== DEBUG: Running server.js ===');
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import dotenv from 'dotenv';
import contactRoutes from './routes/contact.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// 🔐 NEW SECURITY IMPORTS
import session from 'express-session';
import { body, validationResult } from 'express-validator';

dotenv.config();

console.log('Environment variables:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME
});

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// 🔐 ENHANCED Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// 🔐 NEW: Global Rate Limiting (added to your existing rate limiting)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// 🔐 APPLY Global Rate Limiting to all routes
app.use(generalLimiter);

// Your existing contact-specific rate limiter (keep this!)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many contact form submissions, please try again later.'
  },
  handler: (req, res) => {
    console.log('🚨 RATE LIMIT TRIGGERED for IP:', req.ip);
    res.status(429).json({
      success: false,
      message: 'Too many contact form submissions, please try again later.'
    });
  }
});

app.use('/api/contact', contactLimiter);

// 🔐 NEW: Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-in-production-' + Date.now(),
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CORS middleware (keep your existing)
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true
}));

// Body parsing middleware (keep your existing)
app.use(express.json({ limit: '1mb' })); // Added size limit

// 🔐 NEW: Input Sanitization Middleware
app.use((req, res, next) => {
  // Sanitize string inputs
  const sanitize = (input) => {
    if (typeof input === 'string') {
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .substring(0, 1000); // Limit length
    }
    return input;
  };

  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitize(req.body[key]);
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitize(req.query[key]);
    });
  }

  next();
});

// PostgreSQL connection setup (keep your existing)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection (keep your existing)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// 🔐 NEW: Authentication Middleware (for future use)
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required' 
    });
  }
  next();
};

// 🔐 NEW: Input Validation for User Creation
const validateUserInput = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// ========== YOUR EXISTING ROUTES - NOW SECURE ==========

// Routes (keep your existing)
app.get('/', (req, res) => {
  res.json({ message: 'Node.js + Express + PostgreSQL API' });
});

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET user by ID - 🔐 ADDED INPUT VALIDATION
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Input validation for ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid user ID' 
      });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new user - 🔐 ADDED INPUT VALIDATION
app.post('/api/users', validateUserInput, async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Contact routes (keep your existing)
app.use('/api/contact', contactRoutes);

// Test rate limit route (keep your existing)
app.get('/api/test-rate-limit', contactLimiter, (req, res) => {
  res.json({ message: 'This route is rate limited' });
});

// 🔐 NEW: Protected route example (for future use)
app.get('/api/protected', requireAuth, (req, res) => {
  res.json({ 
    success: true,
    message: 'Access granted to protected route',
    userId: req.session.userId 
  });
});

// 🔐 NEW: Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server (keep your existing)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

console.log('SendGrid API Key present:', !!process.env.SENDGRID_API_KEY);
console.log('SendGrid API Key starts with SG:', process.env.SENDGRID_API_KEY?.startsWith('SG.'));