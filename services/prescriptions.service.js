import pool from '../utils/db.js';

export async function getPrescriptions(userId) {
  const [rows] = await pool.query('SELECT * FROM prescriptions WHERE user_id = ? ORDER BY refill_on', [userId]);
  return rows;
}

export async function createPrescription(userId, { medication, dosage, quantity, refill_on, refill_schedule }) {
  const [result] = await pool.query(
    'INSERT INTO prescriptions (user_id, medication, dosage, quantity, refill_on, refill_schedule) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, medication, dosage, quantity || 1, refill_on, refill_schedule || 'monthly']
  );
  return { id: result.insertId, user_id: parseInt(userId), medication, dosage, quantity, refill_on, refill_schedule };
}

export async function updatePrescription(userId, rxId, { medication, dosage, quantity, refill_on, refill_schedule }) {
  await pool.query(
    'UPDATE prescriptions SET medication = ?, dosage = ?, quantity = ?, refill_on = ?, refill_schedule = ? WHERE id = ? AND user_id = ?',
    [medication, dosage, quantity, refill_on, refill_schedule, rxId, userId]
  );
  return { id: parseInt(rxId), medication, dosage, quantity, refill_on, refill_schedule };
}

export async function deletePrescription(userId, rxId) {
  await pool.query('DELETE FROM prescriptions WHERE id = ? AND user_id = ?', [rxId, userId]);
}
