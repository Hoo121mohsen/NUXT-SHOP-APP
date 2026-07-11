import { defineStore } from 'pinia'

// استور مدیریت فروشنده‌ها
export const useVendorsStore = defineStore('vendors', {
  state: () => ({
    vendors: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchVendors() {
      const supabase = useSupabase()
      this.loading = true
      const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false })
      this.loading = false
      if (error) {
        this.error = error.message
        return
      }
      this.vendors = data
    },
    async createVendor(payload) {
      const supabase = useSupabase()
      const { data, error } = await supabase.from('vendors').insert([payload]).select().single()
      if (error) throw error
      this.vendors.unshift(data)
      return data
    },
    async updateVendor(id, payload) {
      const supabase = useSupabase()
      const { error } = await supabase.from('vendors').update(payload).eq('id', id)
      if (error) throw error
      await this.fetchVendors()
    },
    async deleteVendor(id) {
      const supabase = useSupabase()
      const { error } = await supabase.from('vendors').delete().eq('id', id)
      if (error) throw error
      this.vendors = this.vendors.filter((v) => v.id !== id)
    }
  }
})
