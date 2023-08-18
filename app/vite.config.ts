/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, type PluginOption } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
	build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return "vendor";
                    }
                }
            }
        }
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./setupTests.ts"],
        globals: true,
    },
	plugins: [
        react(), 
        svgrPlugin(), 
        viteTsconfigPaths(), 
        visualizer() as PluginOption
    ],
    server: {
        open: true,
        port: 3000,
    },
    preview: {
        open: true,
        port: 3000,
    }
});
