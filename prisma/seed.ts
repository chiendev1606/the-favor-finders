import { createClient } from "@libsql/client";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function getClientConfig() {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    return {
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };
  }
  return { url: "file:dev.db" };
}

const config = getClientConfig();
const libsqlClient = createClient(config);
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS "Room" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "code" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'voting',
  "deadline" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "winnerId" INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS "Room_code_key" ON "Room"("code");

CREATE TABLE IF NOT EXISTS "Meal" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "roomId" INTEGER NOT NULL,
  "nameVi" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "image" TEXT,
  "description" TEXT,
  "tags" TEXT,
  "lat" REAL,
  "lng" REAL,
  "voiceNote" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Participant" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "roomId" INTEGER NOT NULL,
  "nickname" TEXT NOT NULL,
  "mood" TEXT,
  "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Vote" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "roomId" INTEGER NOT NULL,
  "participantId" INTEGER NOT NULL,
  "mealId" INTEGER NOT NULL,
  FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE,
  FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE,
  FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Vote_roomId_participantId_key" ON "Vote"("roomId", "participantId");

CREATE TABLE IF NOT EXISTS "ChatMessage" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "roomId" INTEGER NOT NULL,
  "participantId" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE,
  FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Reaction" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "roomId" INTEGER NOT NULL,
  "participantId" INTEGER NOT NULL,
  "emoji" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE,
  FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Veto" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "roomId" INTEGER NOT NULL,
  "participantId" INTEGER NOT NULL,
  "mealId" INTEGER NOT NULL,
  "reason" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE,
  FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE,
  FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Veto_roomId_participantId_key" ON "Veto"("roomId", "participantId");

CREATE TABLE IF NOT EXISTS "MealPhoto" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "roomId" INTEGER NOT NULL,
  "participantId" INTEGER NOT NULL,
  "mealId" INTEGER NOT NULL,
  "url" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE,
  FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE,
  FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "WinHistory" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "mealId" INTEGER NOT NULL,
  "mealName" TEXT NOT NULL,
  "roomCode" TEXT NOT NULL,
  "voteCount" INTEGER NOT NULL,
  "total" INTEGER NOT NULL,
  "wonAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE
);
`;

async function main() {
  // Step 1: Create tables if they don't exist
  console.log("Ensuring database tables exist...");
  const statements = CREATE_TABLES_SQL
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await libsqlClient.execute(stmt);
  }
  console.log("Tables ready.");

  // Step 2: Check if already seeded
  const existingRooms = await prisma.room.count();
  if (existingRooms > 0) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  // Step 3: Seed demo data
  console.log("Seeding database...");
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
