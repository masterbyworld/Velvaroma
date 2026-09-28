'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Star, Heart } from 'lucide-react'
import { useLiveStock } from '@/lib/use-live-stock'
import { useQuickAdd } from '@/lib/use-quick-add'
import { type Product, discountPercent, formatPrice, normalizeSize } from '@/lib/products'

export function ProductCard({ product }: { product: Product; index?: number }) {
  const quickAddToCart = useQuickAdd()
  const { isInStock } = useLiveStock()
  const [wished, setWished] = useState(false)
  const off = discountPercent(product)
  const inStock = isInStock(product.whiteSku, product.inStock)

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (!inStock) return
    quickAddToCart(product)
  }

  function toggleWish(e: React.MouseEvent) {
    e.preventDefault()
    setWished((w) => !w)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="relative">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-square bg-muted">
            <Image
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              fill
              className={`object-contain p-6 mix-blend-multiply ${inStock ? '' : 'opacity-40 grayscale'}`}
              sizes="(max-width: 768px) 50vw, 20vw"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1">
          {off > 0 && (
            <span className="rounded-full bg-sale px-2.5 py-1 text-xs font-bold text-primary-foreground">
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
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-sm ring-1 ring-border"
        >
          <Heart className={`h-4 w-4 ${wished ? 'fill-sale text-sale' : ''}`} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center px-4 pb-4 pt-4 text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {product.brand}
        </span>

        <Link href={`/product/${product.slug}`} className="mt-1.5 block">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-bold uppercase leading-snug tracking-wide text-foreground text-balance">
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
          <span className="text-base font-bold text-sale">{formatPrice(product.price)}</span>
          {product.compareAt > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAt)}</span>
          )}
        </div>

        <div className="mt-auto w-full pt-4">
          {inStock ? (
            <button
              type="button"
              onClick={quickAdd}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 sm:text-sm"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Add to Cart
            </button>
          ) : (
            <span className="flex h-11 w-full items-center justify-center rounded-md bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground sm:text-sm">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
