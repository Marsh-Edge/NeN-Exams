import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as schema from "../lib/db/schema";
import { eq } from "drizzle-orm";

const sqlite = new Database("./data/nen-exams.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

const SUPERUSER = {
  username: "admin",
  email: "admin@nen.exams",
  displayName: "Super Admin",
  password: "Super@123",
  role: "superuser" as const,
};

async function main() {
  console.log("Creating superuser account...\n");

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, SUPERUSER.email))
    .limit(1);

  if (existing[0]) {
    console.log(`Superuser already exists (${SUPERUSER.email}). Skipping.`);
    return;
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(SUPERUSER.password, 12);

  await db.insert(schema.users).values({
    id,
    username: SUPERUSER.username,
    email: SUPERUSER.email,
    displayName: SUPERUSER.displayName,
    passwordHash,
    role: SUPERUSER.role,
  });

  console.log("Superuser created successfully!\n");
  console.log("Credentials:");
  console.log(`  Email:    ${SUPERUSER.email}`);
  console.log(`  Password: ${SUPERUSER.password}`);
  console.log(`  Role:     ${SUPERUSER.role}`);
  console.log("\nIMPORTANT: Change the password after first login!");
}

main().catch((err) => {
  console.error("Failed to create superuser:", err);
  process.exit(1);
});
