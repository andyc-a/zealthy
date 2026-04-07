import express from 'express';
import * as metaService from '../services/meta.service.js';

const router = express.Router();

// GET /api/medications
router.get('/medications', async (_req, res) => {
  try {
    const medications = await metaService.getMedications();
    res.json(medications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dosages
router.get('/dosages', async (_req, res) => {
  try {
    const dosages = await metaService.getDosages();
    res.json(dosages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
