import express from 'express';
import * as prescriptionsService from '../services/prescriptions.service.js';

const router = express.Router();

// GET /api/patients/:id/prescriptions
router.get('/:id/prescriptions', async (req, res) => {
  try {
    const rows = await prescriptionsService.getPrescriptions(req.params.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patients/:id/prescriptions
router.post('/:id/prescriptions', async (req, res) => {
  try {
    const rx = await prescriptionsService.createPrescription(req.params.id, req.body);
    res.status(201).json(rx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/patients/:id/prescriptions/:rxId
router.put('/:id/prescriptions/:rxId', async (req, res) => {
  try {
    const rx = await prescriptionsService.updatePrescription(req.params.id, req.params.rxId, req.body);
    res.json(rx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/patients/:id/prescriptions/:rxId
router.delete('/:id/prescriptions/:rxId', async (req, res) => {
  try {
    await prescriptionsService.deletePrescription(req.params.id, req.params.rxId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
