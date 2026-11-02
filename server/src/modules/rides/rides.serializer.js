/** Prisma `include` used for every ride query so the serializer always has what it needs. */
export const RIDE_INCLUDE = {
  fromLocation: true,
  toLocation: true,
  creator: { select: { id: true, name: true, hostelBlock: true } },
  driver: {
    select: {
      id: true,
      name: true,
      phone: true,
      vehicleNumber: true,
      vehicleType: true,
      avgRating: true,
      ratingCount: true,
    },
  },
  members: {
    where: { status: 'JOINED' },
    orderBy: { joinedAt: 'asc' },
    include: { user: { select: { id: true, name: true, hostelBlock: true } } },
  },
};

export function serializeRide(ride, viewerId) {
  const isMember = ride.members.some((member) => member.userId === viewerId);

  return {
    id: ride.id,
    status: ride.status,
    departureTime: ride.departureTime,
    maxRiders: ride.maxRiders,
    seatsLeft: Math.max(ride.maxRiders - ride.members.length, 0),
    notes: ride.notes,
    totalFare: ride.totalFare,
    from: ride.fromLocation,
    to: ride.toLocation,
    creator: ride.creator,
    isCreator: ride.creatorId === viewerId,
    isMember,
    members: ride.members.map((member) => ({
      userId: member.userId,
      name: member.user.name,
      hostelBlock: member.user.hostelBlock,
      isCreator: member.userId === ride.creatorId,
      fareShare: member.fareShare,
      paymentStatus: member.paymentStatus,
    })),
    // The driver's name and phone number are only revealed to riders of this ride.
    driverAssigned: Boolean(ride.driverId),
    driver: isMember ? ride.driver : null,
  };
}
