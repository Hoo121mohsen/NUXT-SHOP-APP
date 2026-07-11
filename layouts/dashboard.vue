<template>
  <!-- لایوت داشبورد مدیریت: سایدبار + محتوا -->
  <div class="flex min-h-screen bg-stone-50 dark:bg-stone-950">
    <Sidebar />
    <div class="flex-1 p-6">
      <slot />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '~/components/layout/Sidebar.vue'
</script>
