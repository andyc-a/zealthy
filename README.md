# Zealthy Mini EMR

A mini electronic medical records (EMR) system with a patient portal and admin interface.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite |
| Backend | Express.js + mysql2 + JWT auth (bcryptjs) |
| Database | MySQL |

## Getting Started

### 1. Configure environment

Copy `.env.example` to `.env` and fill in your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=zealthy_emr
JWT_SECRET=your_secret
```

### 2. Start the database

```bash
npm run db:up
```

### 3. Seed the database

```bash
npm run seed
```

### 4. Start development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Login Credentials

| Role | Email | Password |
|---|---|---|
| Patient | mark@some-email-provider.net | Password123! |
| Patient | lisa@some-email-provider.net | Password123! |
| Admin | http://localhost:5173/admin | _(no auth)_ |

## Routes

| Route | Description |
|---|---|
| `/` | Patient login → dashboard, appointments, prescriptions |
| `/admin` | Admin EMR: patient list, detail, full CRUD |

## Project Structure

```
api/
  auth.js          # JWT login endpoint
  me.js            # Patient portal endpoints (/api/me/dashboard, appointments, prescriptions)
  patients.js      # Patient CRUD
  appointments.js  # Appointment CRUD
  prescriptions.js # Prescription CRUD
  meta.js          # /api/medications, /api/dosages
services/
  auth.service.js          # login, getMe, verifyToken
  patients.service.js      # listPatients, getPatient, createPatient, updatePatient
  appointments.service.js  # getAppointments, createAppointment, updateAppointment, deleteAppointment
  prescriptions.service.js # getPrescriptions, createPrescription, updatePrescription, deletePrescription
  me.service.js            # getDashboard, getAppointments, getPrescriptions
  meta.service.js          # getMedications, getDosages
db/
  schema.sql       # Creates all tables
  seed.js          # Runs schema + seeds from data.json
utils/
  db.js            # MySQL connection pool
  recurring.js     # Expands recurring appointments within a date range
src/               # React + TypeScript frontend
```

## Deployment (Railway)

1. Create a MySQL service in Railway and copy the connection variables into your app service as `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
2. Set `NODE_ENV=production` and a secure `JWT_SECRET`
3. Set build command to `npm run build`, start command to `npm start`
4. Run `npm run seed` from the Railway shell after first deploy
