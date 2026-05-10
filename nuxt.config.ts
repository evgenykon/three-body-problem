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
    '/**': { ssr: false },
    '/': { ssr: true },
    '/oferta': { ssr: true },
    '/privacy-policy': { ssr: true },
    '/consent': { ssr: true },
    '/api/**': {},
    // CSR only - admin живёт под basic auth nginx, SSR-fetch ходит мимо nginx
    // прямо на api контейнер и не получает auth header -> 403 от requireAdmin.
    '/admin/**': { ssr: false },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#FFFEEB' },
        // OpenGraph / Twitter defaults. Per-page useSeoMeta overrides title/description/og:image
        // when нужна страничная картинка; всё остальное наследуется отсюда.
        { property: 'og:site_name', content: 'Мия360' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'ru_RU' },
        { property: 'og:image', content: 'https://mia360.ru/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Мия360 - подготовка по математике для 7-8 класса с AI-ассистентом' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://mia360.ru/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
      script: process.env.NUXT_PUBLIC_YM_COUNTER_ID
        ? [
            {
              hid: 'yandex-metrika',
              children: `
                (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
              `,
              type: 'text/javascript',
            },
          ]
        : [],
      noscript: process.env.NUXT_PUBLIC_YM_COUNTER_ID
        ? [
            {
              hid: 'yandex-metrika-noscript',
              children: `<div><img src="https://mc.yandex.ru/watch/${process.env.NUXT_PUBLIC_YM_COUNTER_ID}" style="position:absolute; left:-9999px;" alt="" /></div>`,
            },
          ]
        : [],
    },
  },
  runtimeConfig: {
    public: {
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:8080',
      ymCounterId: process.env.NUXT_PUBLIC_YM_COUNTER_ID || '',
      // Used to build absolute URLs for canonical / og:url - SEO requires
      // them to be absolute, поэтому per-host через env вместо location.origin
      // (на SSR location недоступен).
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'https://mia360.ru',
      // STUB-режим оплат: backend сразу выдаёт trial без redirect'a в YooKassa,
      // фронт не редиректит и открывает SuccessModal с access-link.
      paymentsStub: process.env.PAYMENTS_STUB === 'true',
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
