// تنظیمات اصلی Nuxt
// - راست‌چین بودن سایت (RTL) از طریق app.head اعمال می‌شود
// - ماژول تیلویند و پینیا فعال شده
// - متغیرهای Supabase از runtimeConfig خوانده می‌شوند (از فایل .env)
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: {
        lang: 'fa',
        dir: 'rtl',
        class: 'dark'
      },
      title: 'فروشگاه آنلاین',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'فروشگاه اینترنتی با بهترین قیمت و تنوع محصولات' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  }
})
