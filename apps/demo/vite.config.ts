import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        lesson: resolve(__dirname, "lesson.html"),
        studio: resolve(__dirname, "studio.html"),
        verify: resolve(__dirname, "verify.html")
      }
    }
  }
});
