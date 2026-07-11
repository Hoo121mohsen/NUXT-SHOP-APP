import { defineStore } from 'pinia'

// استور علاقه‌مندی‌ها (wishlist) - در localStorage نگه‌داری می‌شود
// (در صورت نیاز به همگام‌سازی بین دستگاه‌ها می‌توان جدول wishlists را در supabase هم اضافه کرد)
export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    productIds: []
  }),
  actions: {
    init() {
      if (import.meta.client) {
        this.productIds = JSON.parse(localStorage.getItem('wishlist-ids') || '[]')
      }
    },
    persist() {
      if (import.meta.client) {
        localStorage.setItem('wishlist-ids', JSON.stringify(this.productIds))
      }
    },
    toggle(productId) {
      if (this.productIds.includes(productId)) {
        this.productIds = this.productIds.filter((id) => id !== productId)
      } else {
        this.productIds.push(productId)
      }
      this.persist()
    },
    isWishlisted(productId) {
      return this.productIds.includes(productId)
    }
  }
})
