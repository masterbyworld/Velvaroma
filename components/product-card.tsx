'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Heart, User, Users } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLiveStock } from '@/lib/use-live-stock'
import { type Product, DEFAULT_SIZE, discountPercent, formatPrice } from '@/lib/products'

function formatSize(size: string) {
  const m = String(size || '').match(/(\d+)\s*ml/i)
  return m ? `${m[1]} ML` : (size || DEFAULT_SIZE).toUpperCase()
}

function genderLabel(gender: Product['gender']) {
  if (gender === 'Men') return 'FOR MEN'
  if (gender === 'Women') return 'FOR WOMEN'
  return 'UNISEX'
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart()
  const { isInStock } = useLiveStock()
  const [wished, setWished] = useState(false)
  const off = discountPercent(product)
  const inStock = isInStock(product.whiteSku, product.inStock)
  const GenderIcon = product.gender === 'Unisex' ? Users : User

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
  }

  function toggleWish(e: React.MouseEvent) {
    e.preventDefault()
    setWished((w) => !w)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      className="group h-full"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
        {/* Image + badges */}
        <div className="relative">
          <Link href={`/product/${product.slug}`} className="block">
            <div className="relative aspect-square overflow-hidden bg-muted/40">
              <Image
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                fill
                className={`object-contain p-5 transition-transform duration-500 group-hover:scale-105 ${
                  inStock ? '' : 'opacity-40 grayscale'
                }`}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          </Link>

          {/* Top-left status / promo badges */}
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {product.badge && (
              <span className="rounded-md bg-highlight px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-highlight-foreground shadow-sm">
                {product.badge}
              </span>
            )}
            {off > 0 && (
              <span className="rounded-md bg-sale px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                {off}% Off
              </span>
            )}
            {!inStock && (
              <span className="rounded-md bg-foreground/85 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-background shadow-sm">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            type="button"
            onClick={toggleWish}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={wished}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm ring-1 ring-border transition-colors hover:text-sale"
          >
            <Heart className={`h-4 w-4 ${wished ? 'fill-sale text-sale' : ''}`} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-3">
          {/* Brand + rating */}
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-bold uppercase tracking-wide text-foreground">{product.brand}</span>
            <span className="flex shrink-0 items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-highlight text-highlight" />
              <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">| {product.reviews}</span>
            </span>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground text-pretty">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.compareAt > product.price && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compareAt)}</span>
            )}
            {off > 0 && (
              <span className="rounded bg-success px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success-foreground">
                Save {off}%
              </span>
            )}
          </div>

          {/* Size + gender chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {formatSize(product.size)}
            </span>
            <span className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <GenderIcon className="h-3 w-3" />
              {genderLabel(product.gender)}
            </span>
          </div>

          {/* Add to cart */}
          <div className="mt-auto pt-3">
            {inStock ? (
              <button
                type="button"
                onClick={quickAdd}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
              </button>
            ) : (
              <span className="flex w-full items-center justify-center rounded-lg bg-muted py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
