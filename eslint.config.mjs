import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// Next 16 removed `next lint`, so ESLint runs directly with Next's
// recommended flat config (React, hooks, accessibility and Core Web Vitals).
export default defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "node_modules/**"]),
]);
