import 'server-only'

// Shopify Storefront API client.
//
// SKU routing: the storefront shows REPLICA products identified by a BLACK SKU
// (…-B). Every Black SKU has a matching clean WHITE SKU (…-W) that is the real,
// listed product in Shopify. At checkout we translate Black -> White, look up
// the White SKU's live variant ID on Shopify, and add THAT to a Shopify cart so
// the shopper checks out against the clean catalog.

const API_VERSION = '2024-10'

// The Storefront GraphQL API only authenticates on the `*.myshopify.com` host.
// A public/custom domain (velvaroma.com, shop.velvaroma.com) returns 401
// UNAUTHORIZED even with a valid token — so we ALWAYS resolve to the myshopify
// host. The env var is honored only when it already points at a myshopify
// domain; otherwise we fall back to the known store. (The checkout URL Shopify
// returns is still on the primary domain, which is correct.)
const FALLBACK_MYSHOPIFY = 'velvaroma.myshopify.com'

function storeDomain(): string {
  // Prefer Velvaroma's own checkout env var; fall back to the legacy alias.
  const raw = (process.env.Velvaroma_Checkout || process.env.Velvaroma_Fragrance_Checkout || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
  // Always resolve to the myshopify host: honor the env value only when it is
  // already a myshopify domain, otherwise use the hardcoded fallback.
  return raw.toLowerCase().endsWith('.myshopify.com') ? raw : FALLBACK_MYSHOPIFY
}

// Read the token at call time (not module load) and trim it. A trailing space
// or newline in the stored env value is the classic cause of a Storefront 401,
// because the malformed header gets rejected by Shopify.
//
// The key is assembled at runtime instead of written as a static
// `process.env.NEXT_PUBLIC_…` expression on purpose: Next.js/Turbopack INLINES
// static `NEXT_PUBLIC_*` references at compile time, so if the module compiled
// before the env var was injected it would be baked in as an empty string.
// A computed key can't be inlined, forcing a true runtime process.env lookup.
function storefrontToken(): string {
  // Prefer Velvaroma's own token; fall back to the legacy Shopify-named alias.
  const primary = 'NEXT_PUBLIC_' + 'VELVAROMA_STOREFRONT_ACCESS_TOKEN'
  const legacy = 'NEXT_PUBLIC_' + 'SHOPIFY_STOREFRONT_ACCESS_TOKEN'
  const token = (process.env[primary] || process.env[legacy] || '').trim()
  if (!token) throw new Error('Shopify Storefront token is not configured')
  return token
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Shopify throttles bursts of Storefront requests and surfaces it inconsistently
// (429/430, sometimes 401, or 5xx). These are transient — retry with backoff
// rather than failing the whole checkout on a single throttled response.
const TRANSIENT_STATUSES = new Set([429, 430, 500, 502, 503, 504])

async function storefront<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const endpoint = `https://${storeDomain()}/api/${API_VERSION}/graphql.json`
  const maxAttempts = 4
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken(),
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    })

    if (res.ok) {
      const json = (await res.json()) as { data?: T; errors?: { message: string }[] }
      if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '))
      if (!json.data) throw new Error('Shopify returned no data')
      return json.data
    }

    const detail = await res.text().catch(() => '')
    const hint =
      res.status === 401
        ? ' — token/store rejected. Verify NEXT_PUBLIC_VELVAROMA_STOREFRONT_ACCESS_TOKEN and Velvaroma_Checkout.'
        : ''
    lastError = new Error(
      `Shopify request failed (${res.status})${hint}${detail ? ` ${detail.slice(0, 200)}` : ''}`,
    )

    // Retry transient/throttle responses with exponential backoff; fail fast on
    // genuine client errors (e.g. 400/404) that won't change on retry.
    if (!TRANSIENT_STATUSES.has(res.status) || attempt === maxAttempts) break
    await sleep(300 * 2 ** (attempt - 1))
  }

  throw lastError ?? new Error('Shopify request failed')
}


// ---------------------------------------------------------------------------
// Live Shopify variant index + SKU matching
// ---------------------------------------------------------------------------

/** A purchasable variant as it exists in Shopify right now. */
export type ShopifyVariant = {
  variantId: string
  sku: string
  size: string
  price: number
  compareAt: number
  availableForSale: boolean
}

/**
 * Manual CSV -> Shopify SKU overrides, for variants whose Shopify SKU doesn't
 * follow the RPM naming. Keys are CSV (Black) SKUs.
 */
export const SKU_OVERRIDES: Record<string, string> = {
  'RPM-CR-0009-B': '8',
}

export type MatchVia = 'override' | 'black-sku' | 'white-sku' | 'base-sku'

export type LiveVariant = ShopifyVariant & { via: MatchVia }

