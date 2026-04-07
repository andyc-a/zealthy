import pool from '../utils/db.js';
import { expandRecurring } from '../utils/recurring.js';

export async function getDashboard(userId) {
  const [userRows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
  if (!userRows.length) return null;

  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);

  const [appts] = await pool.query('SELECT * FROM appointments WHERE user_id = ?', [userId]);
  const upcomingAppts = [];
  for (const appt of appts) {
    upcomingAppts.push(...expandRecurring(appt, now, in7Days));
  }
  upcomingAppts.sort((a, b) => new Date(a.occurrence_datetime) - new Date(b.occurrence_datetime));

  const [rxs] = await pool.query(
    'SELECT * FROM prescriptions WHERE user_id = ? AND refill_on BETWEEN ? AND ?',
    [userId, now.toISOString().slice(0, 10), in7Days.toISOString().slice(0, 10)]
  );

  return { user: userRows[0], upcoming_appointments: upcomingAppts, upcoming_refills: rxs };
}

export async function getAppointments(userId) {
  const now = new Date();
  const in3Months = new Date(now);
  in3Months.setMonth(in3Months.getMonth() + 3);

  const [appts] = await pool.query('SELECT * FROM appointments WHERE user_id = ?', [userId]);
  const result = [];
  for (const appt of appts) {
    const occurrences = expandRecurring(appt, now, in3Months);
    if (occurrences.length) {
      result.push({ ...appt, occurrences: occurrences.map(o => o.occurrence_datetime) });
    }
  }
  result.sort((a, b) => new Date(a.occurrences[0]) - new Date(b.occurrences[0]));
  return result;
}

export async function getPrescriptions(userId) {
  const [rows] = await pool.query('SELECT * FROM prescriptions WHERE user_id = ?', [userId]);
  return rows;
}
