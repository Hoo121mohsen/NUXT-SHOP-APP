import { defineStore } from 'pinia'

// استور اسناد حسابداری - موتور ثبت سند دوبل (Double-Entry)
// هر سند شامل چند آرتیکل (خط بدهکار/بستانکار) است و جمع بدهکار باید دقیقاً برابر جمع بستانکار باشد
export const useJournalStore = defineStore('journal', {
  state: () => ({
    entries: [],
    loading: false
  }),

  actions: {
    // ثبت یک سند حسابداری کامل - lines: [{ account_code, debit, credit, description }]
    // این تابع اعتبارسنجی می‌کند که سند بالانس باشد (جمع بدهکار = جمع بستانکار)، وگرنه خطا می‌دهد
    async postEntry({ description, source_type, source_id, entry_date, lines }) {
      const supabase = useSupabase()

      const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit || 0), 0)
      const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit || 0), 0)

      // اجازه اختلاف گرد شدن تا ۱ تومان (به‌خاطر محاسبات درصدی مالیات) را می‌دهیم
      if (Math.abs(totalDebit - totalCredit) > 1) {
        throw new Error(
          `سند حسابداری بالانس نیست: بدهکار ${totalDebit.toLocaleString('fa-IR')} ≠ بستانکار ${totalCredit.toLocaleString('fa-IR')}`
        )
      }

      // کد حساب‌ها را به شناسه واقعی حساب (chart_of_accounts.id) تبدیل می‌کنیم
      const { data: accounts } = await supabase.from('chart_of_accounts').select('id, code')
      const codeToId = Object.fromEntries((accounts || []).map((a) => [a.code, a.id]))

      const { data: entry, error } = await supabase
        .from('journal_entries')
        .insert([{
          description,
          source_type: source_type || 'manual',
          source_id: source_id || null,
          entry_date: entry_date || new Date().toISOString()
        }])
        .select()
        .single()
      if (error) throw error

      const lineRows = lines
        .filter((l) => Number(l.debit || 0) > 0 || Number(l.credit || 0) > 0)
        .map((l) => {
          const accountId = codeToId[l.account_code]
          if (!accountId) throw new Error(`حساب با کد ${l.account_code} در دفتر حساب‌ها یافت نشد`)
          return {
            journal_entry_id: entry.id,
            account_id: accountId,
            debit: Number(l.debit || 0),
            credit: Number(l.credit || 0),
            description: l.description || description
          }
        })

      const { error: linesError } = await supabase.from('journal_lines').insert(lineRows)
      if (linesError) throw linesError

      return entry
    },

    // بررسی اینکه آیا برای یک منبع مشخص (مثلا یک سفارش) قبلاً سندی ثبت شده یا نه (جلوگیری از ثبت تکراری)
    async hasEntryForSource(source_type, source_id) {
      const supabase = useSupabase()
      const { data } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('source_type', source_type)
        .eq('source_id', source_id)
        .limit(1)
      return !!(data && data.length)
    },

    // فهرست اسناد همراه با آرتیکل‌ها (برای صفحه اسناد حسابداری)
    async fetchEntries(limit = 300) {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase
        .from('journal_entries')
        .select('*, journal_lines(*, chart_of_accounts(code, name, type))')
        .order('entry_date', { ascending: false })
        .order('entry_number', { ascending: false })
        .limit(limit)
      this.entries = data || []
      this.loading = false
    }
  }
})
