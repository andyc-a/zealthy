// Seed is run automatically on every deploy via `npm start` (see package.json).
// This is a workaround for Railway's internal DB host (mysql.railway.internal) not being
// reachable from the Railway shell, so seeding manually isn't possible.
import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, '../data.json'), 'utf-8'));

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  await conn.query(schema);
  console.log('Schema applied.');

  for (const med of data.medications) {
    await conn.query('INSERT IGNORE INTO zealthy_emr.medications (name) VALUES (?)', [med]);
  }
  console.log(`Seeded ${data.medications.length} medications.`);

  for (const dose of data.dosages) {
    await conn.query('INSERT IGNORE INTO zealthy_emr.dosages (value) VALUES (?)', [dose]);
  }
  console.log(`Seeded ${data.dosages.length} dosages.`);

  for (const user of data.users) {
    const hash = await bcrypt.hash(user.password, 10);
    await conn.query(
      'INSERT INTO zealthy_emr.users (id, name, email, password) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email)',
      [user.id, user.name, user.email, hash]
    );

    for (const appt of user.appointments) {
      const dt = new Date(appt.datetime).toISOString().slice(0, 19).replace('T', ' ');
      await conn.query(
        'INSERT INTO zealthy_emr.appointments (id, user_id, provider, datetime, `repeat`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE provider=VALUES(provider), datetime=VALUES(datetime), `repeat`=VALUES(`repeat`)',
        [appt.id, user.id, appt.provider, dt, appt.repeat || 'none']
      );
    }

    for (const rx of user.prescriptions) {
      await conn.query(
        'INSERT INTO zealthy_emr.prescriptions (id, user_id, medication, dosage, quantity, refill_on, refill_schedule) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE medication=VALUES(medication), dosage=VALUES(dosage)',
        [rx.id, user.id, rx.medication, rx.dosage, rx.quantity, rx.refill_on, rx.refill_schedule || 'monthly']
      );
    }

    console.log(`Seeded user: ${user.name}`);
  }

  await conn.end();
  console.log('Seed complete.');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
