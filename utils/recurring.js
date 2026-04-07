/**
 * Expand a recurring appointment into individual occurrences within [fromDate, toDate].
 */
export function expandRecurring(appt, fromDate, toDate) {
  const base = new Date(appt.datetime);
  const end = appt.ended_at ? new Date(appt.ended_at) : toDate;
  const effectiveEnd = end < toDate ? end : toDate;
  const occurrences = [];

  if (appt.repeat === 'none' || !appt.repeat) {
    if (base >= fromDate && base <= effectiveEnd) {
      occurrences.push({ ...appt, occurrence_datetime: base.toISOString() });
    }
    return occurrences;
  }

  let current = new Date(base);

  while (current < fromDate) {
    current = advance(current, appt.repeat);
  }

  while (current <= effectiveEnd) {
    occurrences.push({ ...appt, occurrence_datetime: current.toISOString() });
    current = advance(current, appt.repeat);
  }

  return occurrences;
}

function advance(date, repeat) {
  const d = new Date(date);
  if (repeat === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else if (repeat === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}
