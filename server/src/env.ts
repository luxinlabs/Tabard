// Load server/.env (ignored by git) before any other module reads process.env.
import fs from "node:fs";
import path from "node:path";

const file = path.join(import.meta.dirname, "..", ".env");
if (fs.existsSync(file)) process.loadEnvFile(file);
