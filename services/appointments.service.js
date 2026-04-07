import pool from '../utils/db.js';

export async function getAppointments(userId) {
  const [rows] = await pool.query('SELECT * FROM appointments WHERE user_id = ? ORDER BY datetime', [userId]);
  return rows;
}

export async function createAppointment(userId, { provider, datetime, repeat }) {
  const dt = new Date(datetime).toISOString().slice(0, 19).replace('T', ' ');
  const [result] = await pool.query(
    'INSERT INTO appointments (user_id, provider, datetime, `repeat`) VALUES (?, ?, ?, ?)',
    [userId, provider, dt, repeat || 'none']
  );
  return { id: result.insertId, user_id: parseInt(userId), provider, datetime: dt, repeat: repeat || 'none', ended_at: null };
}

export async function updateAppointment(userId, apptId, { provider, datetime, repeat, ended_at }) {
  const dt = datetime ? new Date(datetime).toISOString().slice(0, 19).replace('T', ' ') : null;
  const endDt = ended_at ? new Date(ended_at).toISOString().slice(0, 19).replace('T', ' ') : null;
  await pool.query(
    'UPDATE appointments SET provider = ?, datetime = ?, `repeat` = ?, ended_at = ? WHERE id = ? AND user_id = ?',
    [provider, dt, repeat || 'none', endDt, apptId, userId]
  );
  return { id: parseInt(apptId), provider, datetime: dt, repeat, ended_at: endDt };
}

export async function deleteAppointment(userId, apptId) {
  await pool.query('DELETE FROM appointments WHERE id = ? AND user_id = ?', [apptId, userId]);
}
