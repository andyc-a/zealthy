import express from 'express';
import pool from '../utils/db.js';

const router = express.Router();

// GET /api/patients/:id/prescriptions
router.get('/:id/prescriptions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM prescriptions WHERE user_id = ? ORDER BY refill_on', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patients/:id/prescriptions
router.post('/:id/prescriptions', async (req, res) => {
  const { medication, dosage, quantity, refill_on, refill_schedule } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO prescriptions (user_id, medication, dosage, quantity, refill_on, refill_schedule) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, medication, dosage, quantity || 1, refill_on, refill_schedule || 'monthly']
    );
    res.status(201).json({ id: result.insertId, user_id: parseInt(req.params.id), medication, dosage, quantity, refill_on, refill_schedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/patients/:id/prescriptions/:rxId
router.put('/:id/prescriptions/:rxId', async (req, res) => {
  const { medication, dosage, quantity, refill_on, refill_schedule } = req.body;
  try {
    await pool.query(
      'UPDATE prescriptions SET medication = ?, dosage = ?, quantity = ?, refill_on = ?, refill_schedule = ? WHERE id = ? AND user_id = ?',
      [medication, dosage, quantity, refill_on, refill_schedule, req.params.rxId, req.params.id]
    );
    res.json({ id: parseInt(req.params.rxId), medication, dosage, quantity, refill_on, refill_schedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/patients/:id/prescriptions/:rxId
router.delete('/:id/prescriptions/:rxId', async (req, res) => {
  try {
    await pool.query('DELETE FROM prescriptions WHERE id = ? AND user_id = ?', [req.params.rxId, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
