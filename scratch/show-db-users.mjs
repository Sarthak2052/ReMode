import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function show() {
  const users = await prisma.user.findMany({
    include: {
      trips: { select: { id: true, title: true } },
      notifications: true,
    },
  });

  console.log("=== USERS IN POSTGRESQL DATABASE ===");
  for (const u of users) {
    console.log(`\nID: ${u.id}`);
    console.log(`Name: ${u.name}`);
    console.log(`Email: ${u.email}`);
    console.log(`Avoid Night Travel: ${u.avoidNightTravel}`);
    console.log(`Carrier Loyalty: ${JSON.stringify(u.carrierLoyalty)}`);
    console.log(`Priority Weights: ${JSON.stringify(u.priorityWeights)}`);
    console.log(`Trips: ${u.trips.length} trip(s)`);
    for (const t of u.trips) {
      console.log(`  - [${t.id}] ${t.title}`);
    }
    console.log(`Notifications: ${u.notifications.length} notification(s)`);
    for (const n of u.notifications) {
      console.log(`  - [${n.type}] ${n.title}`);
    }
  }
}

show()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
