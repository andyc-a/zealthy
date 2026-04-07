import express from 'express';
import pool from '../utils/db.js';
import { authMiddleware } from './auth.js';
import { expandRecurring } from '../utils/recurring.js';

const router = express.Router();

// GET /api/me/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
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

// GET /api/me/appointments
router.get('/appointments', authMiddleware, async (req, res) => {
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

// GET /api/me/prescriptions
router.get('/prescriptions', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM prescriptions WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
