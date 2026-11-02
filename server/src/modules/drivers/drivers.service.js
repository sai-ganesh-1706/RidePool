import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

const BUSY_WINDOW_MS = 30 * 60 * 1000;
const UNRATED_DEFAULT_SCORE = 3.5; // so new drivers still get a fair chance

const DRIVER_FIELDS = {
  id: true,
  name: true,
  phone: true,
  vehicleNumber: true,
  vehicleType: true,
  avgRating: true,
  ratingCount: true,
  totalRides: true,
  isVerified: true,
};

const canSeeUnverified = (driver, viewer) =>
  viewer.role === 'ADMIN' || driver.addedById === viewer.id;

export async function listDrivers(viewer, { search }) {
  const isAdmin = viewer.role === 'ADMIN';
  return prisma.driver.findMany({
    where: {
      isActive: true,
      ...(viewer.role !== 'ADMIN' && { OR: [{ isVerified: true }, { addedById: viewer.id }] }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    },
    select: isAdmin ? { ...DRIVER_FIELDS, addedBy: { select: { name: true } } } : DRIVER_FIELDS,
    orderBy: [{ avgRating: 'desc' }, { name: 'asc' }],
  });
}

export async function getDriver(id, viewer) {
  const driver = await prisma.driver.findFirst({
    where: { id, isActive: true },
    select: {
      ...DRIVER_FIELDS,
      addedById: true,
      ratings: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, rating: true, review: true, createdAt: true, user: { select: { name: true } } },
      },
    },
  });
  if (!driver || (!driver.isVerified && !canSeeUnverified(driver, viewer))) {
    throw ApiError.notFound('Driver not found');
  }

  const { addedById, ratings, ...rest } = driver;
  return {
    ...rest,
    ratings: ratings.map(({ user, ...rating }) => ({ ...rating, userName: user.name })),
  };
}

export async function createDriver(viewer, input) {
  return prisma.driver.create({
    data: { ...input, addedById: viewer.id, isVerified: viewer.role === 'ADMIN' },
    select: DRIVER_FIELDS,
  });
}

export async function verifyDriver(id) {
  return prisma.driver.update({ where: { id }, data: { isVerified: true }, select: DRIVER_FIELDS });
}

/** Soft-deletes a driver (keeps ride history intact). */
export async function rejectDriver(id) {
  return prisma.driver.update({
    where: { id },
    data: { isActive: false, isVerified: false },
    select: DRIVER_FIELDS,
  });
}

export async function rateDriver(userId, driverId, { rating, review }) {
  const completedRide = await prisma.ride.findFirst({
    where: {
      driverId,
      status: 'COMPLETED',
      members: { some: { userId, status: 'JOINED' } },
    },
    orderBy: { departureTime: 'desc' },
    select: { id: true },
  });
  if (!completedRide) {
    throw ApiError.forbidden('You can rate a driver only after completing a ride with them');
  }

  return prisma.$transaction(async (tx) => {
    await tx.driverRating.upsert({
      where: { driverId_userId: { driverId, userId } },
      create: { driverId, userId, rideId: completedRide.id, rating, review },
      update: { rideId: completedRide.id, rating, review },
    });

    const { _avg, _count } = await tx.driverRating.aggregate({
      where: { driverId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return tx.driver.update({
      where: { id: driverId },
      data: { avgRating: Number((_avg.rating ?? 0).toFixed(2)), ratingCount: _count.rating },
      select: DRIVER_FIELDS,
    });
  });
}

/**
 * Picks the best verified driver for a ride departing at `departureTime`.
 * Prefers drivers who are not already booked within ±30 min, then higher rating,
 * then fewer completed rides (spreads work across drivers).
 */
export async function pickAvailableDriver(departureTime, db = prisma) {
  const t = departureTime.getTime();

  const [candidates, busyRides] = await Promise.all([
    db.driver.findMany({
      where: { isActive: true, isVerified: true },
      select: { id: true, avgRating: true, ratingCount: true, totalRides: true },
    }),
    db.ride.findMany({
      where: {
        status: 'MATCHED',
        driverId: { not: null },
        departureTime: { gte: new Date(t - BUSY_WINDOW_MS), lte: new Date(t + BUSY_WINDOW_MS) },
      },
      select: { driverId: true },
    }),
  ]);

  const busy = new Set(busyRides.map((ride) => ride.driverId));
  const score = (driver) => (driver.ratingCount > 0 ? driver.avgRating : UNRATED_DEFAULT_SCORE);
  const ranked = [...candidates].sort(
    (a, b) => Number(busy.has(a.id)) - Number(busy.has(b.id)) || score(b) - score(a) || a.totalRides - b.totalRides,
  );

  return ranked[0] ?? null;
}
