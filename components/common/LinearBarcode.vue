<template>
  <!-- بارکد خطی (Linear Barcode) - برای شماره فاکتور، مناسب چاپ روی فاکتورهای فروش/خرید -->
  <svg ref="svgRef" class="mx-auto"></svg>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  value: { type: String, required: true },
  height: { type: Number, default: 50 }
})

const svgRef = ref(null)

async function render() {
  if (!import.meta.client || !svgRef.value || !props.value) return
  const JsBarcode = (await import('jsbarcode')).default
  JsBarcode(svgRef.value, props.value, {
    format: 'CODE128',
    displayValue: true,
    fontSize: 12,
    height: props.height,
    margin: 4
  })
}

onMounted(render)
watch(() => props.value, render)
</script>
