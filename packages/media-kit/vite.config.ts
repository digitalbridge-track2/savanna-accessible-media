import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AbugidaMediaKit",
      fileName: (format) => `a11y-media-kit.${format}.js`,
      formats: ["es", "umd"],
    },
    outDir: "dist-bundle",
    sourcemap: true,
  },
});
