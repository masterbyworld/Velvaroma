'use client'

import type { CartItem } from '@/lib/cart-context'
import type { Product } from '@/lib/products'

// GA4 enhanced-ecommerce + Meta mirroring, pushed into window.dataLayer so a
// Google Tag Manager container can forward events to GA4 and the Meta pixel.
// All pushes are no-ops on the server and never throw if GTM/pixel is absent.

type DataLayerObject = Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: DataLayerObject[]
    fbq?: (...args: unknown[]) => void
  }
}

const CURRENCY = 'USD'

// The GA4 ecommerce events this module owns. The generic click tracker refuses
// to emit any of these, so a stray onClick handler can never double-fire an
// ecommerce event that a dedicated track* call already pushed.
const MANAGED_ECOMMERCE_EVENTS = new Set([
  'view_item',
  'add_to_cart',
  'begin_checkout',
  'purchase',
  'remove_from_cart',
  'view_cart',
])

export type EcommerceItem = {
  item_id: string
  item_name: string
  item_brand?: string
  item_variant?: string
  price: number
  quantity: number
}

function push(obj: DataLayerObject) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(obj)
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

function sumValue(items: EcommerceItem[]) {
  return round(items.reduce((n, i) => n + i.price * i.quantity, 0))
}

// Meta (Facebook) payload built from the SAME clean item array as GA4 so the
// two platforms always report identical content and value.
function metaFrom(items: EcommerceItem[]) {
  return {
    currency: CURRENCY,
    value: sumValue(items),
    content_type: 'product',
    content_ids: items.map((i) => i.item_id),
    contents: items.map((i) => ({ id: i.item_id, quantity: i.quantity, item_price: i.price })),
  }
}

function pushEcommerce(event: string, items: EcommerceItem[], metaEvent: string) {
  const meta = metaFrom(items)
  // GA4 requires clearing the previous ecommerce object first so item arrays
  // don't bleed across events.
  push({ ecommerce: null })
  push({
    event,
    ecommerce: { currency: CURRENCY, value: meta.value, items },
    meta: { event: metaEvent, ...meta },
  })
  // Fire the Meta pixel directly too when it's present on the page.
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', metaEvent, meta)
  }
}

export function productToItem(
  product: Pick<Product, 'whiteSku' | 'name' | 'brand'>,
  opts: { variant?: string; price: number; quantity?: number },
): EcommerceItem {
  return {
    item_id: product.whiteSku,
    item_name: product.name,
    item_brand: product.brand,
    item_variant: opts.variant,
    price: round(opts.price),
    quantity: opts.quantity ?? 1,
  }
}

export function cartItemsToEcommerce(items: CartItem[]): EcommerceItem[] {
  return items.map((i) => ({
    item_id: i.whiteSku,
    item_name: i.name,
    item_variant: i.size,
    price: round(i.price),
    quantity: i.quantity,
  }))
}

export function trackViewItem(item: EcommerceItem) {
  pushEcommerce('view_item', [item], 'ViewContent')
}

export function trackAddToCart(item: EcommerceItem) {
  pushEcommerce('add_to_cart', [item], 'AddToCart')
}

export function trackInitiateCheckout(items: EcommerceItem[]) {
  if (items.length === 0) return
  pushEcommerce('begin_checkout', items, 'InitiateCheckout')
}

/**
 * Generic click tracker for non-ecommerce UI (nav, banners, CTAs). It suppresses
 * managed ecommerce events so it can never duplicate the dedicated track* calls.
 */
export function trackClick(label: string, params: DataLayerObject = {}) {
  if (MANAGED_ECOMMERCE_EVENTS.has(label)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[v0] trackClick ignored managed ecommerce event: ${label}`)
    }
    return
  }
  push({ event: 'click', click_label: label, ...params })
}
