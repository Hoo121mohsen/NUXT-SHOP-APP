import { defineStore } from 'pinia'
import { useJournalStore } from './journal'

// استور حواله‌های بانکی (واریز/برداشت) - هر حواله یک سند حسابداری خودکار می‌سازد
export const useBankTransfersStore = defineStore('bankTransfers', {
  state: () => ({
    transfers: [],
    loading: false
  }),

  actions: {
    async fetchTransfers() {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase
        .from('bank_transfers')
        .select('*, chart_of_accounts(code, name)')
        .order('transfer_date', { ascending: false })
      this.transfers = data || []
      this.loading = false
    },

    // transfer_type: deposit (واریز به حساب) | withdrawal (برداشت/پرداخت از حساب)
    // counterAccountCode: حساب طرف مقابل تراکنش (مثلا حساب دریافتنی مشتری، یا هزینه، یا حساب پرداختنی فروشنده)
    async createTransfer({ transfer_type, amount, bank_name, tracking_code, related_party, counterAccountCode, transfer_date, description }) {
      const supabase = useSupabase()
      const journalStore = useJournalStore()

      const lines =
        transfer_type === 'deposit'
          ? [
              { account_code: '1020', debit: amount, credit: 0, description }, // بدهکار: بانک
              { account_code: counterAccountCode, debit: 0, credit: amount, description }
            ]
          : [
              { account_code: counterAccountCode, debit: amount, credit: 0, description },
              { account_code: '1020', debit: 0, credit: amount, description } // بستانکار: بانک
            ]

      const entry = await journalStore.postEntry({
        description: `حواله بانکی: ${description || related_party || ''}`,
        source_type: 'bank_transfer',
        entry_date: transfer_date,
        lines
      })

      const { data: account } = await supabase.from('chart_of_accounts').select('id').eq('code', counterAccountCode).single()

      const { data, error } = await supabase
        .from('bank_transfers')
        .insert([{
          transfer_type,
          amount,
          bank_name,
          tracking_code,
          related_party,
          counter_account_id: account?.id || null,
          transfer_date,
          description,
          journal_entry_id: entry.id
        }])
        .select('*, chart_of_accounts(code, name)')
        .single()
      if (error) throw error

      this.transfers.unshift(data)
      return data
    }
  }
})
