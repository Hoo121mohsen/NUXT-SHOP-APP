import { defineStore } from 'pinia'

// استور ورود/ثبت‌نام با شماره موبایل (کد پیامکی یک‌بارمصرف)
export const usePhoneAuthStore = defineStore('phoneAuth', {
  state: () => ({
    loading: false,
    error: null
  }),

  actions: {
    async sendOtp(phone, purpose = 'login') {
      const supabase = useSupabase()
      this.loading = true
      this.error = null
      const { data, error } = await supabase.functions.invoke('send-otp', { body: { phone, purpose } })
      this.loading = false
      if (error || data?.error) {
        this.error = data?.error || error.message
        return false
      }
      return true
    },

    // در صورت موفقیت، نشست کاربر را مستقیماً در کلاینت برقرار می‌کند (بدون نیاز به ریدایرکت)
    async verifyOtp(phone, code) {
      const supabase = useSupabase()
      this.loading = true
      this.error = null
      const { data, error } = await supabase.functions.invoke('verify-otp', { body: { phone, code } })

      if (error || data?.error || !data?.tokenHash) {
        this.loading = false
        this.error = data?.error || error?.message || 'خطا در تایید کد'
        return false
      }

      const { error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: data.tokenHash,
        type: 'magiclink'
      })
      this.loading = false
      if (sessionError) {
        this.error = sessionError.message
        return false
      }
      return true
    }
  }
})
