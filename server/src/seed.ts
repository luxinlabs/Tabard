// Seeds two sample merchants. `npm run seed` wipes the database first; the server calls seedIfEmpty() on boot.
import { db, get } from "./db.ts";
import { createMerchant } from "./merchants.ts";

export function seedIfEmpty() {
  if (get("SELECT 1 FROM merchants LIMIT 1")) return false;
  createMerchant({
    name: "Linden & Oak", category: "DTC apparel", tagline: "Natural-fibre clothing, made to last",
    owner_name: "Alex Rivera", owner_email: "owner@lindenandoak.example", phone: "+1 (718) 555-0100",
    website: "lindenandoak.example", city: "Brooklyn, NY", plan: "Growth", sample: "apparel",
  });
  createMerchant({
    name: "Kiln & Co", category: "Handmade ceramics", tagline: "Small-batch stoneware from Portland",
    owner_name: "Jules Park", owner_email: "hello@kilnandco.example", phone: "+1 (503) 555-0199",
    website: "kilnandco.example", city: "Portland, OR", plan: "Starter", discount_cap: 20, refund_review_over: 100, sample: "ceramics",
  });
  return true;
}

if (process.argv.includes("--reset")) {
  db.exec("PRAGMA foreign_keys = OFF;");
  for (const t of ["events", "decisions", "promos", "approvals", "calls", "transactions", "tickets", "messages", "rooms", "products", "customers", "agents", "merchants"]) db.exec(`DELETE FROM ${t}; DELETE FROM sqlite_sequence WHERE name = '${t}';`);
  db.exec("PRAGMA foreign_keys = ON;");
  seedIfEmpty();
  console.log("Database reset and seeded with 2 merchants.");
}
