import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'zealthy-secret';

export async function login(email, password) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (!rows.length) return null;

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

export async function getMe(userId) {
  const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
  return rows[0] || null;
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
