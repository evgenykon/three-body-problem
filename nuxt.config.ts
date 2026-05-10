// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  experimental: {
    appManifest: false,
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint', '@pinia/nuxt'],
  routeRules: {
    // '/**': { ssr: false },
    '/': { ssr: true },
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
