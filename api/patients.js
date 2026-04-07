import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../utils/db.js';
import { authMiddleware } from './auth.js';
import { expandRecurring } from '../utils/recurring.js';

const router = express.Router();

// GET /api/patients/me/dashboard — must come before /:id routes
router.get('/me/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [userRows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    if (!userRows.length) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    const [appts] = await pool.query('SELECT * FROM appointments WHERE user_id = ?', [userId]);
    const upcomingAppts = [];
    for (const appt of appts) {
      upcomingAppts.push(...expandRecurring(appt, now, in7Days));
    }
    upcomingAppts.sort((a, b) => new Date(a.occurrence_datetime) - new Date(b.occurrence_datetime));

    const [rxs] = await pool.query(
      'SELECT * FROM prescriptions WHERE user_id = ? AND refill_on BETWEEN ? AND ?',
      [userId, now.toISOString().slice(0, 10), in7Days.toISOString().slice(0, 10)]
    );

    res.json({ user: userRows[0], upcoming_appointments: upcomingAppts, upcoming_refills: rxs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/me/appointments
router.get('/me/appointments', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const in3Months = new Date(now);
    in3Months.setMonth(in3Months.getMonth() + 3);

    const [appts] = await pool.query('SELECT * FROM appointments WHERE user_id = ?', [userId]);
    const result = [];
    for (const appt of appts) {
      const occurrences = expandRecurring(appt, now, in3Months);
      if (occurrences.length) {
        result.push({ ...appt, occurrences: occurrences.map(o => o.occurrence_datetime) });
      }
    }
    result.sort((a, b) => new Date(a.occurrences[0]) - new Date(b.occurrences[0]));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/me/prescriptions
router.get('/me/prescriptions', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM prescriptions WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email,
        COUNT(DISTINCT a.id) AS appointment_count,
        COUNT(DISTINCT p.id) AS prescription_count
      FROM users u
      LEFT JOIN appointments a ON a.user_id = u.id
      LEFT JOIN prescriptions p ON p.user_id = u.id
      GROUP BY u.id
      ORDER BY u.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patients
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
    res.status(201).json({ id: result.insertId, name, email });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Patient not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/patients/:id
router.put('/:id', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, hash, req.params.id]);
    } else {
      await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id]);
    }
    res.json({ id: parseInt(req.params.id), name, email });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

export default router;
