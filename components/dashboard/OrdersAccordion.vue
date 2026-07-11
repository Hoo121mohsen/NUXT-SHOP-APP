<template>
  <div class="space-y-3">
    <div
      v-for="order in orders"
      :key="order.id"
      class="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800"
    >
      <!-- سربرگ آکاردئون -->
      <button
        type="button"
        class="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-right hover:bg-stone-50 dark:hover:bg-stone-900/40"
        @click="toggle(order.id)"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg">{{ openIds.has(order.id) ? '▾' : '◂' }}</span>
          <span class="font-mono text-sm text-stone-500 dark:text-stone-400">{{ order.order_number || order.id.slice(0, 8) }}</span>
          <span class="text-sm text-stone-800 dark:text-stone-100">{{ order.full_name }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-stone-600 dark:text-stone-400">{{ formatToman(order.total_price) }} تومان</span>
          <span class="text-xs text-stone-400">{{ toJalaliDate(order.created_at) }}</span>
          <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="orderStatusColor(order.status)">
            {{ orderStatusLabel(order.status) }}
          </span>
        </div>
      </button>

      <!-- محتوای باز شده -->
      <div v-if="openIds.has(order.id)" class="border-t border-stone-100 p-4 dark:border-stone-700">
        <!-- هشدار نقص برای تامین‌کننده: اگر سفارش شامل کالاهایی از فروشندگان دیگر هم باشد -->
        <p
          v-if="mode === 'supplier' && !isPureOrder(order)"
          class="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
        >
          ⚠️ سفارش کامل نیست؛ این سفارش شامل کالاهایی از سایر تامین‌کنندگان هم هست.
        </p>

        <div class="space-y-4">
          <div v-for="group in vendorGroups(order)" :key="group.vendorId || 'none'">
            <div class="mb-2 flex items-center justify-between">
              <p class="text-sm font-semibold text-stone-700 dark:text-stone-300">
                فروشنده: {{ group.vendorName }}
                <span v-if="mode === 'supplier' && !isOwnVendor(group.vendorId)" class="mr-1 text-xs font-normal text-stone-400">(سایر فروشندگان)</span>
              </p>

              <!-- وضعیت این فروشنده در این سفارش -->
              <div v-if="group.vendorId" class="flex items-center gap-2">
                <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="vendorStatusColor(group.vendorStatus)">
                  {{ vendorStatusLabel(group.vendorStatus) }}
                </span>

                <BaseButton
                  v-if="canEditVendor(group.vendorId) && group.vendorStatus !== 'ready_to_ship'"
                  variant="secondary"
                  :disabled="mode === 'supplier' && !isPureOrder(order)"
                  :title="mode === 'supplier' && !isPureOrder(order) ? 'چون سفارش شامل کالاهایی از سایر تامین‌کنندگان است، امکان اعلام آماده ارسال نیست' : ''"
                  @click="$emit('update-vendor-status', order.id, group.vendorId, 'ready_to_ship')"
                >
                  آماده ارسال
                </BaseButton>
              </div>
            </div>

            <div class="overflow-x-auto rounded-lg border border-stone-100 dark:border-stone-700">
              <table class="w-full text-right text-xs">
                <thead class="bg-stone-50 text-stone-500 dark:bg-stone-900 dark:text-stone-400">
                  <tr>
                    <th class="px-3 py-2">کالا</th>
                    <th class="px-3 py-2">رنگ</th>
                    <th class="px-3 py-2">تعداد</th>
                    <th class="px-3 py-2">قیمت واحد</th>
                    <th class="px-3 py-2">جمع</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in group.items" :key="item.id" class="border-t border-stone-100 dark:border-stone-700">
                    <td class="px-3 py-2 text-stone-800 dark:text-stone-100">{{ item.title }}</td>
                    <td class="px-3 py-2">
                      <span v-if="item.color_name" class="inline-flex items-center gap-1 text-stone-600 dark:text-stone-300">
                        {{ item.color_name }}
                      </span>
                      <span v-else class="text-stone-300">—</span>
                    </td>
                    <td class="px-3 py-2 text-stone-600 dark:text-stone-400">{{ item.quantity }}</td>
                    <td class="px-3 py-2 text-stone-600 dark:text-stone-400">{{ formatToman(item.unit_price) }}</td>
                    <td class="px-3 py-2 text-stone-600 dark:text-stone-400">{{ formatToman(item.line_total) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- وضعیت کلی سفارش (فقط ادمین/مدیر فروش) -->
        <div v-if="mode !== 'supplier'" class="mt-4 flex items-center gap-2 border-t border-stone-100 pt-4 dark:border-stone-700">
          <label class="text-xs text-stone-500 dark:text-stone-400">وضعیت کلی سفارش (نمایش به مشتری):</label>
          <select
            :value="order.status"
            class="rounded-lg border border-stone-300 px-2 py-1 text-xs dark:border-stone-600 dark:bg-stone-900"
            @change="$emit('update-order-status', order.id, $event.target.value)"
          >
            <option v-for="s in ORDER_STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <NuxtLink :to="`/dashboard/orders/${order.id}`" class="mr-auto text-xs text-brand-600 hover:underline">مشاهده/چاپ فاکتور ←</NuxtLink>
        </div>
      </div>
    </div>

    <p v-if="!orders.length" class="p-6 text-center text-stone-500">سفارشی یافت نشد.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import { formatToman } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'
import { ORDER_STATUSES, orderStatusLabel, orderStatusColor, vendorStatusLabel, vendorStatusColor } from '~/stores/orders'

const props = defineProps({
  orders: { type: Array, required: true },
  mode: { type: String, default: 'admin' }, // admin | sales | supplier
  supplierVendorIds: { type: Array, default: () => [] }
})
defineEmits(['update-vendor-status', 'update-order-status'])

const openIds = ref(new Set())
function toggle(id) {
  if (openIds.value.has(id)) openIds.value.delete(id)
  else openIds.value.add(id)
  openIds.value = new Set(openIds.value)
}

function vendorGroups(order) {
  const items = order.order_items || []
  const statuses = order.order_vendor_statuses || []
  const map = {}
  for (const item of items) {
    const key = item.vendor_id || 'none'
    if (!map[key]) {
      map[key] = {
        vendorId: item.vendor_id || null,
        vendorName: item.vendors?.name || 'بدون فروشنده مشخص',
        vendorStatus: statuses.find((s) => s.vendor_id === item.vendor_id)?.status || 'pending',
        items: []
      }
    }
    map[key].items.push(item)
  }
  return Object.values(map)
}

function isPureOrder(order) {
  const vendorIds = [...new Set((order.order_items || []).map((i) => i.vendor_id).filter(Boolean))]
  if (props.mode !== 'supplier') return vendorIds.length <= 1
  return vendorIds.length === 1 && props.supplierVendorIds.includes(vendorIds[0])
}

function isOwnVendor(vendorId) {
  return props.supplierVendorIds.includes(vendorId)
}

function canEditVendor(vendorId) {
  if (props.mode === 'admin' || props.mode === 'sales') return true
  if (props.mode === 'supplier') return isOwnVendor(vendorId)
  return false
}
</script>
