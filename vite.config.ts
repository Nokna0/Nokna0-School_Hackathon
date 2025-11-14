// vite.config.ts
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// jsxLocPlugin 제거
const plugins = [
  react(),
  tailwindcss(),
  vitePluginManusRuntime(),
  nodePolyfills({
    // Enable polyfills for specific globals and modules
    include: ['buffer'],
    globals: {
      Buffer: true,
    },
  }),
];

export default defineConfig({
  // 개발 루트: client/
  root: path.resolve(import.meta.dirname, "client"),

  // 정적 자산 루트
  publicDir: path.resolve(import.meta.dirname, "client", "public"),

  // 출력 폴더 (프로젝트 루트 기준 dist/public)
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Netlify 배포 최적화
    sourcemap: false, // 프로덕션에서 소스맵 비활성화
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-hook-form'],
          // UI 라이브러리를 별도 청크로 분리
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select'],
          // 차트 라이브러리를 별도 청크로 분리
          'chart-vendor': ['recharts', 'plotly.js'],
        },
      },
    },
  },

  plugins,

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  envDir: path.resolve(import.meta.dirname),

  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: { strict: true, deny: ["**/.*"] },
  },
});
