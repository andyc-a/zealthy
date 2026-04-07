import express from 'express';
import * as appointmentsService from '../services/appointments.service.js';

const router = express.Router();

// GET /api/patients/:id/appointments
router.get('/:id/appointments', async (req, res) => {
  try {
    const rows = await appointmentsService.getAppointments(req.params.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patients/:id/appointments
router.post('/:id/appointments', async (req, res) => {
  try {
    const appt = await appointmentsService.createAppointment(req.params.id, req.body);
    res.status(201).json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/patients/:id/appointments/:apptId
router.put('/:id/appointments/:apptId', async (req, res) => {
  try {
    const appt = await appointmentsService.updateAppointment(req.params.id, req.params.apptId, req.body);
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/patients/:id/appointments/:apptId
router.delete('/:id/appointments/:apptId', async (req, res) => {
  try {
    await appointmentsService.deleteAppointment(req.params.id, req.params.apptId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
