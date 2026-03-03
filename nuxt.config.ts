export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  future: { compatibilityVersion: 4 },

  ssr: false,

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/mdc',
  ],

  css: ['~/assets/css/main.css'],

  nitro: {
    experimental: { tasks: true },
  },

  runtimeConfig: {
    databasePath: '',
    public: {
      appName: 'Coder UI',
    },
  },

  devtools: { enabled: true },
})
