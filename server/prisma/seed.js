// Idempotent seed: popular destinations + a few SAMPLE drivers.
// Replace the sample drivers with your real, trusted auto drivers before sharing the app.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LOCATIONS = [
  { name: 'Campus Main Gate', isCampus: true },
  { name: 'Bus Stop' },
  { name: 'Railway Station' },
];

const SAMPLE_DRIVERS = [
  { name: 'Ramesh', phone: '9000000001', vehicleNumber: 'AP 00 AA 0001' },
  { name: 'Suresh', phone: '9000000002', vehicleNumber: 'AP 00 AA 0002' },
  { name: 'Mahesh', phone: '9000000003', vehicleNumber: 'AP 00 AA 0003' },
];

async function main() {
  for (const location of LOCATIONS) {
    await prisma.location.upsert({ where: { name: location.name }, create: location, update: {} });
  }
  for (const driver of SAMPLE_DRIVERS) {
    await prisma.driver.upsert({
      where: { phone: driver.phone },
      create: { ...driver, vehicleType: 'AUTO', isVerified: true },
      update: {},
    });
  }
  console.log(`Seeded ${LOCATIONS.length} locations and ${SAMPLE_DRIVERS.length} sample drivers`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
