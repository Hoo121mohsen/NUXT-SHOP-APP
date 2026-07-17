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

      <p class="mt-3 px-3 text-[10px] font-bold uppercase tracking-wide text-stone-400">حسابداری</p>
      <NuxtLink to="/dashboard/accounting" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">💰 خلاصه حسابداری</NuxtLink>
      <NuxtLink to="/dashboard/accounting-documents" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">📖 اسناد حسابداری</NuxtLink>
      <NuxtLink to="/dashboard/expenses" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">💸 ثبت هزینه‌ها</NuxtLink>
      <NuxtLink to="/dashboard/bank-transfers" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🏦 حواله‌های بانکی</NuxtLink>
      <NuxtLink to="/dashboard/vat-report" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🧮 گزارش ارزش افزوده</NuxtLink>
      <NuxtLink to="/dashboard/tax-settings" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">⚙️ تنظیمات مالیاتی</NuxtLink>

      <p class="mt-3 px-3 text-[10px] font-bold uppercase tracking-wide text-stone-400">مدیریت</p>
      <NuxtLink to="/dashboard/orders" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🛒 سفارش‌ها</NuxtLink>
      <NuxtLink to="/dashboard/users" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">👤 کاربران و دسترسی‌ها</NuxtLink>
      <NuxtLink to="/dashboard/comments" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">💬 نظرات محصولات</NuxtLink>
      <NuxtLink to="/dashboard/tickets" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🎫 پیام‌های پشتیبانی</NuxtLink>
      <NuxtLink to="/" class="mt-4 rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800">← بازگشت به سایت</NuxtLink>
    </nav>
  </aside>
</template>

<script setup>
</script>
