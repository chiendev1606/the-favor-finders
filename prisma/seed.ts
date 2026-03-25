import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createAdapter() {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    return new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return new PrismaLibSql({ url: "file:dev.db" });
}

const prisma = new PrismaClient({ adapter: createAdapter() });

async function main() {
  // Check if already seeded
  const existingRooms = await prisma.room.count();
  if (existingRooms > 0) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  console.log("Seeding database...");

  // Create a demo room with default meals
  const room = await prisma.room.create({
    data: {
      code: "DEMO01",
      status: "voting",
      meals: {
        create: [
          {
            nameVi: "Bún cá",
            nameEn: "Fish noodle soup",
            image: "/meals/bun-ca.jpg",
            description: "A hearty Hanoi-style soup with crispy fried fish, fresh dill, tomatoes, and soft rice vermicelli in a rich turmeric-spiced broth.",
            tags: "seafood,soup,light",
            lat: 21.0285,
            lng: 105.8468,
          },
          {
            nameVi: "Bún chả",
            nameEn: "Grilled pork with noodles",
            image: "/meals/bun-cha.jpg",
            description: "Smoky charcoal-grilled pork patties and sliced pork belly served with cool rice noodles, fresh herbs, and a sweet-sour dipping sauce.",
            tags: "meat,grilled,classic",
            lat: 21.0340,
            lng: 105.8500,
          },
          {
            nameVi: "Phở",
            nameEn: "Pho noodle soup",
            image: "/meals/pho.jpg",
            description: "Vietnam's iconic soup — silky rice noodles in a slow-simmered beef or chicken broth infused with star anise, cinnamon, and ginger.",
            tags: "soup,classic,meat",
            lat: 21.0278,
            lng: 105.8520,
          },
          {
            nameVi: "Bánh cuốn",
            nameEn: "Steamed rice rolls",
            image: "/meals/banh-cuon.jpg",
            description: "Delicate steamed rice crepes filled with seasoned ground pork and wood ear mushrooms.",
            tags: "light,classic,steamed",
            lat: 21.0310,
            lng: 105.8490,
          },
          {
            nameVi: "Bún đậu",
            nameEn: "Noodles with tofu",
            image: "/meals/bun-dau.jpg",
            description: "Golden crispy fried tofu paired with rice vermicelli, fresh herbs, and shrimp paste dipping sauce.",
            tags: "vegetarian,spicy,budget",
            lat: 21.0250,
            lng: 105.8550,
          },
        ],
      },
    },
  });

  console.log(`Seeded demo room: ${room.code} (id: ${room.id})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Seed error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
