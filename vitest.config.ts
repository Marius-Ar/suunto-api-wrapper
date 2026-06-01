import { defineConfig } from "vitest/config";

// Default (Node) test run — the fast unit suite over src/.
// Browser smoke tests live in *.browser.test.ts and run via
// vitest.browser.config.ts instead.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["**/*.browser.test.ts", "node_modules/**"],
  },
});
