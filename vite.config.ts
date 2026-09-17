import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Tailwind v4 is a Vite plugin, so the theme entry is compiled with the
  // bundle rather than by a separate CLI step (docs/development.md#daily-workflow).
  clearScreen: false,

  // `tauri dev` points the window at a fixed port and fails if it is taken,
  // which is what makes a stale dev server visible instead of silently used.
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },

  test: {
    // M0 has no test file yet; the lane exists so `pnpm test` is the same
    // command before and after the first one lands (docs/testing.md).
    passWithNoTests: true,
  },
});
