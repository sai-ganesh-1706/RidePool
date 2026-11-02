const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const formatTime = (value) =>
  new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

export function formatDay(value) {
  const date = new Date(value);
  const diff = Math.round((startOfDay(date) - startOfDay(new Date())) / DAY_MS);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export const formatDateTime = (value) => `${formatDay(value)}, ${formatTime(value)}`;

export const formatRupees = (amount) => `₹${amount}`;

export const initialOf = (name = '') => name.trim().charAt(0).toUpperCase() || '?';

/** Label + colour tone for a ride's status badge. */
export function rideStatusMeta(ride) {
  switch (ride.status) {
    case 'MATCHED':
      return ride.seatsLeft === 0 ? { label: 'Full · Matched', tone: 'success' } : { label: 'Matched', tone: 'success' };
    case 'OPEN':
      return ride.seatsLeft === 0 ? { label: 'Full', tone: 'warning' } : { label: 'Open', tone: 'primary' };
    case 'COMPLETED':
      return { label: 'Completed', tone: 'muted' };
    case 'CANCELLED':
      return { label: 'Cancelled', tone: 'danger' };
    default:
      return { label: ride.status, tone: 'muted' };
  }
}

/** Next 5-minute mark at least `minutesAhead` minutes from now. */
export function defaultDepartureTime(minutesAhead = 30) {
  const d = new Date(Date.now() + minutesAhead * 60 * 1000);
  d.setSeconds(0, 0);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  return d;
}
