// Seed data for the shop. All customers, orders and transactions are sample data.

const STORE = { name: "Linden & Oak", kind: "DTC apparel" };

// Merchant agents. Each one is a ZooWork managed agent (see zoowork.js).
const AGENTS = {
  gatekeeper: { handle: "@gatekeeper", name: "Gatekeeper", line: "Lose less",  job: "Checks every buyer agent at the door. Blocks bad bots.", version: "gatekeeper@7d02b1" },
  concierge:  { handle: "@concierge",  name: "Concierge",  line: "All",        job: "Speaks for the store and routes work to specialists.",  version: "concierge@2b7f10" },
  stylist:    { handle: "@stylist",    name: "Stylist",    line: "Sell more",  job: "Recommends items from stock and fit history.",          version: "stylist@91ce03" },
  promo:      { handle: "@promo",      name: "Promo engine", line: "Sell more", job: "Writes offers inside margin rules. Runs the billboard.", version: "promo@a41c9e" },
  service:    { handle: "@service",    name: "Service",    line: "Run leaner", job: "Order status, sizing, exchanges, phone calls.",         version: "service@5e9a77" },
  returns:    { handle: "@returns",    name: "Risk screener", line: "Lose less", job: "Scores refunds and transactions for fraud.",          version: "returns@c18f40" },
};

const CUSTOMERS = {
  c1: { name: "Priya Raman", tier: "Gold",     ltv: 1840, returnRate: 9,  risk: 12, phone: "+1 (718) 555-0142", order: "LO-56120", city: "Brooklyn" },
  c2: { name: "Marcus Hale", tier: "Standard", ltv: 612,  returnRate: 58, risk: 72, phone: "+1 (312) 555-0187", order: "LO-55790", city: "Chicago" },
  c3: { name: "Dana Kim",    tier: "Silver",   ltv: 930,  returnRate: 14, risk: 8,  phone: "+1 (512) 555-0119", order: "LO-55812", city: "Austin" },
  c4: { name: "Owen Brandt", tier: "Silver",   ltv: 744,  returnRate: 11, risk: 31, phone: "+1 (206) 555-0164", order: "LO-55611", city: "Seattle" },
  c5: { name: "Lena Ortiz",  tier: "Standard", ltv: 402,  returnRate: 33, risk: 64, phone: "+1 (305) 555-0101", order: "LO-55490", city: "Miami" },
  c6: { name: "Aiko Tanaka", tier: "Gold",     ltv: 2210, returnRate: 6,  risk: 4,  phone: "+1 (415) 555-0133", order: "LO-56002", city: "San Francisco" },
  c7: { name: "Sam Okafor",  tier: "Standard", ltv: 288,  returnRate: 20, risk: 18, phone: "+1 (646) 555-0177", order: "LO-55977", city: "New York" },
};

const PRODUCTS = [
  { sku: "LO-COAT-CAMEL",  name: "Camel wool overcoat",      cat: "Coats",    price: 298, cost: 131, stock: 18, sold: 6,  swatch: "#B88A5A" },
  { sku: "LO-FR-SNKR",     name: "Field Runner sneaker (limited)", cat: "Shoes", price: 180, cost: 74, stock: 52, sold: 3, swatch: "#E4E1D8" },
  { sku: "LO-CHELSEA-BLK", name: "Chelsea boot, black",      cat: "Shoes",    price: 214, cost: 88,  stock: 9,  sold: 2,  swatch: "#2B2B2B" },
  { sku: "LO-MERINO-OAT",  name: "Merino crewneck, oat",     cat: "Knitwear", price: 128, cost: 41,  stock: 40, sold: 5,  swatch: "#DCCDB0" },
  { sku: "LO-VEST-OLV",    name: "Quilted vest, olive",      cat: "Outerwear",price: 158, cost: 58,  stock: 4,  sold: 1,  swatch: "#6B7046" },
  { sku: "LO-LINEN-TRS",   name: "Linen wide-leg trouser",   cat: "Trousers", price: 146, cost: 49,  stock: 27, sold: 2,  swatch: "#C9C2B2" },
  { sku: "LO-CASH-SCARF",  name: "Cashmere scarf",           cat: "Accessories", price: 95, cost: 30, stock: 33, sold: 4, swatch: "#8E4B4B" },
  { sku: "LO-WAX-JKT",     name: "Waxed jacket",             cat: "Outerwear",price: 265, cost: 112, stock: 11, sold: 1,  swatch: "#4B4A33" },
];

// Fraud signals and how much each adds to a transaction's risk score.
const FLAGS = {
  no_signature:     { label: "Buyer agent has no platform signature", w: 40 },
  bulk_limited:     { label: "Bulk quantity on a limited item",       w: 30 },
  many_addresses:   { label: "Ships to many addresses",               w: 20 },
  forwarder:        { label: "Ships to a freight forwarder",          w: 15 },
  resale_listing:   { label: "Same item listed on a resale site",     w: 35 },
  repeat_returns:   { label: "3+ returns in 60 days",                 w: 20 },
  promo_abuse:      { label: "Promo code tried 31 times",             w: 20 },
  card_mismatch:    { label: "Card country ≠ shipping country",       w: 25 },
  signed_but_claimed:{ label: "'Not received', but carrier shows signed", w: 30 },
  new_handle:       { label: "Agent handle created < 24h ago",        w: 15 },
};

