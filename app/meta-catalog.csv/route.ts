import { getLiveCatalog } from '@/lib/live-catalog'

// Meta (Facebook/Instagram) product feed. The CSV catalog is the base dataset;
// every request pulls live price, compare-at and inventory from Shopify by the
// mapped SKU, falling back to the CSV values for unmatched SKUs or outages.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const HEADERS = [
  'id',
  'item_group_id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'sale_price',
  'link',
  'image_link',
  'additional_image_link',
  'brand',
  'size',
  'gender',
  'google_product_category',
] as const

function cell(value: string | number): string {
  const s = String(value ?? '')
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const money = (n: number) => `${n.toFixed(2)} USD`
const plain = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const absolute = (origin: string, src: string) => (src.startsWith('http') ? src : `${origin}${src}`)

export async function GET(req: Request) {
  const origin = new URL(req.url).origin
  const live = await getLiveCatalog()

  const rows = live.variants.map(({ product, variant, price, compareAt, inStock }) => {
    const onSale = compareAt > price
    const images = product.images.map((i) => absolute(origin, i))
    return [
      variant.blackSku,
      product.blackSku,
      `${product.name} - ${variant.label}`,
      plain(product.description) || product.name,
      inStock ? 'in stock' : 'out of stock',
      'new',
      money(onSale ? compareAt : price),
      onSale ? money(price) : '',
      `${origin}/product/${product.slug}`,
      absolute(origin, product.image),
      images.slice(1, 10).join(','),
      product.brand,
      variant.label,
      product.gender === 'Men' ? 'male' : product.gender === 'Women' ? 'female' : 'unisex',
      'Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne',
    ]
      .map(cell)
      .join(',')
  })

  const body = [HEADERS.join(','), ...rows].join('\n')
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Shopify-Available': String(live.shopifyAvailable),
      'X-Shopify-Matched': String(live.variants.filter((v) => v.source === 'shopify').length),
    },
  })
}
