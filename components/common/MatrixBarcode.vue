<template>
  <!-- بارکد ماتریسی/مربعی (QR) - برای برچسب انبار و شناسایی سریع کالا با اسکنر -->
  <img v-if="dataUrl" :src="dataUrl" :width="size" :height="size" class="mx-auto" alt="QR Code" />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  value: { type: String, required: true },
  size: { type: Number, default: 120 }
})

const dataUrl = ref('')

async function render() {
  if (!import.meta.client || !props.value) return
  const QRCode = await import('qrcode')
  dataUrl.value = await QRCode.toDataURL(props.value, { width: props.size, margin: 1 })
}

onMounted(render)
watch(() => props.value, render)
</script>
