import express from 'express';
import pool from '../utils/db.js';

const router = express.Router();

// GET /api/patients/:id/appointments
router.get('/:id/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments WHERE user_id = ? ORDER BY datetime', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patients/:id/appointments
router.post('/:id/appointments', async (req, res) => {
  const { provider, datetime, repeat } = req.body;
  try {
    const dt = new Date(datetime).toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await pool.query(
      'INSERT INTO appointments (user_id, provider, datetime, `repeat`) VALUES (?, ?, ?, ?)',
      [req.params.id, provider, dt, repeat || 'none']
    );
    res.status(201).json({ id: result.insertId, user_id: parseInt(req.params.id), provider, datetime: dt, repeat: repeat || 'none', ended_at: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/patients/:id/appointments/:apptId
router.put('/:id/appointments/:apptId', async (req, res) => {
  const { provider, datetime, repeat, ended_at } = req.body;
  try {
    const dt = datetime ? new Date(datetime).toISOString().slice(0, 19).replace('T', ' ') : null;
    const endDt = ended_at ? new Date(ended_at).toISOString().slice(0, 19).replace('T', ' ') : null;
    await pool.query(
      'UPDATE appointments SET provider = ?, datetime = ?, `repeat` = ?, ended_at = ? WHERE id = ? AND user_id = ?',
      [provider, dt, repeat || 'none', endDt, req.params.apptId, req.params.id]
    );
    res.json({ id: parseInt(req.params.apptId), provider, datetime: dt, repeat, ended_at: endDt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/patients/:id/appointments/:apptId
router.delete('/:id/appointments/:apptId', async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id = ? AND user_id = ?', [req.params.apptId, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
