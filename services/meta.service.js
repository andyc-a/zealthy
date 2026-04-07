import pool from '../utils/db.js';

export async function getMedications() {
  const [rows] = await pool.query('SELECT name FROM medications ORDER BY name');
  return rows.map(r => r.name);
}

export async function getDosages() {
  const [rows] = await pool.query('SELECT value FROM dosages ORDER BY CAST(value AS DECIMAL) ASC');
  return rows.map(r => r.value);
}
