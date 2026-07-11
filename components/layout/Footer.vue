<template>
  <footer class="glass mt-12 border-x-0 border-b-0 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
    © {{ year }} فروشگاه من - تمامی حقوق محفوظ است.
  </footer>
</template>
<script setup>
const year = new Date().getFullYear()
</script>
