'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { PromoMarquee } from '@/components/promo-marquee'
import { SearchOverlay } from '@/components/search-overlay'

const nav = [
  { label: 'Home', href: '/' },
  { label: 'Catalog', href: '/shop' },
  { label: 'Shop With Brand', href: '/brands' },
  { label: 'Contact Us', href: '/contact' },
]

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Image
        src="/velvaroma-symbol.png"
        alt=""
        width={64}
        height={64}
        className={compact ? 'h-10 w-auto' : 'h-11 w-auto md:h-14'}
        priority={!compact}
      />
      <span
        className={`font-serif font-medium tracking-[0.24em] text-foreground ${compact ? 'text-xl' : 'text-xl md:text-2xl'}`}
      >
        VELVAROMA
      </span>
    </span>
  )
}

export function SiteHeader() {
  const { count, openCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="relative z-40">
      <PromoMarquee />

      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <button className="flex items-center lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex shrink-0 items-center" aria-label="Velvaroma home">
            <Brand />
          </Link>

          <div className="flex min-w-0 items-center gap-6 xl:gap-8">
            <nav className="hidden items-center gap-7 lg:flex xl:gap-9" aria-label="Main">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative whitespace-nowrap text-[15px] font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-12 w-64 items-center gap-3 rounded-full border border-border bg-background px-5 text-left text-sm text-muted-foreground transition-colors hover:border-foreground/30 lg:flex xl:w-80"
            >
              <Search className="h-5 w-5 shrink-0 text-foreground" aria-hidden="true" />
              <span className="truncate">{"I'm looking for..."}</span>
              <span className="sr-only">Open search</span>
            </button>

            <div className="flex shrink-0 items-center gap-4 sm:gap-6">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="text-foreground hover:text-muted-foreground lg:hidden"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link href="/contact" aria-label="Account" className="hidden text-foreground hover:text-muted-foreground sm:block">
                <User className="h-5 w-5" />
              </Link>
              <Link href="/shop" aria-label="Wishlist" className="hidden text-foreground hover:text-muted-foreground sm:block">
                <Heart className="h-5 w-5" />
              </Link>
              <button
                onClick={openCart}
                className="relative text-foreground hover:text-muted-foreground"
                aria-label={`Open cart, ${count} items`}
              >
                <ShoppingBag className="h-5 w-5" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold text-primary-foreground"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-1 bg-background p-6 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <Brand compact />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-6 w-6" />
                </button>
              </div>
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-border py-3.5 text-lg text-foreground transition-colors hover:text-muted-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