const TXNS = [
  { id: "TX-9031", sku: "LO-FR-SNKR",     time: "10:37", buyer: "@shopbot-x9",       cust: null, qty: 40, amount: 7200, type: "order",  flags: ["no_signature","bulk_limited","many_addresses","new_handle"], status: "Blocked" },
  { id: "TX-9029", sku: "LO-FR-SNKR",     time: "10:31", buyer: "@fastcart-77",      cust: null, qty: 12, amount: 2160, type: "order",  flags: ["no_signature","bulk_limited"], status: "Blocked" },
  { id: "TX-9024", sku: "LO-FR-SNKR",     time: "10:12", buyer: "@dots/agent-55c1",  cust: "c7", qty: 1,  amount: 180,  type: "order",  flags: [], status: "Paid" },
  { id: "TX-9018", sku: "LO-CHELSEA-BLK", time: "10:22", buyer: "@dots/agent-7f21",  cust: "c2", qty: 1,  amount: 214,  type: "refund", flags: ["resale_listing","repeat_returns","forwarder"], status: "Needs review" },
  { id: "TX-8990", sku: "LO-CHELSEA-BLK", time: "09:20", buyer: "@muse/owen.b",      cust: "c4", qty: 1,  amount: 214,  type: "order",  flags: [], status: "Paid" },
  { id: "TX-9015", sku: "LO-COAT-CAMEL",  time: "10:46", buyer: "@muse/priya.r",     cust: "c1", qty: 1,  amount: 268,  type: "order",  flags: [], status: "Paid" },
  { id: "TX-9002", sku: "LO-COAT-CAMEL",  time: "09:51", buyer: "@dots/agent-a90e",  cust: "c6", qty: 1,  amount: 298,  type: "order",  flags: [], status: "Paid" },
  { id: "TX-8995", sku: "LO-MERINO-OAT",  time: "09:44", buyer: "@dots/agent-31bd",  cust: null, qty: 2,  amount: 256,  type: "order",  flags: ["card_mismatch","promo_abuse"], status: "Held" },
  { id: "TX-8987", sku: "LO-MERINO-OAT",  time: "09:12", buyer: "@muse/aiko.t",      cust: "c6", qty: 1,  amount: 128,  type: "order",  flags: [], status: "Paid" },
  { id: "TX-8979", sku: "LO-VEST-OLV",    time: "09:58", buyer: "@dots/agent-0c4e",  cust: "c5", qty: 1,  amount: 96,   type: "refund", flags: ["signed_but_claimed"], status: "Needs review" },
  { id: "TX-8970", sku: "LO-VEST-OLV",    time: "09:05", buyer: "@dots/agent-02aa",  cust: "c3", qty: 1,  amount: 158,  type: "order",  flags: [], status: "Paid" },
  { id: "TX-8962", sku: "LO-LINEN-TRS",   time: "08:58", buyer: "@muse/priya.r",     cust: "c1", qty: 1,  amount: 146,  type: "order",  flags: [], status: "Paid" },
  { id: "TX-8955", sku: "LO-CASH-SCARF",  time: "08:41", buyer: "@muse/sam.o",       cust: "c7", qty: 1,  amount: 95,   type: "order",  flags: [], status: "Paid" },
  { id: "TX-8951", sku: "LO-WAX-JKT",     time: "08:30", buyer: "@dots/agent-7f21",  cust: "c2", qty: 1,  amount: 265,  type: "order",  flags: ["forwarder"], status: "Paid" },
];

// Revenue by hour today (agent-assisted). The game adds live sales to the current hour.
const HOURLY = [
  { h: "08", v: 486 }, { h: "09", v: 912 }, { h: "10", v: 1214 }, { h: "11", v: 800 },
  { h: "12", v: 0 }, { h: "13", v: 0 }, { h: "14", v: 0 }, { h: "15", v: 0 },
];

// What each kind of visiting buyer agent wants. Used to script the shop floor.
const VISITS = {
  shop: [
    { ask: "Wool coat, size M, under $300?", sku: "LO-COAT-CAMEL", offer: 268 },
    { ask: "Merino sweater in oat, size S?",  sku: "LO-MERINO-OAT", offer: 128 },
    { ask: "A gift scarf under $100?",       sku: "LO-CASH-SCARF", offer: 95 },
    { ask: "Linen trousers, waist 27?",      sku: "LO-LINEN-TRS",  offer: 146 },
    { ask: "Waxed jacket, size L?",          sku: "LO-WAX-JKT",    offer: 249 },
  ],
  bot: [
    "Buy 40 Field Runner, all sizes, 12 addresses.",
    "Reserve every size of the limited drop.",
    "Apply code WELCOME20 × 30 accounts.",
  ],
};

// Opening lines and follow-ups for customer-service tickets.
const TICKET_SCRIPTS = {
  where:  ["Where is order {order}? It was due Oct 1.", "She needs it by Oct 6. Can you make that?", "Okay, please do that."],
  size:   ["Does the camel overcoat run large? She's usually an M.", "Will it fit over a thick sweater?", "Great, thanks."],
  refund: ["I'd like a full refund for {order}. Reason: wrong size.", "Why can't you just refund it?", "Fine, an exchange then."],
  human:  ["Can I speak with a person about {order}?", "It's about a gift that arrived damaged.", "Thanks, that works."],
};

// Lines the caller says on a phone call, by topic.
const CALL_SCRIPTS = {
  where:  ["Hi, my vest was supposed to come Wednesday.", "I fly out Tuesday morning, that's too close.", "Okay, please send the new one."],
  size:   ["Hi, I'm deciding between M and L in the overcoat.", "I like to wear a chunky sweater under it.", "Great, I'll go with M."],
  refund: ["I just want my money back for the boots.", "Why not? They didn't fit.", "Fine, I'll take the exchange."],
};
