import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Expose environment variables to the client
  // Variables prefixed with VITE_ are automatically exposed
  envPrefix: 'VITE_',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          // State management and data fetching
          'query-vendor': ['@tanstack/react-query'],
          // Form libraries
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Icons
          'icons-vendor': ['react-icons', 'lucide-react'],
          // Chart libraries
          'chart-vendor': ['recharts'],
          // PDF and image processing
          'pdf-vendor': ['jspdf', 'html2canvas'],
          // Utilities
          'utils-vendor': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'date-fns',
            'next-themes',
            'sonner',
            'react-helmet-async',
          ],
          // Other large dependencies
          'other-vendor': [
            'cmdk',
            'embla-carousel-react',
            'input-otp',
            'react-day-picker',
            'react-resizable-panels',
            'vaul',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for better visibility
  },
}));
