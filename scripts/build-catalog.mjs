// Generates lib/catalog.json by joining three source datasets:
//   1. data/source/route-keys.json   -> route key (GA) -> collection + brand
//   2. data/source/sku-map.json       -> White SKU (-W) <-> Black SKU (-B)
//   3. data/source/shopify-backup.csv -> Shopify product export keyed by Black SKU
//
// The CSV is the base dataset (and the fallback price source) for the
// storefront and the /meta-catalog.csv feed. Live prices + inventory are
// layered on top at request time from Shopify (see lib/shopify.ts).
//
// Re-run after updating any source file:  node scripts/build-catalog.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))

// RFC 4180 CSV parser — Shopify exports contain quoted, multi-line HTML bodies.
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field.replace(/\r$/, ''))
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  const header = rows.shift() ?? []
  return rows
    .filter((r) => r.length > 1)
    .map((r) => Object.fromEntries(header.map((k, i) => [k, r[i] ?? ''])))
}

const routeRows = read('data/source/route-keys.json')
const skuRows = read('data/source/sku-map.json')
const backup = parseCsv(readFileSync(join(root, 'data/source/shopify-backup.csv'), 'utf8'))

// 1. Route key -> { brand, collection }
const routeMap = {}
for (const r of routeRows) {
  const key = String(r['Route Key'] || '').trim().toUpperCase()
  const brand = String(r['Brand Name'] || '').trim()
  const collection = String(r['White Collection Name'] || '').trim()
  if (key && collection) routeMap[key] = { brand, collection }
}

// 2. Black SKU -> White SKU (from explicit map, with -W/-B convention as fallback)
const blackToWhite = {}
for (const r of skuRows) {
  const white = String(r['White Product SKU ID'] || '').trim()
  const black = String(r['Black Product SKU ID'] || '').trim()
  if (/^RPM-.+-W$/.test(white) && /^RPM-.+-B$/.test(black)) blackToWhite[black] = white
}

const cleanHtml = (html) =>
  String(html || '')
    .replace(/<!---->/g, '')
    .replace(/<div class="attachment-container[^>]*>[\s\S]*?<\/div>/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()

const toText = (html) =>
  cleanHtml(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// "100" -> "100ML", "100ML" -> "100ML", "Default Title" -> "" (caller defaults it)
const toSize = (raw) => {
  const v = String(raw || '').trim()
  if (!v || /^default title$/i.test(v)) return ''
  const m = v.match(/(\d+)/)
  return m ? `${m[1]}ML` : v.toUpperCase()
}

function toVariant(row) {
  const sku = String(row['Variant SKU'] || '').trim().toUpperCase()
  const price = Number(row['Variant Price']) || 0
  const compareAt = Number(row['Variant Compare At Price']) || 0
  const qty = Number(row['Variant Inventory Qty']) || 0
  return {
    label: toSize(row['Option1 Value']),
    blackSku: sku,
    whiteSku: blackToWhite[sku] || sku.replace(/-B$/, '-W'),
    price,
    compareAt: compareAt > price ? compareAt : 0,
    inventory: qty,
    inStock: qty > 0,
  }
}

// 3. Walk the export. A row with a Title starts a product; following rows with
//    the same Handle add extra size variants (Variant SKU set) and/or gallery
//    images (Image Src set).
const products = []
let current = null

for (const row of backup) {
  const handle = String(row['Handle'] || '').trim()
  const sku = String(row['Variant SKU'] || '').trim().toUpperCase()
  const title = String(row['Title'] || '').trim()
  const image = String(row['Image Src'] || '').trim()

  if (title && /^RPM-.+-B$/.test(sku)) {
    const status = String(row['Status'] || '').trim()
    if (status !== 'active' && status !== 'unlisted') {
      current = null
      continue
    }
    const m = sku.match(/^RPM-([A-Z0-9]+)-\d+-B$/)
    const routeKey = m ? m[1] : ''
    const route = routeMap[routeKey] || null
    const first = toVariant(row)

    current = {
      id: handle,
      handle,
      title,
      brand: route?.brand || 'Velvaroma',
      routeKey,
      collection: route?.collection || 'Shop With ALL',
      whiteSku: first.whiteSku,
      blackSku: first.blackSku,
      price: first.price,
      compareAt: first.compareAt,
      discountPct: first.compareAt ? Math.round((1 - first.price / first.compareAt) * 100) : 0,
      size: first.label,
      image,
      images: image ? [image] : [],
      description: cleanHtml(row['Body (HTML)']),
      excerpt: toText(row['Body (HTML)']).slice(0, 200),
      status,
      inStock: first.inStock,
      variants: [first],
    }
    products.push(current)
  } else if (current && handle === current.handle) {
    if (/^RPM-.+-B$/.test(sku) && !current.variants.some((v) => v.blackSku === sku)) {
      const v = toVariant(row)
      current.variants.push(v)
      current.inStock = current.inStock || v.inStock
    }
    if (image && !current.images.includes(image)) current.images.push(image)
    if (image && !current.image) current.image = image
  }
}

// Collections index (ordered by the route-key sheet), with product counts
const collections = []
const seen = new Set()
for (const r of routeRows) {
  const key = String(r['Route Key'] || '').trim().toUpperCase()
  const name = String(r['White Collection Name'] || '').trim()
  const brand = String(r['Brand Name'] || '').trim()
  if (!key || !name || seen.has(key)) continue
  seen.add(key)
  const count = products.filter((p) => p.routeKey === key).length
  collections.push({ key, name, brand, count })
}

const brands = collections
  .filter((c) => c.brand && c.brand !== 'All Products' && c.count > 0)
  .map((c) => ({ name: c.brand, key: c.key, collection: c.name, count: c.count }))

const out = {
  generatedAt: new Date().toISOString(),
  productCount: products.length,
  collections,
  brands,
  products,
}

mkdirSync(join(root, 'lib'), { recursive: true })
writeFileSync(join(root, 'lib/catalog.json'), JSON.stringify(out, null, 2))

const variantCount = products.reduce((n, p) => n + p.variants.length, 0)
console.log(`[catalog] ${products.length} products, ${variantCount} variants`)
console.log(`[catalog] ${collections.length} collections, ${brands.length} brands`)
const noRoute = products.filter((p) => !routeMap[p.routeKey]).length
console.log(`[catalog] ${noRoute} products with unmapped route key -> Shop With ALL`)
