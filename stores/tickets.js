import { defineStore } from 'pinia'

// استور تیکت‌های پشتیبانی (پیام‌رسانی بین مشتری و ادمین/مدیر فروش)
export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: [],
    loading: false
  }),

  actions: {
    // برای مشتری: فقط تیکت‌های خودش
    async fetchForUser(userId) {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase
        .from('tickets')
        .select('*, ticket_messages(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      this.tickets = data || []
      this.loading = false
    },

    // برای ادمین/مدیر فروش: همه تیکت‌ها
    async fetchAll() {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase
        .from('tickets')
        .select('*, ticket_messages(*), profiles(email)')
        .order('created_at', { ascending: false })
      this.tickets = data || []
      this.loading = false
    },

    async createTicket(userId, subject, firstMessage) {
      const supabase = useSupabase()
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert([{ user_id: userId, subject }])
        .select()
        .single()
      if (error) throw error

      await supabase.from('ticket_messages').insert([{
        ticket_id: ticket.id,
        sender_role: 'customer',
        sender_id: userId,
        message: firstMessage
      }])

      return ticket
    },

    async sendMessage(ticketId, senderRole, senderId, message) {
      const supabase = useSupabase()
      const { error } = await supabase.from('ticket_messages').insert([{
        ticket_id: ticketId,
        sender_role: senderRole,
        sender_id: senderId,
        message
      }])
      if (error) throw error

      // اگر ادمین پاسخ داد، به مشتری اعلان بده
      if (senderRole === 'admin') {
        const { data: ticket } = await supabase.from('tickets').select('user_id, subject').eq('id', ticketId).single()
        if (ticket) {
          await supabase.from('notifications').insert([{
            user_id: ticket.user_id,
            type: 'ticket_reply',
            title: 'پاسخ جدید به تیکت شما',
            body: `تیکت «${ticket.subject}» پاسخ داده شد.`
          }])
        }
      }
    },

    async updateStatus(ticketId, status) {
      const supabase = useSupabase()
      await supabase.from('tickets').update({ status }).eq('id', ticketId)
    }
  }
})
