import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["lib/index.ts"],
  format: ["cjs", "esm"],
  target: "es2019",
  dts: true,
  outDir: "dist",
  clean: true,
  minify: false,
});
