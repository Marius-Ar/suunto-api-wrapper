import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

const include = ["src/**/*.test.ts"];

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include,
        },
      },
      {
        test: {
          name: "browser",
          include,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
