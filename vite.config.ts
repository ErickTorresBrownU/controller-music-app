import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import commonjs from "@rollup/plugin-commonjs"; // Add Rollup's CommonJS plugin
import * as dotenv from 'dotenv'

// @ts-expect-error process is a Node.js global
const host = process.env.TAURI_DEV_HOST;

dotenv.config();

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        nodePolyfills({
            globals: {
                process: true,
                Buffer: true,
                global: true, // Ensure global is polyfilled
            }
        }),
        commonjs(), // Add CommonJS support
    ],
    define: {
        global: "globalThis", // Map global to globalThis
        "process.env.NODE_PATH": JSON.stringify(process.env.NODE_PATH),
    },
    clearScreen: false,
    server: {
        port: 1420,
        strictPort: true,
        host: host || false,
        hmr: host
            ? {
                protocol: "ws",
                host,
                port: 1421,
            }
            : undefined,
        watch: {
            ignored: ["**/src-tauri/**"],
        },
    },
    resolve: {
        alias: {
            // Add any additional polyfills or overrides here if necessary
        },
    },
    optimizeDeps: {
        include: ["@magenta/music"], // Ensure this is pre-bundled
    },
});
