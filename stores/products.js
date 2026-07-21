import { defineStore } from 'pinia'
import { useJournalStore } from './journal'

// استور اصلی محصولات
// جداول مرتبط: products, product_images, product_colors, categories, vendors, warehouses
// + یکپارچه با انبار/حسابداری دوبل: تعریف محصول با موجودی اولیه، فروش، و مرجوعی همگی سند حسابداری واقعی می‌سازند
export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    discountedProducts: [],
    randomProducts: [],
    loading: false,
    error: null
  }),

  actions: {
    // گرفتن لیست محصولات همراه با تصاویر، رنگ‌ها و عنوان دسته‌بندی
    async fetchProducts() {
      const supabase = useSupabase()
      this.loading = true
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_colors(*), categories(id, title, image_url), vendors(id, name), warehouses(id, name)')
        .order('created_at', { ascending: false })
      this.loading = false
      if (error) {
        this.error = error.message
        return
      }
      this.products = data
    },

    // یک محصول با تمام جزئیات (برای صفحه محصول یا فرم ویرایش)
    async fetchProductById(id) {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_colors(*), categories(id, title, image_url), vendors(id, name), warehouses(id, name)')
        .eq('id', id)
        .single()
      if (error) {
        this.error = error.message
        return null
      }
      return data
    },

    // ۱۵ محصول تخفیف‌دار برای ردیف افقی صفحه اول - فقط محصولات منتشرشده
    async fetchDiscountedProducts(limit = 15) {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_colors(*)')
        .eq('is_published', true)
        .gt('discount_percentage', 0)
        .order('discount_percentage', { ascending: false })
        .limit(limit)
      if (!error) this.discountedProducts = data
    },

    // محصولات رندم برای صفحه اول و پیشنهادهای پایین صفحه محصول - فقط محصولات منتشرشده
    async fetchRandomProducts(limit = 12, excludeId = null) {
      const supabase = useSupabase()
      let query = supabase
        .from('products')
        .select('*, product_images(*), product_colors(*)')
        .eq('is_published', true)
        .limit(limit * 3)

      if (excludeId) query = query.neq('id', excludeId)

      const { data, error } = await query
      if (error) return []
      const shuffled = [...(data || [])].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, limit)
    },

    // ============================================
    // لایک / دیس‌لایک محصول (صفحه جزئیات محصول)
    // ============================================

    // دریافت رای فعلی کاربر برای یک محصول (اگر قبلا رای داده باشد)
    async fetchUserVote(productId, userId) {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('product_likes')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .maybeSingle()
      if (error) {
        console.error('خطا در دریافت رای کاربر:', error)
        return null
      }
      return data
    },

    // ثبت رای جدید (لایک یا دیس‌لایک)؛ اگر کاربر قبلا رای مخالف داده بود، رای را تغییر می‌دهد
    // تعداد لایک/دیس‌لایک روی جدول products به‌صورت خودکار توسط تریگر دیتابیس به‌روز می‌شود
    async castVote(productId, userId, voteType) {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('product_likes')
        .upsert(
          [{ product_id: productId, user_id: userId, like_type: voteType }],
          { onConflict: 'product_id,user_id' }
        )
        .select()
        .single()
      if (error) throw error
      return data
    },

    // حذف رای کاربر (اگر روی همان دکمه دوباره کلیک کند)
    async removeVote(productId, userId) {
      const supabase = useSupabase()
      const { error } = await supabase
        .from('product_likes')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', userId)
      if (error) throw error
    },

    // آپلود یک فایل عکس محصول در باکت product-media
    async uploadProductImage(file) {
      const supabase = useSupabase()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('product-media').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('product-media').getPublicUrl(path)
      return data.publicUrl
    },

    // ثبت محصول جدید همراه با تصاویر، رنگ‌بندی (هر رنگ با تعداد مستقل) و تگ‌های سئو
    // موجودی کل محصول از جمع تعداد رنگ‌ها محاسبه می‌شود (منبع واحد حقیقت برای انبار/حسابداری)
    async createProduct(payload) {
      const supabase = useSupabase()
      const journalStore = useJournalStore()
      const { images, colors, tags, ...productFields } = payload

      const computedStock = colors?.length
        ? colors.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0)
        : Number(productFields.stock_quantity || 0)

      const { data: product, error } = await supabase
        .from('products')
        .insert([{ ...productFields, tags, stock_quantity: computedStock }])
        .select()
        .single()
      if (error) throw error

      // درج تصاویر با ترتیب (sort_order) - اولین تصویر همان کاور کارت محصول است
      if (images?.length) {
        const imageRows = images.map((url, idx) => ({
          product_id: product.id,
          image_url: url,
          sort_order: idx
        }))
        const { error: imgErr } = await supabase.from('product_images').insert(imageRows)
        if (imgErr) throw imgErr
      }

      // درج رنگ‌بندی‌ها همراه با تعداد هر رنگ
      if (colors?.length) {
        const colorRows = colors
          .filter((c) => c.name || c.hex || Number(c.quantity) > 0)
          .map((c, idx) => ({
            product_id: product.id,
            color_name: c.name || 'بدون نام',
            color_hex: c.hex || '#20a870',
            quantity: Number(c.quantity) || 0,
            sort_order: idx
          }))
        if (colorRows.length) {
          const { error: colorErr } = await supabase.from('product_colors').insert(colorRows)
          if (colorErr) throw colorErr
        }
      }

      // یکپارچگی با انبار و حسابداری: فقط برای محصولات معمولی (غیر Affiliate) با موجودی اولیه
      if (!productFields.is_affiliate && computedStock > 0) {
        const amount = Number(productFields.purchase_price || 0) * computedStock

        await supabase.from('inventory_movements').insert([{
          product_id: product.id,
          warehouse_id: productFields.warehouse_id || null,
          change_qty: computedStock,
          reason: 'initial',
          reference_type: 'product',
          reference_id: product.id
        }])

        // سند ساده (برای صفحه خلاصه حسابداری قدیمی)
        await supabase.from('accounting_entries').insert([{
          entry_type: 'asset_initial',
          amount,
          description: `دارایی اولیه - تعریف محصول «${productFields.title}»`,
          product_id: product.id,
          quantity: computedStock,
          unit_price: Number(productFields.purchase_price || 0),
          vendor_id: productFields.vendor_id || null,
          reference_type: 'product',
          reference_id: product.id
        }])

        // سند حسابداری دوبل واقعی: بدهکار موجودی کالا / بستانکار سرمایه (دارایی اولیه)
        if (amount > 0) {
          await journalStore.postEntry({
            description: `دارایی اولیه - تعریف محصول «${productFields.title}»`,
            source_type: 'asset_initial',
            source_id: product.id,
            lines: [
              { account_code: '1040', debit: amount, credit: 0 },
              { account_code: '3010', debit: 0, credit: amount }
            ]
          })
        }
      }

      return this.fetchProductById(product.id)
    },

    // ویرایش محصول - تصاویر و رنگ‌ها را کامل جایگزین می‌کند (حذف قبلی‌ها و درج جدید)
    // توجه: تغییر موجودی از این مسیر در گردش کالا/حسابداری ثبت نمی‌شود (برای آن از فاکتور خرید استفاده کنید)
    async updateProduct(id, payload) {
      const supabase = useSupabase()
      const { images, colors, tags, ...productFields } = payload

      // اگر محصول تنوع رنگی دارد، موجودی کل از جمع تعداد رنگ‌ها محاسبه می‌شود
      // اگر تنوع رنگی ندارد (colors خالی است)، از فیلد stock_quantity که مستقیما در payload آمده استفاده می‌شود
      const computedStock = colors?.length
        ? colors.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0)
        : undefined

      const updateData = { ...productFields, tags }
      if (computedStock !== undefined) updateData.stock_quantity = computedStock

      const { error } = await supabase.from('products').update(updateData).eq('id', id)
      if (error) throw error

      if (images) {
        await supabase.from('product_images').delete().eq('product_id', id)
        const imageRows = images.map((url, idx) => ({ product_id: id, image_url: url, sort_order: idx }))
        if (imageRows.length) await supabase.from('product_images').insert(imageRows)
      }

      if (colors) {
        await supabase.from('product_colors').delete().eq('product_id', id)
        const colorRows = colors
          .filter((c) => c.name || c.hex || Number(c.quantity) > 0)
          .map((c, idx) => ({
            product_id: id,
            color_name: c.name || 'بدون نام',
            color_hex: c.hex || '#20a870',
            quantity: Number(c.quantity) || 0,
            sort_order: idx
          }))
        if (colorRows.length) await supabase.from('product_colors').insert(colorRows)
      }

      return this.fetchProductById(id)
    },

    async deleteProduct(id) {
      const supabase = useSupabase()
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },

    // تغییر سریع وضعیت نمایش محصول در سایت (از لیست محصولات داشبورد)
    async togglePublished(id, value) {
      const supabase = useSupabase()
      const { error } = await supabase.from('products').update({ is_published: value }).eq('id', id)
      if (error) throw error
    },

    // اعمال درصد تخفیف روی چند محصول انتخاب‌شده همزمان (برای بخش تخفیف‌های داشبورد)
    async applyDiscount(productIds, percentage) {
      const supabase = useSupabase()
      const { error } = await supabase
        .from('products')
        .update({ discount_percentage: percentage })
        .in('id', productIds)
      if (error) throw error
    },

    async removeDiscount(productIds) {
      const supabase = useSupabase()
      const { error } = await supabase
        .from('products')
        .update({ discount_percentage: 0 })
        .in('id', productIds)
      if (error) throw error
    },

    // محاسبه موجودی «در دسترس» یک محصول برای کاربر جاری:
    // موجودی واقعی منهای مقداری که در سفارش‌های «در انتظار تایید پرداخت» سایر کاربران رزرو شده است
    // (سفارش خود کاربر جاری از این کسر مستثنی می‌شود، چون او خودش قبلاً آن مقدار را «برای خودش» می‌بیند)
    async fetchAvailableStock(productId, currentUserId = null) {
      const supabase = useSupabase()

      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity, product_colors(id, quantity)')
        .eq('id', productId)
        .single()
      if (!product) return null

      let pendingQuery = supabase
        .from('order_items')
        .select('quantity, color_id, orders!inner(status, user_id)')
        .eq('product_id', productId)
        .eq('orders.status', 'pending')

      const { data: pendingItems } = await pendingQuery

      const reservedByOthers = (pendingItems || []).filter((i) => i.orders.user_id !== currentUserId)

      const totalReserved = reservedByOthers.reduce((sum, i) => sum + Number(i.quantity), 0)
      const reservedByColor = {}
      reservedByOthers.forEach((i) => {
        if (i.color_id) reservedByColor[i.color_id] = (reservedByColor[i.color_id] || 0) + Number(i.quantity)
      })

      const colorAvailability = {}
      for (const c of product.product_colors || []) {
        colorAvailability[c.id] = Math.max(0, Number(c.quantity) - (reservedByColor[c.id] || 0))
      }

      return {
        available: Math.max(0, Number(product.stock_quantity) - totalReserved),
        colorAvailability
      }
    },

    // تایید نهایی سفارش (وقتی پرداخت تایید می‌شود): کاهش اتمیک موجودی از طریق تابع دیتابیس confirm_order_stock
    // (این تابع جلوی اضافه‌فروش در خرید همزمان چند مشتری از آخرین موجودی را می‌گیرد)
    // سپس فقط برای ردیف‌هایی که موجودی کافی داشتند سند حسابداری (فروش+مالیات+بهای تمام‌شده) صادر می‌شود؛
    // برای ردیف‌های کم‌موجودی، به مشتری اعلان داده می‌شود که سبد خریدش نیاز به اصلاح دارد
    async processOrderConfirmation(order) {
      const supabase = useSupabase()
      const journalStore = useJournalStore()

      const alreadyProcessed = await journalStore.hasEntryForSource('sale', order.id)
      if (alreadyProcessed) return { hasShortage: false }

      const { data: rpcResult, error: rpcError } = await supabase.rpc('confirm_order_stock', { p_order_id: order.id })
      if (rpcError) throw rpcError

      const shortages = rpcResult?.shortages || []
      const shortageProductIds = new Set(shortages.map((s) => s.product_id))

      const customerName = order.full_name || null
      const vatRate = Number(order.vat_rate || 0)

      for (const item of order.items || []) {
        if (shortageProductIds.has(item.id)) continue // کم‌موجودی بود؛ برای این ردیف سندی صادر نمی‌شود

        const { data: product } = await supabase
          .from('products')
          .select('vendor_id, purchase_price')
          .eq('id', item.id)
          .single()
        if (!product) continue

        const lineTotal = Number(item.price) * Number(item.quantity)
        const netAmount = Math.round(lineTotal / (1 + vatRate / 100))
        const vatAmount = lineTotal - netAmount
        const cogsAmount = Number(product.purchase_price || 0) * Number(item.quantity)

        // سند ساده (برای صفحه خلاصه حسابداری قدیمی)
        await supabase.from('accounting_entries').insert([{
          entry_type: 'revenue_sale',
          amount: lineTotal,
          description: `درآمد فروش - سفارش`,
          product_id: item.id,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          vendor_id: product.vendor_id || null,
          customer_name: customerName,
          reference_type: 'order',
          reference_id: order.id
        }])

        // سند حسابداری دوبل واقعی فروش: بدهکار حساب دریافتنی، بستانکار فروش + مالیات بر ارزش افزوده
        const saleLines = [
          { account_code: '1030', debit: lineTotal, credit: 0, description: 'دریافتنی از مشتری' },
          { account_code: '4010', debit: 0, credit: netAmount, description: 'فروش کالا' }
        ]
        if (vatAmount > 0) {
          saleLines.push({ account_code: '2020', debit: 0, credit: vatAmount, description: 'مالیات بر ارزش افزوده فروش' })
        }
        await journalStore.postEntry({
          description: `فروش - سفارش`,
          source_type: 'sale',
          source_id: order.id,
          lines: saleLines
        })

        // سند بهای تمام‌شده کالای فروش‌رفته: بدهکار COGS / بستانکار موجودی کالا
        if (cogsAmount > 0) {
          await journalStore.postEntry({
            description: `بهای تمام‌شده کالای فروش‌رفته - سفارش`,
            source_type: 'sale_cogs',
            source_id: order.id,
            lines: [
              { account_code: '5010', debit: cogsAmount, credit: 0 },
              { account_code: '1040', debit: 0, credit: cogsAmount }
            ]
          })
        }
      }

      // اطلاع‌رسانی کمبود موجودی به مشتری (در صورت داشتن حساب کاربری)
      if (shortages.length && order.user_id) {
        for (const shortage of shortages) {
          const { data: prod } = await supabase.from('products').select('stock_quantity').eq('id', shortage.product_id).single()
          await supabase.from('notifications').insert([{
            user_id: order.user_id,
            type: 'stock_shortage',
            title: 'کمبود موجودی در سفارش شما',
            body: `متاسفانه به دلیل خرید سایر مشتریان، موجودی «${shortage.title}» کافی نبود (درخواست شما: ${shortage.requested} عدد). موجودی در دسترس فعلی: ${prod?.stock_quantity ?? 0} عدد. لطفا سبد خرید یا سفارش خود را اصلاح کنید.`,
            product_id: shortage.product_id,
            order_id: order.id
          }])
        }
      }

      return { hasShortage: shortages.length > 0, shortages }
    },

    // پردازش مرجوعی سفارش: افزایش موجودی انبار (کالا + رنگ) + ثبت گردش کالا + سند حسابداری معکوس (فروش/مالیات/بهای تمام‌شده)
    // idempotent است - اگر قبلاً برای این سفارش پردازش شده باشد، دوباره انجام نمی‌شود
    async processOrderReturn(order) {
      const supabase = useSupabase()
      const journalStore = useJournalStore()

      const alreadyProcessed = await journalStore.hasEntryForSource('return', order.id)
      if (alreadyProcessed) return

      for (const item of order.items || []) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity, warehouse_id, vendor_id, purchase_price')
          .eq('id', item.id)
          .single()
        if (!product) continue

        const newQty = Number(product.stock_quantity || 0) + Number(item.quantity)
        await supabase.from('products').update({ stock_quantity: newQty }).eq('id', item.id)

        if (item.color_id) {
          const { data: colorRow } = await supabase.from('product_colors').select('quantity').eq('id', item.color_id).single()
          if (colorRow) {
            await supabase.from('product_colors').update({ quantity: Number(colorRow.quantity || 0) + Number(item.quantity) }).eq('id', item.color_id)
          }
        }

        await supabase.from('inventory_movements').insert([{
          product_id: item.id,
          color_id: item.color_id || null,
          warehouse_id: product.warehouse_id || null,
          change_qty: Number(item.quantity),
          reason: 'return',
          reference_type: 'order',
          reference_id: order.id
        }])

        const lineTotal = Number(item.price) * Number(item.quantity)
        const vatRate = Number(order.vat_rate || 0)
        const netAmount = Math.round(lineTotal / (1 + vatRate / 100))
        const vatAmount = lineTotal - netAmount
        const cogsAmount = Number(product.purchase_price || 0) * Number(item.quantity)

        // سند معکوس فروش: بدهکار فروش+مالیات (کاهش درآمد) / بستانکار حساب دریافتنی (برگشت بدهی مشتری)
        const returnLines = [
          { account_code: '4010', debit: netAmount, credit: 0, description: 'برگشت از فروش (مرجوعی)' }
        ]
        if (vatAmount > 0) {
          returnLines.push({ account_code: '2020', debit: vatAmount, credit: 0, description: 'برگشت مالیات بر ارزش افزوده' })
        }
        returnLines.push({ account_code: '1030', debit: 0, credit: lineTotal, description: 'برگشت بدهی مشتری' })

        await journalStore.postEntry({
          description: `مرجوعی سفارش`,
          source_type: 'return',
          source_id: order.id,
          lines: returnLines
        })

        // برگشت بهای تمام‌شده: بدهکار موجودی کالا / بستانکار بهای تمام‌شده کالای فروش‌رفته
        if (cogsAmount > 0) {
          await journalStore.postEntry({
            description: `برگشت بهای تمام‌شده - مرجوعی سفارش`,
            source_type: 'return_cogs',
            source_id: order.id,
            lines: [
              { account_code: '1040', debit: cogsAmount, credit: 0 },
              { account_code: '5010', debit: 0, credit: cogsAmount }
            ]
          })
        }
      }
    }
  }
})
