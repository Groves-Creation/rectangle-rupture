import { createDatabase } from "./client.js";
import { requireDatabaseUrl } from "./env.js";
import { isSeeded, seedDatabase, SEED_PASSWORD } from "./seed-data.js";

const db = createDatabase(requireDatabaseUrl(), { max: 1 });

if (await isSeeded(db)) {
  console.error(
    "Database already contains data. Run `pnpm db:reset && pnpm db:migrate` before seeding.\n" +
      "(The inventory ledger is append-only, so seeding cannot simply truncate it.)",
  );
  process.exit(1);
}

console.log("Seeding...");
await seedDatabase(db);

console.log("Seed complete. Ledger and balance cache agree (0 drift rows).");
console.log(`\nAccounts (password: ${SEED_PASSWORD}):`);
console.log("  manager@lit.test   store_manager, both stores");
console.log("  hq@lit.test        hq_admin, can approve");
console.log("  manager2@lit.test  store_manager, STR-002 only");

process.exit(0);
