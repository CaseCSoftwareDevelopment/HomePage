console.log('=== DATABASE.JS LOADED ===');
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: 'website_user',
  host: 'localhost', 
  database: 'CaseCHomepage',
  password: 'castle123', // HARDCODE IT
  port: 5433
});
export default pool;

console.log('Database config:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ? '***' : 'MISSING', // This will show if password is undefined
  port: process.env.DB_PORT
});