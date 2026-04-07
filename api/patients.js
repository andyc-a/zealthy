import express from 'express';
import { authMiddleware } from './auth.js';
import * as patientsService from '../services/patients.service.js';
import * as meService from '../services/me.service.js';

const router = express.Router();

// GET /api/patients/me/dashboard — must come before /:id routes
router.get('/me/dashboard', authMiddleware, async (req, res) => {
  try {
    const data = await meService.getDashboard(req.user.id);
    if (!data) return res.status(404).json({ error: 'User not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/me/appointments
router.get('/me/appointments', authMiddleware, async (req, res) => {
  try {
    const result = await meService.getAppointments(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/me/prescriptions
router.get('/me/prescriptions', authMiddleware, async (req, res) => {
  try {
    const rows = await meService.getPrescriptions(req.user.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients
router.get('/', async (_req, res) => {
  try {
    const rows = await patientsService.listPatients();
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
    const patient = await patientsService.createPatient({ name, email, password });
    res.status(201).json(patient);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/:id
router.get('/:id', async (req, res) => {
  try {
    const patient = await patientsService.getPatient(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/patients/:id
router.put('/:id', async (req, res) => {
  try {
    const patient = await patientsService.updatePatient(req.params.id, req.body);
    res.json(patient);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

export default router;
