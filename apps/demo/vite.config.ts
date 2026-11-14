import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        lesson: resolve(__dirname, "lesson.html"),
        studio: resolve(__dirname, "studio.html"),
        verify: resolve(__dirname, "verify.html"),
        standalone: resolve(__dirname, "standalone-embed.html"),
      },
    },
  },
});
