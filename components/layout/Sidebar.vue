<template>
  <!-- سایدبار داشبورد مدیریت -->
  <aside class="glass sticky top-0 h-screen w-64 shrink-0 border-l-0 p-4">
    <h2 class="mb-6 text-lg font-bold text-stone-800 dark:text-stone-100">پنل مدیریت</h2>
    <nav class="flex flex-col gap-1">
      <NuxtLink to="/dashboard" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">📊 نمای کلی</NuxtLink>
      <NuxtLink to="/dashboard/categories" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🗂️ دسته‌بندی‌ها</NuxtLink>
      <NuxtLink to="/dashboard/vendors" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🧑‍💼 فروشنده‌ها</NuxtLink>
      <NuxtLink to="/dashboard/warehouses" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🏭 انبارها</NuxtLink>
      <NuxtLink to="/dashboard/products" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">📦 محصولات</NuxtLink>
      <NuxtLink to="/dashboard/discounts" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🏷️ تخفیف‌ها</NuxtLink>
      <NuxtLink to="/dashboard/purchase-invoices" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🧾 فاکتورهای خرید/فروش</NuxtLink>
      <NuxtLink to="/dashboard/inventory" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">📦 گردش کالا</NuxtLink>
      <NuxtLink to="/dashboard/accounting" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">💰 حسابداری</NuxtLink>
      <NuxtLink to="/dashboard/orders" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🛒 سفارش‌ها</NuxtLink>
      <NuxtLink to="/dashboard/users" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">👤 کاربران و دسترسی‌ها</NuxtLink>
      <NuxtLink to="/" class="mt-4 rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800">← بازگشت به سایت</NuxtLink>
    </nav>
  </aside>
</template>

<script setup>
</script>
