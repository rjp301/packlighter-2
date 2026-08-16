import { defineConfig, envField } from "astro/config";

import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  security: {
    checkOrigin: true,
  },
  integrations: [react()],
  vite: {
    plugins: [
      TanStackRouterVite({
        target: "react",
        autoCodeSplitting: true,
        routesDirectory: "./src/app/routes",
        generatedRouteTree: "./src/app/routeTree.gen.ts",
      }),
    ],
  },
  output: "server",
  adapter: cloudflare(),
});
