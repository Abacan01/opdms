import dotenv from "dotenv";
import path from "path";
import type { Application } from "express";

// Must run before any other module loads (import statements are hoisted,
// so we use require() for app to ensure env vars are set first)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const app: Application = require("./app").default;

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`OPDMS Backend running on http://localhost:${PORT}`);
});
