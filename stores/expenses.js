import { defineStore } from 'pinia'
import { useJournalStore } from './journal'

// استور ثبت هزینه‌ها - هر هزینه یک سند حسابداری (بدهکار هزینه / بستانکار صندوق یا بانک) خودکار می‌سازد
export const useExpensesStore = defineStore('expenses', {
  state: () => ({
    expenses: [],
    loading: false
  }),

  actions: {
    async fetchExpenses() {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase
        .from('expenses')
        .select('*, chart_of_accounts(code, name)')
        .order('expense_date', { ascending: false })
      this.expenses = data || []
      this.loading = false
    },

    // accountCode: کد حساب هزینه (مثلا 5020 اجاره) - paymentMethod: cash | bank
    async createExpense({ title, accountCode, amount, expense_date, payment_method, description }) {
      const supabase = useSupabase()
      const journalStore = useJournalStore()

      // بدهکار: حساب هزینه انتخابی / بستانکار: صندوق (1010) یا بانک (1020)
      const creditAccount = payment_method === 'bank' ? '1020' : '1010'
      const entry = await journalStore.postEntry({
        description: `هزینه: ${title}`,
        source_type: 'expense',
        entry_date: expense_date,
        lines: [
          { account_code: accountCode, debit: amount, credit: 0, description: title },
          { account_code: creditAccount, debit: 0, credit: amount, description: title }
        ]
      })

      const { data: accounts } = await supabase.from('chart_of_accounts').select('id, code').eq('code', accountCode).single()

      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          title,
          account_id: accounts?.id || null,
          amount,
          expense_date,
          payment_method,
          description,
          journal_entry_id: entry.id
        }])
        .select('*, chart_of_accounts(code, name)')
        .single()
      if (error) throw error

      this.expenses.unshift(data)
      return data
    }
  }
})
