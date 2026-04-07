import bcrypt from 'bcryptjs';
import pool from '../utils/db.js';

export async function listPatients() {
  const [rows] = await pool.query(`
    SELECT u.id, u.name, u.email,
      COUNT(DISTINCT a.id) AS appointment_count,
      COUNT(DISTINCT p.id) AS prescription_count
    FROM users u
    LEFT JOIN appointments a ON a.user_id = u.id
    LEFT JOIN prescriptions p ON p.user_id = u.id
    GROUP BY u.id
    ORDER BY u.name
  `);
  return rows;
}

export async function getPatient(id) {
  const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function createPatient({ name, email, password }) {
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
  return { id: result.insertId, name, email };
}

export async function updatePatient(id, { name, email, password }) {
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, hash, id]);
  } else {
    await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  }
  return { id: parseInt(id), name, email };
}
