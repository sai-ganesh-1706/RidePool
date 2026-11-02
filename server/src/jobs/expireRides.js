import { prisma } from '../config/prisma.js';

const INTERVAL_MS = 5 * 60 * 1000;
const EXPIRE_AFTER_MS = 60 * 60 * 1000;

/** Cancels OPEN rides that nobody joined and whose departure time is long gone. */
export function startRideExpiryJob() {
  const run = async () => {
    try {
      const { count } = await prisma.ride.updateMany({
        where: { status: 'OPEN', departureTime: { lt: new Date(Date.now() - EXPIRE_AFTER_MS) } },
        data: { status: 'CANCELLED' },
      });
      if (count > 0) console.log(`Expired ${count} stale ride(s)`);
    } catch (err) {
      console.error('Ride expiry job failed:', err.message);
    }
  };

  run();
  return setInterval(run, INTERVAL_MS).unref();
}
