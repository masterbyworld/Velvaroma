'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Plus, ShoppingBag, Star } from 'lucide-react'
import { winningProducts, discountPercent, formatPrice, type Product } from '@/lib/products'
import { useQuickAdd } from '@/lib/use-quick-add'
import { useLiveStock } from '@/lib/use-live-stock'

const GLASS =
  'border border-background/10 bg-background/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]'

function SaleBadge({ off, size = 'md' }: { off: number; size?: 'sm' | 'md' }) {
  if (off <= 0) return null
  return (
    <span
      className={`absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-sale font-semibold tracking-wide text-background shadow-lg shadow-sale/30 ${
        size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
      }`}
    >
      -{off}%
    </span>
  )
}

export function WinningProducts() {
  const quickAddToCart = useQuickAdd()
  const { isInStock } = useLiveStock()
  // Never feature out-of-stock products on the homepage (live stock aware).
  const available = winningProducts.filter((p) => isInStock(p.whiteSku, p.inStock))
  const [hero, ...rest] = available
  const runners = rest.slice(0, 4)

  if (!hero) return null

  function add(p: Product) {
    quickAddToCart(p)
  }

  const heroOff = discountPercent(hero)
  const heroSaving = hero.compareAt - hero.price

  return (
    <section className="relative overflow-hidden bg-foreground py-20 text-background md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.35em] text-highlight">
              <span className="h-px w-8 bg-highlight" aria-hidden="true" />
              Best of Velvaroma
            </p>
            <h2 className="text-balance text-4xl font-light leading-none tracking-tight md:text-6xl">
              Our Winning <span className="font-semibold italic">Products</span>
            </h2>
          </div>
          <div className="flex max-w-sm flex-col gap-4 md:items-end md:text-right">
            <p className="text-pretty leading-relaxed text-background/60">
              The scents our customers reorder the most — proven performers with unbeatable value.
            </p>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-background/80 transition-colors hover:text-highlight"
            >
              Shop all
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:mt-16 lg:grid-cols-12">
          {/* Spotlight: #1 best seller */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative flex flex-col overflow-hidden rounded-3xl p-3 sm:flex-row lg:col-span-7 ${GLASS}`}
          >
            <Link
              href={`/product/${hero.slug}`}
              className="relative block aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-background sm:aspect-auto sm:w-[55%]"
              aria-label={`View ${hero.name}`}
            >
              <SaleBadge off={heroOff} />
              <Image
                src={hero.image || '/placeholder.svg'}
                alt={hero.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 55vw, 35vw"
                className="object-contain p-8 transition-transform duration-700 ease-out group-hover:scale-110"
              />
            </Link>

            <div className="flex flex-1 flex-col justify-between gap-8 p-5 sm:p-7">
              <div className="flex flex-col gap-4">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-highlight/40 bg-highlight/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-highlight">
                  <Star className="h-3 w-3 fill-highlight" aria-hidden="true" />
                  #1 Best Seller
                </span>
                <h3 className="text-balance text-3xl font-light leading-tight tracking-tight md:text-4xl">
                  {hero.name}
                </h3>
                {hero.inspiredBy && (
                  <p className="text-sm leading-relaxed text-background/50">{hero.inspiredBy}</p>
                )}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-highlight text-highlight" aria-hidden="true" />
                  ))}
                  <span className="ml-2 text-xs text-background/50">{hero.reviews} reviews</span>
                  <span className="sr-only">Rated 5 out of 5</span>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1 border-t border-background/10 pt-6">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="whitespace-nowrap text-3xl font-semibold tracking-tight xl:text-4xl">
                      {formatPrice(hero.price)}
                    </span>
                    {hero.compareAt > hero.price && (
                      <span className="whitespace-nowrap text-base text-background/40 line-through decoration-background/40">
                        {formatPrice(hero.compareAt)}
                      </span>
                    )}
                  </div>
                  {heroSaving > 0 && (
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-highlight">
                      You save {formatPrice(heroSaving)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <button
                    type="button"
                    onClick={() => add(hero)}
                    className="group/btn relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-background px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-foreground transition-all duration-300 hover:bg-highlight hover:shadow-lg hover:shadow-highlight/25 active:scale-[0.97]"
                  >
                    <ShoppingBag className="h-4 w-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:rotate-[-8deg]" />
                    Add to Cart
                  </button>
                  <Link
                    href={`/product/${hero.slug}`}
                    className="group/link inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-background/20 px-6 py-3.5 text-sm font-medium uppercase tracking-wider text-background transition-all duration-300 hover:border-background/60 hover:bg-background/10 active:scale-[0.97]"
                  >
                    View Details
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Companion cards */}
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-3">
            {runners.map((p, i) => {
              const off = discountPercent(p)
              return (
                <motion.li
                  key={p.slug}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={`group relative flex items-center gap-4 rounded-2xl p-2.5 transition-colors duration-300 hover:border-background/25 hover:bg-background/[0.07] ${GLASS}`}
                >
                  <Link
                    href={`/product/${p.slug}`}
                    className="relative block aspect-square w-28 shrink-0 overflow-hidden rounded-xl bg-background md:w-32"
                    aria-label={`View ${p.name}`}
                  >
                    <SaleBadge off={off} size="sm" />
                    <Image
                      src={p.image || '/placeholder.svg'}
                      alt={p.name}
                      fill
                      sizes="128px"
                      className="object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-2 py-1 pr-2">
                    <Link href={`/product/${p.slug}`} className="min-w-0">
                      <h3 className="line-clamp-1 text-sm font-medium uppercase tracking-wider transition-colors group-hover:text-highlight">
                        {p.name}
                      </h3>
                      {p.inspiredBy && (
                        <p className="line-clamp-1 text-xs leading-relaxed text-background/45">
                          {p.inspiredBy}
                        </p>
                      )}
                    </Link>

                    <div className="flex items-end justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="whitespace-nowrap text-lg font-semibold tracking-tight">{formatPrice(p.price)}</span>
                        {p.compareAt > p.price && (
                          <span className="hidden whitespace-nowrap text-xs text-background/40 line-through sm:inline">{formatPrice(p.compareAt)}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/product/${p.slug}`}
                          aria-label={`View details for ${p.name}`}
                          className="group/link flex h-9 w-9 items-center justify-center rounded-full border border-background/15 text-background/70 transition-all duration-300 hover:border-background/50 hover:text-background active:scale-90"
                        >
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => add(p)}
                          aria-label={`Add ${p.name} to cart`}
                          className="group/btn flex h-9 items-center gap-1.5 overflow-hidden rounded-full bg-background px-3 text-xs font-semibold uppercase tracking-wider text-foreground transition-all duration-300 hover:bg-highlight hover:shadow-md hover:shadow-highlight/25 active:scale-95"
                        >
                          <Plus className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:rotate-90" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
