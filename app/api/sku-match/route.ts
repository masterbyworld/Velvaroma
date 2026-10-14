import { NextResponse } from 'next/server'
import { getLiveCatalog } from '@/lib/live-catalog'

// Diagnostic: how many CSV variants resolve to a live Shopify variant, and how.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const live = await getLiveCatalog()
  const matched = live.variants.filter((v) => v.source === 'shopify')
  const byMethod: Record<string, number> = {}
  for (const v of matched) byMethod[v.via!] = (byMethod[v.via!] ?? 0) + 1

  return NextResponse.json(
    {
      shopifyAvailable: live.shopifyAvailable,
      error: live.error,
      shopifyVariantCount: live.shopifyVariantCount,
      csvVariants: live.variants.length,
      matched: matched.length,
      unmatched: live.variants.length - matched.length,
      byMethod,
      unmatchedSkus: live.variants
        .filter((v) => v.source === 'csv')
        .map((v) => `${v.variant.blackSku} (${v.product.name} ${v.variant.label})`),
      sample: matched.slice(0, 5).map((v) => ({
        csvSku: v.variant.blackSku,
        shopifySku: v.matchedSku,
        via: v.via,
        price: v.price,
        compareAt: v.compareAt,
        inStock: v.inStock,
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
