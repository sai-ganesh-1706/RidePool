import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { pickAvailableDriver } from '../drivers/drivers.service.js';
import { RIDE_INCLUDE, serializeRide } from './rides.serializer.js';

const ACTIVE_STATUSES = ['OPEN', 'MATCHED'];
const MATCH_WINDOW_MS = 30 * 60 * 1000;
const DEPARTED_GRACE_MS = 15 * 60 * 1000;
const MIN_RIDERS_FOR_MATCH = 2;
const MAX_RIDES_CREATED_PER_DAY = 5;
const TX_OPTIONS = { isolationLevel: 'Serializable', maxWait: 10_000, timeout: 20_000 };

// ---------- helpers ----------

async function fetchRide(id, db = prisma) {
  const ride = await db.ride.findUnique({ where: { id }, include: RIDE_INCLUDE });
  if (!ride) throw ApiError.notFound('Ride not found');
  return ride;
}

const assertCreator = (ride, userId) => {
  if (ride.creatorId !== userId) throw ApiError.forbidden('Only the ride creator can do this');
};

const assertActive = (ride) => {
  if (!ACTIVE_STATUSES.includes(ride.status)) throw ApiError.conflict('This ride is no longer active');
};

const assertNotDeparted = (ride) => {
  if (ride.departureTime.getTime() < Date.now() - DEPARTED_GRACE_MS) {
    throw ApiError.conflict('This ride has already departed');
  }
};

/**
 * Keeps ride status and driver in sync with the number of riders:
 *  - 2+ riders  -> MATCHED, and a driver is auto-assigned if there is none
 *  - <2 riders  -> back to OPEN, driver cleared
 */
async function syncMatchState(db, ride, riderCount) {
  if (riderCount >= MIN_RIDERS_FOR_MATCH && ride.status === 'OPEN') {
    const driver = ride.driverId ? null : await pickAvailableDriver(ride.departureTime, db);
    await db.ride.update({
      where: { id: ride.id },
      data: { status: 'MATCHED', ...(driver && { driverId: driver.id }) },
    });
  } else if (riderCount < MIN_RIDERS_FOR_MATCH && ride.status === 'MATCHED') {
    await db.ride.update({ where: { id: ride.id }, data: { status: 'OPEN', driverId: null } });
  }
}

// ---------- queries ----------

export async function getRide(id, viewerId) {
  return serializeRide(await fetchRide(id), viewerId);
}

export async function listRides(viewerId, { toLocationId }) {
  const rides = await prisma.ride.findMany({
    where: {
      status: { in: ACTIVE_STATUSES },
      departureTime: { gte: new Date(Date.now() - DEPARTED_GRACE_MS) },
      ...(toLocationId && { toLocationId }),
    },
    include: RIDE_INCLUDE,
    orderBy: { departureTime: 'asc' },
    take: 50,
  });
  return rides.map((ride) => serializeRide(ride, viewerId));
}

export async function listMyRides(viewerId) {
  const rides = await prisma.ride.findMany({
    where: { members: { some: { userId: viewerId, status: 'JOINED' } } },
    include: RIDE_INCLUDE,
    orderBy: { departureTime: 'desc' },
    take: 100,
  });
  return rides.map((ride) => serializeRide(ride, viewerId));
}

/** Auto-match: open rides on the same route within ±30 minutes that still have seats. */
export async function findSimilarRides(viewerId, { fromLocationId, toLocationId, departureTime }) {
  const t = departureTime.getTime();
  const rides = await prisma.ride.findMany({
    where: {
      status: { in: ACTIVE_STATUSES },
      fromLocationId,
      toLocationId,
      departureTime: {
        gte: new Date(Math.max(t - MATCH_WINDOW_MS, Date.now())),
        lte: new Date(t + MATCH_WINDOW_MS),
      },
      members: { none: { userId: viewerId, status: 'JOINED' } },
    },
    include: RIDE_INCLUDE,
    orderBy: { departureTime: 'asc' },
  });
  return rides.map((ride) => serializeRide(ride, viewerId)).filter((ride) => ride.seatsLeft > 0);
}

// ---------- commands ----------

