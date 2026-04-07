Backend (server.js + api/ + utils/):

MySQL via mysql2 with connection pool
db/schema.sql — creates users, appointments, prescriptions, medications, dosages tables
db/seed.js — runs schema + seeds from data.json (bcrypt-hashed passwords, idempotent)
api/auth.js — JWT login/me endpoints
api/patients.js — patient CRUD
api/appointments.js / api/prescriptions.js — full CRUD
api/me.js — patient portal endpoints (/api/me/dashboard, /api/me/appointments, /api/me/prescriptions)
api/meta.js — /api/medications, /api/dosages
utils/recurring.js — expands recurring appointments (weekly/monthly) within a date range
Frontend (src/ — React + TypeScript + Tailwind):

Patient Portal (/) — Login → Dashboard → Appointments / Prescriptions
Admin EMR (/admin) — patient table, patient detail, all CRUD forms
Teal/emerald color scheme, clean card-based UI
To run:

1. Configure database credentials in .env:

DB_HOST=localhost
DB_PASSWORD=your_mysql_password 2. Seed the database:

npm run seed 3. Start development (backend + frontend):

npm run dev
Frontend: http://localhost:5173
Backend API: http://localhost:3001
Login credentials (from data.json):

mark@some-email-provider.net / Password123!
lisa@some-email-provider.net / Password123!
Admin: http://localhost:5173/admin (no auth)

Quick start:

# 1. Set your MySQL password in .env

# DB_PASSWORD=your_password

# 2. Seed the database

npm run seed

# 3. Run dev (backend on :3001, frontend on :5173)

npm run dev
What was built:

Layer Stack
Frontend React 18 + TypeScript + Tailwind CSS + Vite
Backend Express.js + mysql2 + JWT auth (bcryptjs)
Database MySQL with schema auto-created by seed script
Routes:

/ — Patient login → dashboard, appointments, prescriptions
/admin — Admin EMR: patient list, detail, full CRUD for patients/appointments/prescriptions
