import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createHash } from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@orderlink.local" },
    update: {},
    create: {
      email: "admin@orderlink.local",
      name: "Admin",
      passwordHash: hashPassword("admin123"),
    },
  });
  console.log("Seeded admin:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
