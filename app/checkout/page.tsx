'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Gift, Loader2, Lock, Minus, Plus, Trash2, X } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'
import { useShopifyCheckout } from '@/lib/use-shopify-checkout'

const PROMO_PATTERN = /^[A-Za-z0-9_-]{1,40}$/

function dealCopy(count: number, freeCount: number) {
  const toNextFree = (3 - (count % 3)) % 3
  if (freeCount > 0 && toNextFree === 0) {
    return `Unlocked — ${freeCount} item${freeCount === 1 ? '' : 's'} FREE in your cart`
  }
  if (freeCount > 0) return `${freeCount} FREE unlocked · add ${toNextFree} more for another free item`
  if (count === 2) return 'Add 1 more and your cheapest item is FREE'
  if (count === 1) return 'Add 2 more and your cheapest item is FREE'
  return 'Buy any 2 fragrances, get 1 free'
}

export default function CheckoutPage() {
  const { items, rawSubtotal, discount, subtotal, freeCount, count, removeItem, setQuantity } = useCart()
  const { startCheckout, redirecting, checkoutError } = useShopifyCheckout()
  const [promoInput, setPromoInput] = useState('')
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)

  const progress = count === 0 ? 0 : count % 3 === 0 ? 3 : count % 3

  function applyPromo(e: React.FormEvent) {
    e.preventDefault()
    const code = promoInput.trim()
    if (!PROMO_PATTERN.test(code)) {
      setPromoError('Enter a valid promo code')
      return
    }
    setPromoError(null)
    setPromoCode(code.toUpperCase())
    setPromoInput('')
  }

  function proceedToShopify() {
    startCheckout(items, promoCode)
  }

  return (
    <main className="bg-secondary">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-shadow hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Continue shopping
        </Link>

        <h1 className="mt-8 text-3xl font-medium text-foreground md:text-4xl">Your Cart</h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-background px-6 py-16 text-center">
            <p className="text-lg text-foreground">Your cart is empty.</p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground"
            >
              Shop Fragrances
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-8">
            <div className="flex min-w-0 flex-col gap-4">
              <section aria-label="Buy 2 Get 1 Free progress" className="rounded-3xl bg-background p-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sale/10 text-sale">
                    <Gift className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Buy 2 Get 1 Free
                    </p>
                    <p className="text-pretty text-[15px] font-medium text-foreground">{dealCopy(count, freeCount)}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={progress}>
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${step <= progress ? 'bg-primary' : 'bg-secondary'}`}
                    />
                  ))}
                </div>
              </section>

              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 rounded-3xl bg-background p-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-secondary sm:h-28 sm:w-28">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-pretty text-[15px] font-medium leading-snug text-foreground sm:text-base">
                          {item.name}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="shrink-0 text-muted-foreground transition-colors hover:text-sale"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Size: {item.size}</p>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                        <span className="text-lg font-semibold text-sale">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-4 text-center text-sm font-medium text-foreground" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 20}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <aside aria-label="Order summary" className="rounded-3xl bg-background p-6 lg:sticky lg:top-28">
              <form onSubmit={applyPromo} className="flex items-center gap-2 rounded-full bg-secondary p-1.5 pl-5">
                <label htmlFor="promo" className="sr-only">
                  Promo code
                </label>
                <input
                  id="promo"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo code"
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Apply
                </button>
              </form>
              {promoError && <p className="mt-2 px-2 text-xs text-sale">{promoError}</p>}
              {promoCode && (
                <div className="mt-3 flex items-center justify-between gap-2 rounded-full border border-border px-4 py-2 text-xs text-foreground">
                  <span>
                    Code <strong className="font-semibold">{promoCode}</strong> will be applied at checkout
                  </span>
                  <button onClick={() => setPromoCode(null)} aria-label="Remove promo code" className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <h2 className="mt-6 text-base font-semibold text-foreground">Order Summary</h2>
              <dl className="mt-3 flex flex-col gap-2 text-sm">
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
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="text-foreground">Calculated at checkout</dd>
                </div>
              </dl>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                <span className="text-base font-medium text-foreground">Total</span>
                <span className="text-xl font-semibold text-foreground">{formatPrice(subtotal)}</span>
              </div>

              {checkoutError && (
                <div className="mt-5 rounded-2xl border border-sale/40 bg-sale/5 p-4 text-sm text-sale">{checkoutError}</div>
              )}

              <button
                onClick={proceedToShopify}
                disabled={redirecting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {redirecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Proceeding…
                  </>
                ) : (
                  <>Checkout · {formatPrice(subtotal)}</>
                )}
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Secure encrypted checkout
              </p>
            </aside>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}
