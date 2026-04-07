import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRouter from './api/auth.js';
import patientsRouter from './api/patients.js';
import prescriptionsRouter from './api/prescriptions.js';
import appointmentsRouter from './api/appointments.js';
import metaRouter from './api/meta.js';
import meRouter from './api/me.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRouter);
app.use('/api', metaRouter);
app.use('/api/me', meRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/patients', prescriptionsRouter);
app.use('/api/patients', appointmentsRouter);

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
