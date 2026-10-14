import { NextResponse } from 'next/server'
import { getLiveCatalog } from '@/lib/live-catalog'

// Live price + inventory feed for the storefront, keyed by CSV (Black) SKU.
// Matched variants carry Shopify's live price/compare-at/availability;
// unmatched ones carry the CSV fallback values.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const live = await getLiveCatalog()
  const stock: Record<string, boolean> = {}
  const prices: Record<string, { price: number; compareAt: number }> = {}
  for (const v of live.variants) {
    const sku = v.variant.blackSku
    stock[sku] = v.inStock
    prices[sku] = { price: v.price, compareAt: v.compareAt }
  }
  return NextResponse.json(
    { stock, prices, shopifyAvailable: live.shopifyAvailable },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
