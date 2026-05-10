// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  experimental: {
    appManifest: false,
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint', '@pinia/nuxt'],
  // Landing is the only route that benefits from SSR (SEO, meaningful first
  // paint for logged-out visitors). Every other page is gated by session and
  // uses browser-only APIs (fingerprint, socket.io, KaTeX), so SSR would
  // produce a flash-of-unauthenticated content and extra hydration churn —
  // keep them SPA-rendered.
  routeRules: {
    // '/**': { ssr: false },
    '/': { ssr: true },
    // '/api/**': {},
    // CSR only - admin живёт под basic auth nginx, SSR-fetch ходит мимо nginx
    // прямо на api контейнер и не получает auth header -> 403 от requireAdmin.
    // '/admin/**': { ssr: false },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
      ],
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
    },
  },
  vite: {
    server: {
      hmr: {
        host: 'localhost',
        clientPort: 8080,
        protocol: 'ws',
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/fonts"; @use "~/assets/scss/variables" as *;',
        },
      },
    },
    optimizeDeps: {
      include: ['axios', 'socket.io-client', '@fingerprintjs/fingerprintjs', 'lucide-vue-next', 'katex', 'vue-konva'],
    },
  },
});
