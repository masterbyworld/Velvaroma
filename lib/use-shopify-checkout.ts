'use client'

import { useState } from 'react'
import type { CartItem } from '@/lib/cart-context'
import { cartItemsToEcommerce, trackInitiateCheckout } from '@/lib/tracking'

export function useShopifyCheckout() {
  const [redirecting, setRedirecting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  async function startCheckout(items: CartItem[], discountCode?: string | null) {
    if (items.length === 0 || redirecting) return
    setRedirecting(true)
    setCheckoutError(null)
    trackInitiateCheckout(cartItemsToEcommerce(items))
    try {
      const res = await fetch('/api/shopify-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ blackSku: i.blackSku, whiteSku: i.whiteSku, quantity: i.quantity })),
          discountCode: discountCode ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Could not reach the secure Shopify checkout. Please try again.')
      }
      // Shopify checkout cannot render inside the v0 preview iframe.
      if (window.self !== window.top) {
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer')
        setRedirecting(false)
      } else {
        window.location.href = data.checkoutUrl
      }
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : 'Checkout failed')
      setRedirecting(false)
    }
  }

  return { startCheckout, redirecting, checkoutError }
}
