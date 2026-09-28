'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Star, Heart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLiveStock } from '@/lib/use-live-stock'
import { type Product, DEFAULT_SIZE, discountPercent, formatPrice, normalizeSize } from '@/lib/products'
import { productToItem, trackAddToCart } from '@/lib/tracking'

export function ProductCard({ product }: { product: Product; index?: number }) {
  const { addItem } = useCart()
  const { isInStock } = useLiveStock()
  const [wished, setWished] = useState(false)
  const off = discountPercent(product)
  const inStock = isInStock(product.whiteSku, product.inStock)

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (!inStock) return
    addItem({
      id: `${product.slug}-${DEFAULT_SIZE}`,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: DEFAULT_SIZE,
      price: product.price,
      whiteSku: product.whiteSku,
      blackSku: product.blackSku,
    })
    trackAddToCart(productToItem(product, { variant: DEFAULT_SIZE, price: product.price, quantity: 1 }))
  }

  function toggleWish(e: React.MouseEvent) {
    e.preventDefault()
    setWished((w) => !w)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-square bg-muted/60">
            <Image
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              fill
              className={`object-contain p-5 ${inStock ? '' : 'opacity-40 grayscale'}`}
              sizes="(max-width: 768px) 50vw, 20vw"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {off > 0 && (
            <span className="rounded-full bg-sale px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
              -{off}%
            </span>
          )}
          {!inStock && (
            <span className="rounded-full bg-foreground px-2 py-0.5 text-[11px] font-bold uppercase text-background">
              Sold Out
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={toggleWish}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border"
        >
          <Heart className={`h-3.5 w-3.5 ${wished ? 'fill-sale text-sale' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center px-3 pb-3 pt-3 text-center">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {product.brand}
        </span>

        <Link href={`/product/${product.slug}`} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-bold uppercase leading-snug tracking-wide text-foreground text-balance">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-highlight text-highlight" aria-hidden="true" />
            <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>{normalizeSize(product.size)}</span>
          {product.family && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{product.family}</span>
            </>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-baseline justify-center gap-x-2">
          <span className="text-sm font-bold text-sale">{formatPrice(product.price)}</span>
          {product.compareAt > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAt)}</span>
          )}
        </div>

        <div className="mt-auto w-full pt-3">
          {inStock ? (
            <button
              type="button"
              onClick={quickAdd}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground py-2.5 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" /> Add to Cart
            </button>
          ) : (
            <span className="flex w-full items-center justify-center rounded-md bg-muted py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
