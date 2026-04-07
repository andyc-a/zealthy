import express from 'express';
import { authMiddleware } from './auth.js';
import * as meService from '../services/me.service.js';

const router = express.Router();

// GET /api/me/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const data = await meService.getDashboard(req.user.id);
    if (!data) return res.status(404).json({ error: 'User not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/me/appointments
router.get('/appointments', authMiddleware, async (req, res) => {
  try {
    const result = await meService.getAppointments(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/me/prescriptions
router.get('/prescriptions', authMiddleware, async (req, res) => {
  try {
    const rows = await meService.getPrescriptions(req.user.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
