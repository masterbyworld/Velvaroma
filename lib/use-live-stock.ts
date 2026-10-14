'use client'

import useSWR from 'swr'

type LivePrice = { price: number; compareAt: number }
type InventoryResponse = {
  stock: Record<string, boolean>
  prices: Record<string, LivePrice>
  shopifyAvailable?: boolean
}

const fetcher = (url: string): Promise<InventoryResponse> => fetch(url).then((r) => r.json())

/**
 * Live Shopify price + inventory, keyed by CSV (Black) SKU. Every resolver takes
 * the catalog value as a fallback, used while loading or if a SKU is unknown.
 */
export function useLiveStock() {
  const { data } = useSWR<InventoryResponse>('/api/inventory', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 60_000,
    refreshInterval: 120_000,
  })

  const stock = data?.stock
  const prices = data?.prices

  return {
    ready: Boolean(stock),
    isInStock(blackSku: string, fallback: boolean): boolean {
      const live = stock?.[blackSku]
      return live === undefined ? fallback : live
    },
    priceOf<T extends LivePrice>(blackSku: string, fallback: T): LivePrice {
      return prices?.[blackSku] ?? { price: fallback.price, compareAt: fallback.compareAt }
    },
  }
}
