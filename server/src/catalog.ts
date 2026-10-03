// Static reference data shared by the seed, the simulator and the engine.

export const AGENT_DEFAULTS = [
  { key: "gatekeeper", handle: "@gatekeeper", name: "Gatekeeper",    line: "Lose less",  job: "Checks every buyer agent at the door. Blocks bad bots.", version: "gatekeeper@7d02b1" },
  { key: "concierge",  handle: "@concierge",  name: "Concierge",     line: "All",        job: "Speaks for the store and routes work to specialists.",  version: "concierge@2b7f10" },
  { key: "stylist",    handle: "@stylist",    name: "Stylist",       line: "Sell more",  job: "Recommends items from stock and fit history.",          version: "stylist@91ce03" },
  { key: "promo",      handle: "@promo",      name: "Promo engine",  line: "Sell more",  job: "Writes offers inside margin rules. Runs the billboard.", version: "promo@a41c9e" },
  { key: "service",    handle: "@service",    name: "Service",       line: "Run leaner", job: "Order status, sizing, exchanges, phone calls.",         version: "service@5e9a77" },
  { key: "returns",    handle: "@returns",    name: "Risk screener", line: "Lose less",  job: "Scores refunds and transactions for fraud.",            version: "returns@c18f40" },
] as const;
export type AgentKey = (typeof AGENT_DEFAULTS)[number]["key"];

// Fraud signals and how much each adds to a transaction's risk score.
export const FLAGS: Record<string, { label: string; w: number }> = {
  no_signature:       { label: "Buyer agent has no platform signature", w: 40 },
  bulk_limited:       { label: "Bulk quantity on a limited item", w: 30 },
  many_addresses:     { label: "Ships to many addresses", w: 20 },
  forwarder:          { label: "Ships to a freight forwarder", w: 15 },
  resale_listing:     { label: "Same item listed on a resale site", w: 35 },
  repeat_returns:     { label: "3+ returns in 60 days", w: 20 },
  promo_abuse:        { label: "Promo code tried 31 times", w: 20 },
  card_mismatch:      { label: "Card country ≠ shipping country", w: 25 },
  signed_but_claimed: { label: "'Not received', but carrier shows signed", w: 30 },
  new_handle:         { label: "Agent handle created < 24h ago", w: 15 },
};
export const riskOf = (flags: string[]) => Math.min(99, flags.reduce((s, f) => s + (FLAGS[f]?.w || 0), 5));

export const TICKET_SCRIPTS: Record<string, string[]> = {
  where:  ["Where is order {order}? It was due Oct 1.", "She needs it by Oct 6. Can you make that?", "Okay, please do that."],
  size:   ["Does the {item} run large? She's usually an M.", "Will it fit over a thick sweater?", "Great, thanks."],
  refund: ["I'd like a full refund for {order}. Reason: wrong size.", "Why can't you just refund it?", "Fine, an exchange then."],
  human:  ["Can I speak with a person about {order}?", "It's about a gift that arrived damaged.", "Thanks, that works."],
};

export const CALL_SCRIPTS: Record<string, string[]> = {
  where:  ["Hi, my order was supposed to come Wednesday.", "I fly out Tuesday morning, that's too close.", "Okay, please send the new one."],
  size:   ["Hi, I'm deciding between M and L.", "I like to wear a chunky sweater under it.", "Great, I'll go with M."],
  refund: ["I just want my money back for my order.", "Why not? It didn't fit.", "Fine, I'll take the exchange."],
};

export const BOT_ASKS = [
  "Buy 40 of the limited drop, all sizes, 12 addresses.",
  "Reserve every size of the limited drop.",
  "Apply code WELCOME20 × 30 accounts.",
];

