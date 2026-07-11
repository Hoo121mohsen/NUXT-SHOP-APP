import { defineStore } from 'pinia'

// استور مدیریت انبارها
export const useWarehousesStore = defineStore('warehouses', {
  state: () => ({
    warehouses: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchWarehouses() {
      const supabase = useSupabase()
      this.loading = true
      const { data, error } = await supabase.from('warehouses').select('*').order('created_at', { ascending: false })
      this.loading = false
      if (error) {
        this.error = error.message
        return
      }
      this.warehouses = data
    },
    async createWarehouse(payload) {
      const supabase = useSupabase()
      const { data, error } = await supabase.from('warehouses').insert([payload]).select().single()
      if (error) throw error
      this.warehouses.unshift(data)
      return data
    },
    async updateWarehouse(id, payload) {
      const supabase = useSupabase()
      const { error } = await supabase.from('warehouses').update(payload).eq('id', id)
      if (error) throw error
      await this.fetchWarehouses()
    },
    async deleteWarehouse(id) {
      const supabase = useSupabase()
      const { error } = await supabase.from('warehouses').delete().eq('id', id)
      if (error) throw error
      this.warehouses = this.warehouses.filter((w) => w.id !== id)
    }
  }
})
