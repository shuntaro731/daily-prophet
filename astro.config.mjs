// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

const prototypeRoot = fileURLToPath(new URL("./prototype.src/", import.meta.url));

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  vite: {
    resolve: {
      alias: {
        "@prototype": prototypeRoot,
      },
    },
  },
});
