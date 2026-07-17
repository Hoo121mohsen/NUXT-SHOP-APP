<template>
  <!-- نوار بالای سایت (Navbar) - ریسپانسیو با منوی همبرگری در موبایل -->
  <header class="glass sticky top-0 z-40 shadow-sm shadow-black/[0.03]">
    <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
      <!-- دکمه همبرگری موبایل -->
      <button class="text-2xl md:hidden" @click="mobileOpen = !mobileOpen" aria-label="منو">
        ☰
      </button>

      <NuxtLink to="/" class="text-xl font-bold text-brand-600 dark:text-brand-400">فروشگاه من</NuxtLink>

      <nav class="hidden gap-6 md:flex">
        <NuxtLink to="/" class="text-sm text-stone-600 hover:text-brand-600 dark:text-stone-300">خانه</NuxtLink>
        <NuxtLink to="/track-order" class="text-sm text-stone-600 hover:text-brand-600 dark:text-stone-300">پیگیری سفارش</NuxtLink>
        <NuxtLink v-if="authStore.user" to="/my-orders" class="text-sm text-stone-600 hover:text-brand-600 dark:text-stone-300">سفارش‌های من</NuxtLink>
        <NuxtLink v-if="authStore.isAdmin" to="/dashboard" class="text-sm text-stone-600 hover:text-brand-600 dark:text-stone-300">داشبورد</NuxtLink>
        <NuxtLink v-if="authStore.isSalesManager" to="/sales-dashboard" class="text-sm text-stone-600 hover:text-brand-600 dark:text-stone-300">داشبورد فروش</NuxtLink>
        <NuxtLink v-if="authStore.isSupplier" to="/supplier-dashboard" class="text-sm text-stone-600 hover:text-brand-600 dark:text-stone-300">داشبورد تامین‌کننده</NuxtLink>
      </nav>

      <!-- جستجو (دسکتاپ) -->
      <form class="mx-4 hidden flex-1 md:flex" @submit.prevent="handleSearch">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="جستجوی محصول..."
          class="w-full rounded-full border border-stone-300 bg-stone-50 px-4 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-700 dark:bg-stone-800"
        />
      </form>

      <div class="mr-auto flex items-center gap-3">
        <DarkModeToggle />

        <NuxtLink to="/cart" class="relative">
          <span class="text-xl">🛒</span>
          <span
            v-if="cartStore.totalCount"
            class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white"
          >
            {{ cartStore.totalCount }}
          </span>
        </NuxtLink>

        <NotificationBell v-if="authStore.user" class="hidden md:block" />

        <NuxtLink v-if="authStore.user" to="/profile" class="hidden text-xl text-stone-600 hover:text-brand-600 md:inline dark:text-stone-300" title="پروفایل من">
          <i class="fa-solid fa-circle-user"></i>
        </NuxtLink>
        <NuxtLink v-else to="/login" class="hidden text-sm text-stone-600 hover:text-brand-600 md:inline dark:text-stone-300">
          ورود
        </NuxtLink>
      </div>
    </div>

    <!-- جستجوی موبایل -->
    <form class="px-4 pb-3 md:hidden" @submit.prevent="handleSearch">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="جستجوی محصول..."
        class="w-full rounded-full border border-stone-300 bg-stone-50 px-4 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-700 dark:bg-stone-800"
      />
    </form>

    <!-- منوی همبرگری موبایل -->
    <div v-if="mobileOpen" class="glass flex flex-col gap-1 border-t-0 px-4 py-3 md:hidden">
      <NuxtLink to="/" class="rounded-lg px-2 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200" @click="mobileOpen = false">خانه</NuxtLink>
      <NuxtLink to="/track-order" class="rounded-lg px-2 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200" @click="mobileOpen = false">پیگیری سفارش</NuxtLink>
      <NuxtLink v-if="authStore.user" to="/my-orders" class="rounded-lg px-2 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200" @click="mobileOpen = false">سفارش‌های من</NuxtLink>
      <NuxtLink v-if="authStore.isAdmin" to="/dashboard" class="rounded-lg px-2 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200" @click="mobileOpen = false">داشبورد</NuxtLink>
      <NuxtLink v-if="authStore.isSalesManager" to="/sales-dashboard" class="rounded-lg px-2 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200" @click="mobileOpen = false">داشبورد فروش</NuxtLink>
      <NuxtLink v-if="authStore.isSupplier" to="/supplier-dashboard" class="rounded-lg px-2 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200" @click="mobileOpen = false">داشبورد تامین‌کننده</NuxtLink>
      <NuxtLink to="/cart" class="rounded-lg px-2 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200" @click="mobileOpen = false">سبد خرید</NuxtLink>
      <NuxtLink v-if="authStore.user" to="/profile" class="rounded-lg px-2 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200" @click="mobileOpen = false">
        <i class="fa-solid fa-circle-user"></i> پروفایل من
      </NuxtLink>
      <NuxtLink v-if="!authStore.user" to="/login" class="rounded-lg px-2 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200" @click="mobileOpen = false">ورود</NuxtLink>
      <button v-else class="rounded-lg px-2 py-2 text-right text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200" @click="handleLogout">خروج</button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import DarkModeToggle from '../common/DarkModeToggle.vue'
import NotificationBell from './NotificationBell.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const mobileOpen = ref(false)
const searchQuery = ref('')

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/', query: { q: searchQuery.value.trim() } })
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>
