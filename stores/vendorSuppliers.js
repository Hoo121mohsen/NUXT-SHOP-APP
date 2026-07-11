import { defineStore } from 'pinia'

// استور اتصال کاربر تامین‌کننده به یک یا چند فروشنده (vendor)
export const useVendorSuppliersStore = defineStore('vendorSuppliers', {
  state: () => ({
    links: [] // { id, user_id, vendor_id, vendors: {id, name} }
  }),

  actions: {
    async fetchAll() {
      const supabase = useSupabase()
      const { data } = await supabase.from('vendor_suppliers').select('*, vendors(id, name)')
      this.links = data || []
    },

    async fetchVendorIdsForUser(userId) {
      const supabase = useSupabase()
      const { data } = await supabase.from('vendor_suppliers').select('vendor_id').eq('user_id', userId)
      return (data || []).map((r) => r.vendor_id)
    },

    async assignVendor(userId, vendorId) {
      const supabase = useSupabase()
      const { error } = await supabase.from('vendor_suppliers').insert([{ user_id: userId, vendor_id: vendorId }])
      if (error) throw error
      await this.fetchAll()
    },

    async removeVendor(userId, vendorId) {
      const supabase = useSupabase()
      await supabase.from('vendor_suppliers').delete().eq('user_id', userId).eq('vendor_id', vendorId)
      await this.fetchAll()
    },

    linksForUser(userId) {
      return this.links.filter((l) => l.user_id === userId)
    }
  }
})
