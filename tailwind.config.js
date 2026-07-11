/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // حالت دارک بر اساس کلاس "dark" روی تگ html
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        // پالت اصلی فروشگاه: سبز زمردی گرم (نه آبی/کرم پیش‌فرض) برای حس یک فروشگاه هویت‌دار
        brand: {
          50: '#eefbf5',
          100: '#d6f5e6',
          200: '#aeebce',
          300: '#78dcae',
          400: '#42c58c',
          500: '#20a870',
          600: '#15875a',
          700: '#136b49',
          800: '#12553c',
          900: '#0f4633'
        },
        accent: {
          DEFAULT: '#e8734a', // نارنجی گرم برای تاکیدهای غیر تخفیفی (مثل قیمت)
          dark: '#c85a35'
        }
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'sans-serif']
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
}
