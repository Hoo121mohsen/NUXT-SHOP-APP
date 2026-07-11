import { defineStore } from 'pinia'

// استور سبد خرید - در localStorage نگه‌داری می‌شود
// هر آیتم می‌تواند به یک تنوع رنگ خاص (color_id) مرتبط باشد؛ محصول با رنگ‌های متفاوت، ردیف‌های جدا در سبد دارد
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    totalCount: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, i) => sum + i.quantity * i.price, 0)
  },
  actions: {
    init() {
      if (import.meta.client) {
        this.items = JSON.parse(localStorage.getItem('cart-items') || '[]')
      }
    },
    persist() {
      if (import.meta.client) {
        localStorage.setItem('cart-items', JSON.stringify(this.items))
      }
    },

    // color: { id, name, hex } یا null اگر محصول رنگ‌بندی ندارد
    addItem(product, quantity = 1, color = null) {
      const colorId = color?.id || null
      const existing = this.items.find((i) => i.id === product.id && i.color_id === colorId)
      if (existing) {
        existing.quantity += quantity
      } else {
        this.items.push({
          id: product.id,
          title: product.title,
          price: product.sale_price,
          image: product.coverImage,
          color_id: colorId,
          color_name: color?.name || null,
          color_hex: color?.hex || null,
          quantity
        })
      }
      this.persist()
    },

    // چون یک محصول می‌تواند چند ردیف با رنگ متفاوت داشته باشد، حذف/تغییر تعداد باید بر اساس id + color_id باشد
    removeItem(productId, colorId = null) {
      this.items = this.items.filter((i) => !(i.id === productId && i.color_id === colorId))
      this.persist()
    },
    updateQuantity(productId, quantity, colorId = null) {
      const item = this.items.find((i) => i.id === productId && i.color_id === colorId)
      if (item) item.quantity = Math.max(1, quantity)
      this.persist()
    },
    clearCart() {
      this.items = []
      this.persist()
    }
  }
})
