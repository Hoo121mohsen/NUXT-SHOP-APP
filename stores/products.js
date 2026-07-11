import { defineStore } from 'pinia'

// استور اصلی محصولات
// جداول مرتبط: products, product_images, product_colors, categories, vendors, warehouses
// + یکپارچه با انبار/حسابداری: تعریف محصول با موجودی اولیه = دارایی اولیه + گردش کالا
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
        await supabase.from('inventory_movements').insert([{
          product_id: product.id,
          warehouse_id: productFields.warehouse_id || null,
          change_qty: computedStock,
          reason: 'initial',
          reference_type: 'product',
          reference_id: product.id
        }])

        await supabase.from('accounting_entries').insert([{
          entry_type: 'asset_initial',
          amount: Number(productFields.purchase_price || 0) * computedStock,
          description: `دارایی اولیه - تعریف محصول «${productFields.title}»`,
          product_id: product.id,
          quantity: computedStock,
          unit_price: Number(productFields.purchase_price || 0),
          vendor_id: productFields.vendor_id || null,
          reference_type: 'product',
          reference_id: product.id
        }])
      }

      return this.fetchProductById(product.id)
    },

    // ویرایش محصول - تصاویر و رنگ‌ها را کامل جایگزین می‌کند (حذف قبلی‌ها و درج جدید)
    // توجه: تغییر موجودی از این مسیر در گردش کالا/حسابداری ثبت نمی‌شود (برای آن از فاکتور خرید استفاده کنید)
    async updateProduct(id, payload) {
      const supabase = useSupabase()
      const { images, colors, tags, ...productFields } = payload

      const computedStock = colors
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

    // کاهش موجودی هنگام ثبت سفارش مشتری + ثبت گردش کالا (فروش) - از صفحه checkout صدا زده می‌شود
    async decreaseStockForOrder(items, orderId) {
      const supabase = useSupabase()

      // نام مشتری این سفارش را یک‌بار می‌خوانیم تا روی هر سند درآمد فروش ثبت شود (برای فیلتر بر اساس نام مشتری)
      const { data: orderRow } = await supabase.from('orders').select('full_name').eq('id', orderId).single()
      const customerName = orderRow?.full_name || null

      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity, warehouse_id, vendor_id')
          .eq('id', item.id)
          .single()

        if (!product) continue

        const newQty = Math.max(0, Number(product.stock_quantity || 0) - Number(item.quantity))
        await supabase.from('products').update({ stock_quantity: newQty }).eq('id', item.id)

        // کاهش موجودی همان تنوع رنگ انتخاب‌شده توسط کاربر (هویت با نام رنگ - color_id مرجع دقیق است)
        if (item.color_id) {
          const { data: colorRow } = await supabase
            .from('product_colors')
            .select('quantity')
            .eq('id', item.color_id)
            .single()
          if (colorRow) {
            const newColorQty = Math.max(0, Number(colorRow.quantity || 0) - Number(item.quantity))
            await supabase.from('product_colors').update({ quantity: newColorQty }).eq('id', item.color_id)
          }
        }

        await supabase.from('inventory_movements').insert([{
          product_id: item.id,
          color_id: item.color_id || null,
          warehouse_id: product.warehouse_id || null,
          change_qty: -Number(item.quantity),
          reason: 'sale',
          reference_type: 'order',
          reference_id: orderId
        }])

        await supabase.from('accounting_entries').insert([{
          entry_type: 'revenue_sale',
          amount: Number(item.price) * Number(item.quantity),
          description: `درآمد فروش - سفارش`,
          product_id: item.id,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          vendor_id: product.vendor_id || null,
          customer_name: customerName,
          reference_type: 'order',
          reference_id: orderId
        }])
      }
    }
  }
})
