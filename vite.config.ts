import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: { output: { manualChunks: { charts: ["recharts"] } } },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:18080",
        changeOrigin: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.host) proxyReq.setHeader("host", req.headers.host);
          });
        },
      },
    },
  },
  preview: { proxy: { "/api": "http://127.0.0.1:18080" } },
});
