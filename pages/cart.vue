<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">سبد خرید</h1>

    <p v-if="!cartStore.items.length" class="text-stone-500">سبد خرید شما خالی است.</p>

    <div v-else class="grid gap-8 md:grid-cols-3">
      <div class="md:col-span-2">
        <CartItem
          v-for="item in cartStore.items"
          :key="item.id"
          :item="item"
          @update-qty="cartStore.updateQuantity"
          @remove="cartStore.removeItem"
        />
      </div>
      <CartSummary :subtotal="cartStore.totalPrice" @checkout="router.push('/checkout')" />
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '~/stores/cart'
import CartItem from '~/components/cart/CartItem.vue'
import CartSummary from '~/components/cart/CartSummary.vue'

useSeoMeta({ title: 'سبد خرید' })
const cartStore = useCartStore()
const router = useRouter()
</script>
