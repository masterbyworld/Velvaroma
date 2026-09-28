'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, Search } from 'lucide-react'
import { collections, productsByRouteKey, type CollectionInfo } from '@/lib/products'
import { useLiveStock } from '@/lib/use-live-stock'
import { ProductCard } from '@/components/product-card'

function matches(c: CollectionInfo, query: string) {
  return c.displayName.toLowerCase().includes(query.trim().toLowerCase())
}

// A brand/house browser: a searchable dropdown up top and a row of horizontal
// pills below share one selection, so switching in either instantly updates
// the other and the product grid.
export function CollectionPicker({
  defaultBrand,
  eyebrow = 'Select Your Brand Fragrance',
  heading,
  description,
  limit = 10,
  showOffer = true,
  as: HeadingTag = 'h2',
}: {
  defaultBrand: string
  eyebrow?: string
  heading: string
  description?: string
  limit?: number
  showOffer?: boolean
  as?: 'h1' | 'h2'
}) {
  const ordered = useMemo(
    () =>
      [...collections].sort((a, b) => {
        if (a.brand === defaultBrand) return -1
        if (b.brand === defaultBrand) return 1
        return b.count - a.count
      }),
    [defaultBrand],
  )

  const [activeKey, setActiveKey] = useState(ordered[0]?.key ?? '')
  const [open, setOpen] = useState(false)
  const [menuQuery, setMenuQuery] = useState('')
  const [pillQuery, setPillQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const pillRowRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const { isInStock } = useLiveStock()

  const active = ordered.find((c) => c.key === activeKey) ?? ordered[0]
  const available = active
    ? productsByRouteKey(active.key).filter((p) => isInStock(p.whiteSku, p.inStock))
    : []
  const items = available.slice(0, limit)
  const menuOptions = ordered.filter((c) => matches(c, menuQuery))
  const pillOptions = ordered.filter((c) => matches(c, pillQuery))

  function select(key: string) {
    setActiveKey(key)
    setOpen(false)
    setMenuQuery('')
  }

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Keep the active pill in view when the selection changes from the dropdown.
  useEffect(() => {
    const row = pillRowRef.current
    const pill = row?.querySelector<HTMLElement>(`[data-key="${activeKey}"]`)
    if (row && pill) row.scrollTo({ left: pill.offsetLeft - row.offsetLeft - 16 })
  }, [activeKey])

  if (!active) return null

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-highlight">{eyebrow}</p>
        )}
        <HeadingTag className="mt-3 text-balance text-4xl font-bold uppercase tracking-tight text-foreground md:text-6xl">
          {heading}
        </HeadingTag>
        {description && (
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">{description}</p>
        )}
        {showOffer && (
          <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full bg-sale px-6 py-2 text-sm text-primary-foreground">
            <span className="font-bold uppercase tracking-wide">Special Offer</span>
            <span>Buy 2, Get 1 free auto-applied at checkout</span>
          </p>
        )}
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        <div ref={menuRef} className="relative w-full max-w-2xl">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-6 py-5 text-left shadow-sm hover:border-foreground"
          >
            <span className="flex flex-col gap-1">
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Selected brand
              </span>
              <span className="text-xl font-semibold text-foreground">{active.displayName}</span>
            </span>
            <ChevronDown className={`h-5 w-5 shrink-0 text-foreground ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          {open && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              <label className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Search brands</span>
                <input
                  autoFocus
                  value={menuQuery}
                  onChange={(e) => setMenuQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing || e.keyCode === 229) return
                    if (e.key === 'Enter' && menuOptions[0]) select(menuOptions[0].key)
                  }}
                  placeholder="Search brand..."
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>
              <ul id={listboxId} role="listbox" aria-label="Brands" className="max-h-72 overflow-auto py-1">
                {menuOptions.length === 0 && (
                  <li className="px-5 py-3 text-sm text-muted-foreground">No brands found</li>
                )}
                {menuOptions.map((c) => {
                  const selected = c.key === active.key
                  return (
                    <li key={c.key} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        onClick={() => select(c.key)}
                        className={`flex w-full items-center justify-between gap-2 px-5 py-2.5 text-left text-sm hover:bg-muted ${
                          selected ? 'font-semibold text-foreground' : 'text-foreground/80'
                        }`}
                      >
                        <span>
                          {c.displayName}
                          <span className="ml-2 text-xs text-muted-foreground">({c.count})</span>
                        </span>
                        {selected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        <p className="flex flex-wrap items-center justify-center gap-2 text-base text-muted-foreground" aria-live="polite">
          Now viewing
          <span className="rounded-full border border-foreground px-4 py-1 text-sm font-bold uppercase tracking-wide text-foreground">
            {active.displayName}
          </span>
          <span className="text-sm">({active.count} scents available)</span>
        </p>
      </div>

      <div className="mt-14 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-foreground">
          Switch brand house <span className="font-semibold">({ordered.length} houses)</span>
        </p>
        <label className="flex w-full items-center gap-3 rounded-full border border-border bg-background px-5 py-3 focus-within:border-foreground md:max-w-md">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Find house</span>
          <input
            value={pillQuery}
            onChange={(e) => setPillQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === 'Enter' && pillOptions[0]) setActiveKey(pillOptions[0].key)
            }}
            placeholder="Find house..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div
        ref={pillRowRef}
        role="tablist"
        aria-label="Brand houses"
        className="no-scrollbar -mx-4 mt-6 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0"
      >
        {pillOptions.length === 0 && (
          <p className="py-3 text-sm text-muted-foreground">No houses match &ldquo;{pillQuery}&rdquo;</p>
        )}
        {pillOptions.map((c) => {
          const selected = c.key === active.key
          return (
            <button
              key={c.key}
              data-key={c.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveKey(c.key)}
              className={`flex h-12 shrink-0 items-center gap-3 rounded-full border px-6 text-base font-medium ${
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-foreground'
              }`}
            >
              {c.displayName}
              <span
                className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  selected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {c.count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border pb-5">
        <h3 className="text-2xl font-bold uppercase tracking-tight text-foreground">
          {active.displayName} Fragrance Line
        </h3>
        <span className="text-sm text-muted-foreground">
          Showing {items.length} product{items.length === 1 ? '' : 's'}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
          {items.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-muted-foreground">
          This house is restocking — check back soon or switch to another brand.
        </p>
      )}

      <div className="mt-12 flex justify-center">
        <Link
          href={`/shop?c=${active.key}`}
          className="inline-flex h-14 items-center gap-3 rounded-full bg-primary px-10 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
        >
          View all {active.displayName} products ({active.count}) <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