const PRODUCTS_QUERY = /* GraphQL */ `
  query Variants($cursor: String) {
    products(first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        variants(first: 50) {
          nodes {
            id
            sku
            availableForSale
            selectedOptions { value }
            price { amount }
            compareAtPrice { amount }
          }
        }
      }
    }
  }
`

type ProductsPage = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
    nodes: {
      variants: {
        nodes: {
          id: string
          sku: string | null
          availableForSale: boolean
          selectedOptions: { value: string }[]
          price: { amount: string }
          compareAtPrice: { amount: string } | null
        }[]
      }
    }[]
  }
}

/** "RPM-CR-0001-B" -> "RPM-CR-0001"; non-RPM SKUs are returned unchanged. */
export function baseSku(sku: string): string {
  return sku.trim().toUpperCase().replace(/^(RPM-[A-Z0-9]+-\d+)-[A-Z]$/, '$1')
}

const sizeDigits = (s: string) => s.match(/\d+/)?.[0] ?? ''

export type ShopifyIndex = {
  bySku: Map<string, ShopifyVariant>
  byBase: Map<string, ShopifyVariant[]>
  total: number
}

/** Fetches every Shopify variant on each call (no cache) so prices/stock are live. */
export async function fetchShopifyIndex(): Promise<ShopifyIndex> {
  const bySku = new Map<string, ShopifyVariant>()
  const byBase = new Map<string, ShopifyVariant[]>()
  let total = 0
  let cursor: string | null = null

  for (let page = 0; page < 50; page++) {
    const data: ProductsPage = await storefront<ProductsPage>(PRODUCTS_QUERY, { cursor })
    for (const product of data.products.nodes) {
      for (const v of product.variants.nodes) {
        const sku = (v.sku || '').trim().toUpperCase()
        if (!sku) continue
        const price = Number(v.price.amount) || 0
        const compareAt = Number(v.compareAtPrice?.amount) || 0
        const entry: ShopifyVariant = {
          variantId: v.id,
          sku,
          size: v.selectedOptions[0]?.value ?? '',
          price,
          compareAt: compareAt > price ? compareAt : 0,
          availableForSale: v.availableForSale,
        }
        total++
        bySku.set(sku, entry)
        const base = baseSku(sku)
        byBase.set(base, [...(byBase.get(base) ?? []), entry])
      }
    }
    if (!data.products.pageInfo.hasNextPage) break
    cursor = data.products.pageInfo.endCursor
  }

  return { bySku, byBase, total }
}

/**
 * Match one CSV variant to Shopify. Order: manual override -> exact Black SKU
 * -> White SKU -> same base SKU (choosing the candidate whose size matches).
 */
export function matchVariant(
  index: ShopifyIndex,
  v: { blackSku: string; whiteSku: string; label: string },
): LiveVariant | null {
  const black = v.blackSku.trim().toUpperCase()

  const override = SKU_OVERRIDES[black]
  if (override) {
    const hit = index.bySku.get(override.toUpperCase())
    if (hit) return { ...hit, via: 'override' }
  }

  const exact = index.bySku.get(black)
  if (exact) return { ...exact, via: 'black-sku' }

  const white = index.bySku.get(v.whiteSku.trim().toUpperCase())
  if (white) return { ...white, via: 'white-sku' }

  const candidates = index.byBase.get(baseSku(black)) ?? []
  if (candidates.length === 1) return { ...candidates[0], via: 'base-sku' }
  const wanted = sizeDigits(v.label)
  const sized = candidates.find((c) => wanted && sizeDigits(c.size) === wanted)
  return sized ? { ...sized, via: 'base-sku' } : null
}

/**
 * Resolve many CSV variants against live Shopify in one catalog scan.
 * Returns a map keyed by CSV Black SKU; unmatched SKUs are absent.
 */
export async function resolveLiveVariants(
  variants: { blackSku: string; whiteSku: string; label: string }[],
): Promise<{ matches: Map<string, LiveVariant>; shopifyVariantCount: number }> {
  const index = await fetchShopifyIndex()
  const matches = new Map<string, LiveVariant>()
  for (const v of variants) {
    const hit = matchVariant(index, v)
    if (hit) matches.set(v.blackSku.toUpperCase(), hit)
  }
  return { matches, shopifyVariantCount: index.total }
}

export function blackToWhiteSku(blackSku: string): string {
  return blackSku.trim().toUpperCase().replace(/-B$/, '-W')
}

type CartCreate = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null
    userErrors: { field: string[] | null; message: string }[]
  }
}

/** Create a Shopify cart from resolved variant lines and return its checkout URL. */
export async function createShopifyCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<string> {
  const data = await storefront<CartCreate>(
    `mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }`,
    { lines },
  )

  if (data.cartCreate.userErrors.length) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join('; '))
  }
  const url = data.cartCreate.cart?.checkoutUrl
  if (!url) throw new Error('Shopify did not return a checkout URL')
  return url
}
