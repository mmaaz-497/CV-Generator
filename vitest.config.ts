import { defineConfig } from "vitest/config";

// Minimal by design (plan R10): pure-logic tests only, scoped to src/lib.
export default defineConfig({
  test: {
    include: ["src/lib/**/*.test.ts"],
    environment: "node",
  },
});