export async function createRide(userId, input) {
  const { fromLocationId, toLocationId, departureTime, maxRiders, notes } = input;

  if (fromLocationId === toLocationId) throw ApiError.badRequest('Pickup and destination must differ');
  if (departureTime.getTime() < Date.now() - 60_000) {
    throw ApiError.badRequest('Departure time must be in the future');
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const createdToday = await prisma.ride.count({
    where: { creatorId: userId, createdAt: { gte: startOfDay } },
  });
  if (createdToday >= MAX_RIDES_CREATED_PER_DAY) {
    throw ApiError.tooMany(`You can post at most ${MAX_RIDES_CREATED_PER_DAY} rides per day`);
  }

  const ride = await prisma.ride.create({
    data: {
      creatorId: userId,
      fromLocationId,
      toLocationId,
      departureTime,
      maxRiders,
      notes,
      members: { create: { userId } },
    },
    include: RIDE_INCLUDE,
  });
  return serializeRide(ride, userId);
}

export async function joinRide(rideId, userId) {
  await prisma.$transaction(async (tx) => {
    const ride = await fetchRide(rideId, tx);
    assertActive(ride);
    assertNotDeparted(ride);

    if (ride.members.some((member) => member.userId === userId)) {
      throw ApiError.conflict('You have already joined this ride');
    }
    if (ride.members.length >= ride.maxRiders) throw ApiError.conflict('This ride is full');

    await tx.rideMember.upsert({
      where: { rideId_userId: { rideId, userId } },
      create: { rideId, userId },
      update: { status: 'JOINED', joinedAt: new Date(), fareShare: null, paymentStatus: 'PENDING' },
    });
    await syncMatchState(tx, ride, ride.members.length + 1);
  }, TX_OPTIONS);

  return getRide(rideId, userId);
}

export async function leaveRide(rideId, userId) {
  await prisma.$transaction(async (tx) => {
    const ride = await fetchRide(rideId, tx);
    assertActive(ride);

    if (ride.creatorId === userId) {
      throw ApiError.badRequest('You created this ride — cancel it instead of leaving');
    }
    if (!ride.members.some((member) => member.userId === userId)) {
      throw ApiError.badRequest('You are not part of this ride');
    }

    await tx.rideMember.update({
      where: { rideId_userId: { rideId, userId } },
      data: { status: 'LEFT' },
    });
    await syncMatchState(tx, ride, ride.members.length - 1);
  }, TX_OPTIONS);

  return getRide(rideId, userId);
}

export async function cancelRide(rideId, userId) {
  const ride = await fetchRide(rideId);
  assertCreator(ride, userId);
  assertActive(ride);
  await prisma.ride.update({ where: { id: rideId }, data: { status: 'CANCELLED' } });
  return getRide(rideId, userId);
}

export async function setRideDriver(rideId, userId, driverId) {
  const ride = await fetchRide(rideId);
  assertCreator(ride, userId);
  assertActive(ride);

  const driver = await prisma.driver.findFirst({
    where: { id: driverId, isActive: true, isVerified: true },
    select: { id: true },
  });
  if (!driver) throw ApiError.badRequest('Choose a verified driver');

  await prisma.ride.update({ where: { id: rideId }, data: { driverId } });
  return getRide(rideId, userId);
}

export async function completeRide(rideId, userId, totalFare) {
  await prisma.$transaction(async (tx) => {
    const ride = await fetchRide(rideId, tx);
    assertCreator(ride, userId);
    assertActive(ride);

    const fareShare = Math.ceil(totalFare / ride.members.length);

    await tx.rideMember.updateMany({
      where: { rideId, status: 'JOINED' },
      data: { fareShare, paymentStatus: 'PENDING' },
    });
    // The creator paid the driver, so their own share is settled by definition.
    await tx.rideMember.update({
      where: { rideId_userId: { rideId, userId } },
      data: { paymentStatus: 'PAID' },
    });
    await tx.ride.update({ where: { id: rideId }, data: { status: 'COMPLETED', totalFare } });
    if (ride.driverId) {
      await tx.driver.update({ where: { id: ride.driverId }, data: { totalRides: { increment: 1 } } });
    }
  }, TX_OPTIONS);

  return getRide(rideId, userId);
}

export async function setPaymentStatus(rideId, actingUserId, targetUserId, status) {
  const ride = await fetchRide(rideId);
  assertCreator(ride, actingUserId);
  if (ride.status !== 'COMPLETED') throw ApiError.conflict('Payments can be tracked after the ride is completed');

  const { count } = await prisma.rideMember.updateMany({
    where: { rideId, userId: targetUserId, status: 'JOINED' },
    data: { paymentStatus: status },
  });
  if (count === 0) throw ApiError.notFound('Rider not found in this ride');
  return getRide(rideId, actingUserId);
}
