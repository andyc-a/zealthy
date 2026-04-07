import express from 'express';
import pool from '../utils/db.js';

const router = express.Router();

// GET /api/medications
router.get('/medications', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT name FROM medications ORDER BY name');
    res.json(rows.map(r => r.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dosages
router.get('/dosages', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT value FROM dosages ORDER BY CAST(value AS DECIMAL) ASC');
    res.json(rows.map(r => r.value));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
