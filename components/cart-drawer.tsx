'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Gift, Loader2, Lock, Minus, Plus, RotateCcw, Trash2, X } from 'lucide-react'
import { useCart, type CartItem } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'
import { useShopifyCheckout } from '@/lib/use-shopify-checkout'

const MAX_QTY = 20

function dealCopy(count: number, freeCount: number) {
  const toNextFree = (3 - (count % 3)) % 3
  if (freeCount > 0 && toNextFree === 0) return `Unlocked: ${freeCount} item${freeCount === 1 ? '' : 's'} FREE`
  if (freeCount > 0) return `${freeCount} FREE · add ${toNextFree} more for another`
  if (count === 2) return 'Add 1 more and your cheapest item is FREE'
  if (count === 1) return 'Add 2 more and your cheapest item is FREE'
  return 'Buy any 2 fragrances, get 1 free'
}

/** Mirrors the cart's deal logic: the cheapest units in the cart are the free ones. */
function freeUnitsByItem(items: CartItem[], freeCount: number) {
  const units = items.flatMap((i) => Array.from({ length: i.quantity }, () => ({ id: i.id, price: i.price })))
  units.sort((a, b) => a.price - b.price)
  const map = new Map<string, number>()
  for (const u of units.slice(0, freeCount)) map.set(u.id, (map.get(u.id) ?? 0) + 1)
  return map
}

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity, addItem, subtotal, rawSubtotal, discount, count, freeCount } =
    useCart()
  const { startCheckout, redirecting, checkoutError } = useShopifyCheckout()
  const [removed, setRemoved] = useState<CartItem[] | null>(null)

  const freeMap = useMemo(() => freeUnitsByItem(items, freeCount), [items, freeCount])
  const progress = count === 0 ? 0 : count % 3 === 0 ? 3 : count % 3
  const toNextFree = (3 - (count % 3)) % 3

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  useEffect(() => {
    if (!removed) return
    const t = setTimeout(() => setRemoved(null), 5000)
    return () => clearTimeout(t)
  }, [removed])

  function remove(list: CartItem[]) {
    list.forEach((i) => removeItem(i.id))
    setRemoved(list)
  }

  function undoRemove() {
    removed?.forEach(({ quantity, ...rest }) => addItem(rest, quantity))
    setRemoved(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px]"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-secondary shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-medium text-foreground">Your Cart</h2>
                {count > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    {count}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {items.length > 1 && (
                  <button
                    onClick={() => remove(items)}
                    className="rounded-full px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-sale"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={closeCart}
                  aria-label="Close cart"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-shadow hover:shadow-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            {items.length > 0 && (
              <section aria-label="Buy 2 Get 1 Free progress" className="mx-5 mb-3 rounded-3xl bg-background p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sale/10 text-sale">
                    <Gift className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Buy 2 Get 1 Free
                    </p>
                    <p className="text-pretty text-sm font-medium text-foreground">{dealCopy(count, freeCount)}</p>
                  </div>
                  {toNextFree > 0 && (
                    <Link
                      href="/shop"
                      onClick={closeCart}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      Add <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  )}
                </div>
                <div
                  className="mt-3 flex gap-1.5"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={3}
                  aria-valuenow={progress}
                >
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                        step <= progress ? (step === 3 ? 'bg-sale' : 'bg-primary') : 'bg-secondary'
                      }`}
                    />
                  ))}
                </div>
              </section>
            )}

            <div className="flex-1 overflow-y-auto px-5 pb-3">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <p className="text-xl text-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground">Discover your next signature scent.</p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="mt-3 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Shop Fragrances
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const free = freeMap.get(item.id) ?? 0
                      return (
                        <motion.li
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
                          className="flex gap-3 rounded-3xl bg-background p-3"
                        >
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-secondary">
                            <Image
                              src={item.image || '/placeholder.svg'}
                              alt={item.name}
                              fill
                              sizes="96px"
                              className="object-contain p-2"
                            />
                            {free > 0 && (
                              <span className="absolute left-1.5 top-1.5 rounded-full bg-sale px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                                {free > 1 ? `${free}× Free` : 'Free'}
                              </span>
                            )}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/product/${item.slug}`}
                                onClick={closeCart}
                                className="line-clamp-2 text-pretty text-sm font-medium leading-snug text-foreground hover:underline"
                              >
                                {item.name}
                              </Link>
                              <button
                                onClick={() => remove([item])}
                                aria-label={`Remove ${item.name}`}
                                className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-sale/10 hover:text-sale"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">Size: {item.size}</p>
                            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                              <span className="text-base font-semibold text-sale">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              <div className="flex items-center gap-1.5 rounded-full bg-secondary p-1">
                                <button
                                  onClick={() => setQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  aria-label={`Decrease quantity of ${item.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background disabled:opacity-40"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="min-w-5 text-center text-sm font-medium tabular-nums text-foreground" aria-live="polite">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => setQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= MAX_QTY}
                                  aria-label={`Increase quantity of ${item.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            <AnimatePresence>
              {removed && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  role="status"
                  className="mx-5 mb-3 flex items-center justify-between gap-3 rounded-full bg-foreground px-5 py-2.5 text-sm text-background"
                >
                  <span className="truncate">
                    {removed.length === 1 ? `Removed ${removed[0].name}` : `Removed ${removed.length} items`}
                  </span>
                  <button onClick={undoRemove} className="flex shrink-0 items-center gap-1 font-semibold underline-offset-4 hover:underline">
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Undo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {items.length > 0 && (
              <footer className="rounded-t-3xl bg-background px-5 pb-5 pt-4 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.12)]">
                <dl className="flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">
                      Subtotal ({count} item{count === 1 ? '' : 's'})
                    </dt>
                    <dd className="text-foreground">{formatPrice(rawSubtotal)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between gap-4 font-medium text-sale">
                      <dt>Buy 2 Get 1 Free · {freeCount} free</dt>
                      <dd>−{formatPrice(discount)}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-base font-medium text-foreground">Total</span>
                  <span className="text-xl font-semibold text-foreground">{formatPrice(subtotal)}</span>
                </div>

                {checkoutError && (
                  <p className="mt-3 rounded-2xl border border-sale/40 bg-sale/5 p-3 text-xs text-sale">{checkoutError}</p>
                )}

                <button
                  onClick={() => startCheckout(items)}
                  disabled={redirecting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {redirecting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Proceeding…
                    </>
                  ) : (
                    <>Checkout · {formatPrice(subtotal)}</>
                  )}
                </button>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    View cart &amp; add promo code
                  </Link>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Lock className="h-3 w-3" aria-hidden="true" /> Secure checkout
                  </span>
                </div>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
