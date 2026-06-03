import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      include: ["src/server/evaluator/**"],
      thresholds: { lines: 80 },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
})
