import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "src/__tests__/**/*.test.{ts,tsx}"],
    css: { modules: { classNameStrategy: "non-scoped" } },
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:5000/api/v1",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
