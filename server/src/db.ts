// SQLite database (Node's built-in node:sqlite). One file, one row set per merchant.
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// On Vercel the only writable disk is /tmp, which is per-instance and temporary (demo mode).
const file = process.env.DB_FILE || (process.env.VERCEL ? "/tmp/tabard/tabard.db" : path.join(import.meta.dirname, "..", "data", "tabard.db"));
fs.mkdirSync(path.dirname(file), { recursive: true });

export const db = new DatabaseSync(file);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS merchants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Retail',
  tagline TEXT,
  owner_name TEXT,
  owner_email TEXT,
  phone TEXT,
  website TEXT,
  city TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  plan TEXT NOT NULL DEFAULT 'Starter',
  discount_cap INTEGER NOT NULL DEFAULT 15,        -- promo discounts above this % need the owner
  refund_review_over INTEGER NOT NULL DEFAULT 150, -- refunds above this amount need the owner
  risk_threshold INTEGER NOT NULL DEFAULT 60,      -- risk scores above this need the owner
  house_offer TEXT NOT NULL DEFAULT '10% off for returning customers',
  simulate INTEGER NOT NULL DEFAULT 1,             -- run simulated buyer agents while the shop is open
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  handle TEXT NOT NULL,
  name TEXT NOT NULL,
  line TEXT NOT NULL,
  job TEXT NOT NULL,
  version TEXT NOT NULL,
  zoowork_agent_id TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  actions INTEGER NOT NULL DEFAULT 0,
  UNIQUE (merchant_id, key)
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'Standard',
  ltv INTEGER NOT NULL DEFAULT 0,
  return_rate INTEGER NOT NULL DEFAULT 0,
  risk INTEGER NOT NULL DEFAULT 0,
  phone TEXT,
  city TEXT,
  last_order TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  cost INTEGER NOT NULL,
  stock INTEGER NOT NULL,
  sold INTEGER NOT NULL DEFAULT 0,
  swatch TEXT NOT NULL DEFAULT '#C9C2B2',
  UNIQUE (merchant_id, sku)
);

-- One room per buyer-agent session (the Band room in the design).
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  platform TEXT NOT NULL,
  kind TEXT NOT NULL,                 -- shop | service | bot
  customer_id INTEGER REFERENCES customers(id),
  intent TEXT,
  state TEXT NOT NULL DEFAULT 'open', -- open | sold | left | blocked | resolved
  opened_at TEXT NOT NULL,
  closed_at TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  role TEXT NOT NULL,                 -- buyer | agent | staff | sys
  text TEXT NOT NULL,
  cites TEXT NOT NULL DEFAULT '[]',
  source TEXT,                        -- zoowork | sim
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  topic TEXT NOT NULL,
  step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'agent', -- agent | staff | resolved
  resolved_by TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  sku TEXT NOT NULL,
  room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  buyer_handle TEXT NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  qty INTEGER NOT NULL DEFAULT 1,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,                 -- order | refund
  flags TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL,               -- Paid | Blocked | Needs review | Held | Released | Refunded | Exchange offered | Denied
  screen TEXT,                        -- last @returns verdict (JSON)
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  topic TEXT NOT NULL,
  status TEXT NOT NULL,               -- ringing | live | ended
  staff INTEGER NOT NULL DEFAULT 0,
  handled_by TEXT,
  lines TEXT NOT NULL DEFAULT '[]',
  started_at TEXT NOT NULL,
  ended_at TEXT
);

CREATE TABLE IF NOT EXISTS approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  order_code TEXT,
  amount INTEGER NOT NULL,
  risk INTEGER NOT NULL,
  recommendation TEXT NOT NULL,
  reasons TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'waiting',
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  decided_at TEXT
);

CREATE TABLE IF NOT EXISTS promos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  sku TEXT NOT NULL,
  product TEXT NOT NULL,
  pct INTEGER NOT NULL,
  price INTEGER NOT NULL,
  list INTEGER NOT NULL,
  margin INTEGER NOT NULL,
  competitor INTEGER,
  segment TEXT NOT NULL,
  ends TEXT NOT NULL,
  lift INTEGER NOT NULL,
  needs_approval INTEGER NOT NULL,
  agent_text TEXT NOT NULL,
  cites TEXT NOT NULL DEFAULT '[]',
  source TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | live | retired
  seen INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  published_at TEXT
);

CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  decision TEXT NOT NULL,
  basis TEXT NOT NULL,
  version TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- The activity feed: everything that happens in a merchant's shop, in order.
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  text TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'info',  -- info | sale | block | service | call | risk | promo | staff
  created_at TEXT NOT NULL
);

-- App-wide settings, e.g. ids of shared ZooWork agents.
CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE INDEX IF NOT EXISTS ix_tx_m ON transactions (merchant_id, created_at);
CREATE INDEX IF NOT EXISTS ix_ev_m ON events (merchant_id, id);
CREATE INDEX IF NOT EXISTS ix_msg_room ON messages (room_id, id);
CREATE INDEX IF NOT EXISTS ix_rooms_m ON rooms (merchant_id, opened_at);
`);

// Columns added after the first release. SQLite has no ADD COLUMN IF NOT EXISTS, so check first.
function addColumn(table: string, col: string, def: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some(c => c.name === col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
}
addColumn("merchants", "description", "TEXT");
addColumn("merchants", "source_url", "TEXT");         // the storefront link the shop was imported from
addColumn("merchants", "source_platform", "TEXT");    // tiktok | amazon | shopify | web
addColumn("merchants", "theme", "TEXT");              // room palette (JSON), designed from the storefront
addColumn("merchants", "import_notes", "TEXT");       // how the import was gathered (JSON: sources, method)
addColumn("products", "image_url", "TEXT");
addColumn("merchants", "billboard_mode", "TEXT NOT NULL DEFAULT 'artwork'"); // artwork | text | off
addColumn("rooms", "band_chat_id", "TEXT");          // the Band chat room this room is mirrored to
addColumn("messages", "band_message_id", "TEXT");
addColumn("messages", "band_status", "TEXT");         // sent | failed | null (Band off)
addColumn("promos", "image_status", "TEXT");          // null | designing | ready | failed
addColumn("promos", "image_path", "TEXT");            // file under data/ads/ (artwork from the ZooWork designer skill)
addColumn("promos", "image_note", "TEXT");            // why the artwork failed, or the agent's note
addColumn("products", "product_url", "TEXT");

type P = SQLInputValue;
export type Row = Record<string, any>;
export const all = <T = Row>(sql: string, ...p: P[]) => db.prepare(sql).all(...p) as T[];
export const get = <T = Row>(sql: string, ...p: P[]) => db.prepare(sql).get(...p) as T | undefined;
export const run = (sql: string, ...p: P[]) => db.prepare(sql).run(...p);
export const insert = (sql: string, ...p: P[]) => Number(db.prepare(sql).run(...p).lastInsertRowid);
export const DATA_DIR = path.dirname(file);
export const iso = (d = new Date()) => d.toISOString();
export const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString(); };
export const parse = <T>(s: string | null | undefined, fallback: T): T => { try { return s ? JSON.parse(s) : fallback; } catch { return fallback; } };

// Runs fn in a transaction. Nested calls join the outer transaction.
let txDepth = 0;
export function tx<T>(fn: () => T): T {
  if (txDepth > 0) return fn();
  db.exec("BEGIN");
  txDepth++;
  try { const r = fn(); db.exec("COMMIT"); return r; } catch (e) { db.exec("ROLLBACK"); throw e; } finally { txDepth--; }
}
