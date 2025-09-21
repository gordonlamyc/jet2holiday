import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/summarize': {
        target: 'https://d6drzs41k4.execute-api.ap-southeast-5.amazonaws.com/prod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/summarize/, '/summarize'),
        secure: true,
      },
      '/api/chatbot': {
        // TODO: Replace with your real API Gateway endpoint for chatbot Lambda
        target: 'https://05zw74pzrk.execute-api.ap-southeast-5.amazonaws.com/dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chatbot/, '/chat'),
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
