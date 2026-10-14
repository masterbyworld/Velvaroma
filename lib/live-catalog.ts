import 'server-only'
import { allVariants, type CatalogVariant } from '@/lib/products'
import { resolveLiveVariants, type LiveVariant, type MatchVia } from '@/lib/shopify'

export type PricedVariant = CatalogVariant & {
  price: number
  compareAt: number
  inStock: boolean
  variantId: string | null
  matchedSku: string | null
  via: MatchVia | null
  source: 'shopify' | 'csv'
}

export type LiveCatalog = {
  variants: PricedVariant[]
  bySku: Map<string, PricedVariant>
  shopifyAvailable: boolean
  shopifyVariantCount: number
  error?: string
}

/**
 * Merge the CSV catalog with live Shopify data. Matched variants take Shopify's
 * price, compare-at, availability, and variant ID; unmatched variants (or all
 * of them, if Shopify is unreachable) fall back to the CSV values.
 */
export async function getLiveCatalog(): Promise<LiveCatalog> {
  let matches = new Map<string, LiveVariant>()
  let shopifyAvailable = true
  let shopifyVariantCount = 0
  let error: string | undefined

  try {
    const res = await resolveLiveVariants(allVariants.map((cv) => cv.variant))
    matches = res.matches
    shopifyVariantCount = res.shopifyVariantCount
  } catch (e) {
    shopifyAvailable = false
    error = e instanceof Error ? e.message : String(e)
    console.error('[v0] live catalog: Shopify unavailable, using CSV fallback:', error)
  }

  const variants: PricedVariant[] = allVariants.map((cv) => {
    const live = matches.get(cv.variant.blackSku.toUpperCase())
    if (live) {
      return {
        ...cv,
        price: live.price,
        compareAt: live.compareAt,
        inStock: live.availableForSale,
        variantId: live.variantId,
        matchedSku: live.sku,
        via: live.via,
        source: 'shopify',
      }
    }
    return {
      ...cv,
      price: cv.variant.price,
      compareAt: cv.variant.compareAt,
      inStock: cv.variant.inStock,
      variantId: null,
      matchedSku: null,
      via: null,
      source: 'csv',
    }
  })

  return {
    variants,
    bySku: new Map(variants.map((v) => [v.variant.blackSku.toUpperCase(), v])),
    shopifyAvailable,
    shopifyVariantCount,
    error,
  }
}
