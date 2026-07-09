import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  const isBuild = command === "build";
  const nodeEnv =
    process.env.NODE_ENV || (isBuild ? "production" : "development");

  return {
    plugins: [reactRouter()],
    root: ".",
    publicDir: "public",
    server: {
      port: 3005,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(nodeEnv),
      "import.meta.env.VITE_FRONTEND_URL": JSON.stringify(
        process.env.FRONTEND_URL || "http://localhost:3005",
      ),
      "import.meta.env.VITE_DEVELOPMENT_MODE": JSON.stringify(
        process.env.DEVELOPMENT_MODE ||
          (nodeEnv !== "production" ? "true" : "false"),
      ),
      "import.meta.env.VITE_DEBUG": JSON.stringify(
        process.env.VITE_DEBUG || process.env.DEBUG || "false",
      ),
    },
  };
});