export const SAMPLE_STORES = {
  apparel: {
    customers: [
      { name: "Priya Raman", tier: "Gold",     ltv: 1840, return_rate: 9,  risk: 12, phone: "+1 (718) 555-0142", city: "Brooklyn",      last_order: "LO-56120" },
      { name: "Marcus Hale", tier: "Standard", ltv: 612,  return_rate: 58, risk: 72, phone: "+1 (312) 555-0187", city: "Chicago",       last_order: "LO-55790" },
      { name: "Dana Kim",    tier: "Silver",   ltv: 930,  return_rate: 14, risk: 8,  phone: "+1 (512) 555-0119", city: "Austin",        last_order: "LO-55812" },
      { name: "Owen Brandt", tier: "Silver",   ltv: 744,  return_rate: 11, risk: 31, phone: "+1 (206) 555-0164", city: "Seattle",       last_order: "LO-55611" },
      { name: "Lena Ortiz",  tier: "Standard", ltv: 402,  return_rate: 33, risk: 64, phone: "+1 (305) 555-0101", city: "Miami",         last_order: "LO-55490" },
      { name: "Aiko Tanaka", tier: "Gold",     ltv: 2210, return_rate: 6,  risk: 4,  phone: "+1 (415) 555-0133", city: "San Francisco", last_order: "LO-56002" },
      { name: "Sam Okafor",  tier: "Standard", ltv: 288,  return_rate: 20, risk: 18, phone: "+1 (646) 555-0177", city: "New York",      last_order: "LO-55977" },
    ],
    products: [
      { sku: "LO-COAT-CAMEL",  name: "Camel wool overcoat",            category: "Coats",       price: 298, cost: 131, stock: 18, swatch: "#B88A5A", ask: "Wool coat, size M, under $300?", offer: 268 },
      { sku: "LO-FR-SNKR",     name: "Field Runner sneaker (limited)", category: "Shoes",       price: 180, cost: 74,  stock: 52, swatch: "#E4E1D8", ask: "Field Runner in size 9?", offer: 180 },
      { sku: "LO-CHELSEA-BLK", name: "Chelsea boot, black",            category: "Shoes",       price: 214, cost: 88,  stock: 9,  swatch: "#2B2B2B", ask: "Black Chelsea boots, 44?", offer: 214 },
      { sku: "LO-MERINO-OAT",  name: "Merino crewneck, oat",           category: "Knitwear",    price: 128, cost: 41,  stock: 40, swatch: "#DCCDB0", ask: "Merino sweater in oat, size S?", offer: 128 },
      { sku: "LO-VEST-OLV",    name: "Quilted vest, olive",            category: "Outerwear",   price: 158, cost: 58,  stock: 4,  swatch: "#6B7046", ask: "A light vest for travel?", offer: 158 },
      { sku: "LO-LINEN-TRS",   name: "Linen wide-leg trouser",         category: "Trousers",    price: 146, cost: 49,  stock: 27, swatch: "#C9C2B2", ask: "Linen trousers, waist 27?", offer: 146 },
      { sku: "LO-CASH-SCARF",  name: "Cashmere scarf",                 category: "Accessories", price: 95,  cost: 30,  stock: 33, swatch: "#8E4B4B", ask: "A gift scarf under $100?", offer: 95 },
      { sku: "LO-WAX-JKT",     name: "Waxed jacket",                   category: "Outerwear",   price: 265, cost: 112, stock: 11, swatch: "#4B4A33", ask: "Waxed jacket, size L?", offer: 249 },
    ],
  },
  ceramics: {
    customers: [
      { name: "Noor Haddad",  tier: "Gold",     ltv: 1320, return_rate: 4,  risk: 6,  phone: "+1 (503) 555-0110", city: "Portland",    last_order: "KC-20411" },
      { name: "Theo Brooks",  tier: "Standard", ltv: 210,  return_rate: 41, risk: 66, phone: "+1 (702) 555-0148", city: "Las Vegas",   last_order: "KC-20388" },
      { name: "Mia Lindqvist",tier: "Silver",   ltv: 655,  return_rate: 10, risk: 14, phone: "+1 (612) 555-0192", city: "Minneapolis", last_order: "KC-20402" },
      { name: "Ravi Menon",   tier: "Standard", ltv: 180,  return_rate: 12, risk: 20, phone: "+1 (919) 555-0125", city: "Durham",      last_order: "KC-20395" },
    ],
    products: [
      { sku: "KC-MUG-ASH",   name: "Ash-glaze mug",            category: "Mugs",     price: 38,  cost: 11, stock: 64, swatch: "#B9B3A6", ask: "Two mugs as a gift?", offer: 36 },
      { sku: "KC-BOWL-SET",  name: "Stoneware bowl set of 4",  category: "Bowls",    price: 124, cost: 44, stock: 15, swatch: "#7E8C82", ask: "Bowls that are dishwasher safe?", offer: 112 },
      { sku: "KC-VASE-TALL", name: "Tall bud vase (limited)",  category: "Vases",    price: 86,  cost: 25, stock: 22, swatch: "#C47A5A", ask: "A tall vase for dried flowers?", offer: 86 },
      { sku: "KC-PLATE-DIN", name: "Dinner plate, speckled",   category: "Plates",   price: 42,  cost: 13, stock: 48, swatch: "#E3DCCB", ask: "Six speckled dinner plates?", offer: 40 },
      { sku: "KC-TEAPOT",    name: "Celadon teapot",           category: "Tea",      price: 148, cost: 52, stock: 6,  swatch: "#9FB8A4", ask: "A teapot for four cups?", offer: 138 },
    ],
  },
};
export type StoreKind = keyof typeof SAMPLE_STORES;
