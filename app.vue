<template>
  <!-- ریشه اصلی اپلیکیشن: لایوت انتخابی هر صفحه را دور صفحه قرار می‌دهد -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useAuthStore } from '~/stores/auth'

const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const { init: initDarkMode } = useDarkMode()

onMounted(() => {
  cartStore.init()
  wishlistStore.init()
  initDarkMode()
  // بارگذاری کاربر و نقش او در همه صفحات، تا Navbar بتواند لینک‌های متناسب با نقش را نمایش دهد
  authStore.fetchUser()
})
</script>
