<template>
  <!-- لایوت پیش‌فرض سایت: نوار بالا + محتوا + فوتر -->
  <div class="flex min-h-screen flex-col">
    <Navbar />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import Navbar from '~/components/layout/Navbar.vue'
import Footer from '~/components/layout/Footer.vue'
import { useAnalyticsStore } from '~/stores/analytics'

const route = useRoute()
const analyticsStore = useAnalyticsStore()

// ثبت بازدید هر صفحه برای گزارش «بازدید کلی سایت» در داشبورد
// صفحات محصول را اینجا ثبت نمی‌کنیم چون خودشان همراه با product_id ثبت می‌کنند (برای گزارش پربازدیدترین‌ها)
watch(
  () => route.fullPath,
  (path) => {
    if (import.meta.client && !path.startsWith('/products/')) {
      analyticsStore.logPageView(path)
    }
  },
  { immediate: true }
)
</script>
