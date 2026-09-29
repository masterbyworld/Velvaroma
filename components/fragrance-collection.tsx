'use client'

import { useMemo, useRef, useState, type PointerEvent } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Gift } from 'lucide-react'
import { collections, type CollectionInfo } from '@/lib/products'

const GLASS =
  'border border-background/10 bg-background/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]'

const SPOTLIGHT_BRANDS = ['YSL', 'Tom Ford', 'Creed', 'Chanel']

type Filter = 'popular' | 'a-z'

function initials(name: string) {
  const words = name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean)
  if (words.length === 1) {
    const w = words[0]
    return w.length <= 3 && w === w.toUpperCase() ? w : w[0].toUpperCase()
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function SpotlightCard({ c, index }: { c: CollectionInfo; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="flex"
    >
      <Link
        href={`/shop?c=${c.key}`}
        className={`group relative flex w-full flex-col justify-between gap-8 overflow-hidden rounded-2xl p-4 transition-all sm:gap-10 sm:rounded-3xl sm:p-6 duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:border-highlight/50 hover:shadow-2xl hover:shadow-highlight/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight md:p-7 ${GLASS}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 -right-2 select-none text-8xl font-semibold leading-none tracking-tighter text-background/[0.05] transition-colors duration-500 group-hover:text-highlight/15 md:text-9xl"
        >
          {initials(c.displayName)}
        </span>

        <div className="relative flex items-start justify-between gap-4">
          <span className="rounded-full border border-background/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-background/60 sm:px-3 sm:text-[11px]">
            House
          </span>
          <span className="flex h-8 w-8 items-center sm:h-10 sm:w-10 justify-center rounded-full border border-background/15 text-background/70 transition-all duration-500 group-hover:rotate-45 group-hover:border-highlight group-hover:bg-highlight group-hover:text-highlight-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="relative flex flex-col gap-2">
          <h3 className="text-balance text-2xl font-light sm:text-3xl leading-none tracking-tight md:text-4xl">{c.displayName}</h3>
          <p className="text-sm text-background/55">
            <span className="font-semibold text-highlight">{c.count}</span> signature scents
          </p>
        </div>
      </Link>
    </motion.li>
  )
}

export function FragranceCollection() {
  const [filter, setFilter] = useState<Filter>('popular')
  const railRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })

  const spotlight = useMemo(() => {
    const picked = SPOTLIGHT_BRANDS.map((name) =>
      collections.find((c) => c.displayName.toLowerCase() === name.toLowerCase()),
    ).filter((c): c is CollectionInfo => Boolean(c))
    if (picked.length >= 4) return picked
    const extra = [...collections]
      .sort((a, b) => b.count - a.count)
      .filter((c) => !picked.includes(c))
    return [...picked, ...extra].slice(0, 4)
  }, [])

  const railItems = useMemo(() => {
    const list = [...collections]
    return filter === 'popular'
      ? list.sort((a, b) => b.count - a.count)
      : list.sort((a, b) => a.displayName.localeCompare(b.displayName))
  }, [filter])

  function scrollRail(dir: 1 | -1) {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse' || !railRef.current) return
    drag.current = { active: true, startX: e.clientX, scrollLeft: railRef.current.scrollLeft, moved: false }
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const el = railRef.current
    if (!drag.current.active || !el) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 5) drag.current.moved = true
    el.scrollLeft = drag.current.scrollLeft - dx
  }

  function endDrag() {
    drag.current.active = false
  }

  return (
    <section
      aria-labelledby="fragrance-collection-heading"
      className="relative overflow-hidden bg-foreground py-20 text-background md:py-28"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 md:gap-16 md:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            className={`inline-flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 text-xs md:text-sm ${GLASS}`}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sale px-3 py-1 font-semibold uppercase tracking-wider text-background">
              <Gift className="h-3.5 w-3.5" aria-hidden="true" />
              Buy 2, Get 1 Free
            </span>
            <span className="text-background/70">Add any 3 — pay for only 2</span>
          </div>

          <h2
            id="fragrance-collection-heading"
            className="text-balance text-4xl font-light leading-none tracking-tight md:text-6xl"
          >
            The Fragrance <span className="font-semibold italic">Collection</span>
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-background/60">
            {collections.length} celebrated houses, reimagined. Choose a maison to explore its signature line —
            limited time offer at Velvaroma.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {spotlight.map((c, i) => (
            <SpotlightCard key={c.key} c={c} index={i} />
          ))}
        </ul>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-background/50">All houses</p>
              <div role="tablist" aria-label="Sort houses" className={`flex rounded-full p-1 ${GLASS}`}>
                {(
                  [
                    ['popular', 'Most loved'],
                    ['a-z', 'A – Z'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={filter === value}
                    onClick={() => {
                      setFilter(value)
                      railRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
                      filter === value
                        ? 'bg-background text-foreground shadow'
                        : 'text-background/60 hover:text-background'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollRail(-1)}
                aria-label="Scroll houses left"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-background/15 text-background/70 transition-all hover:border-highlight hover:bg-highlight hover:text-highlight-foreground active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(1)}
                aria-label="Scroll houses right"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-background/15 text-background/70 transition-all hover:border-highlight hover:bg-highlight hover:text-highlight-foreground active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-foreground to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-foreground to-transparent"
            />
            <div
              ref={railRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onClickCapture={(e) => {
                if (drag.current.moved) {
                  e.preventDefault()
                  e.stopPropagation()
                  drag.current.moved = false
                }
              }}
              className="flex cursor-grab snap-x gap-3 overflow-x-auto scroll-smooth px-1 py-2 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
            >
              {railItems.map((c) => (
                <Link
                  key={c.key}
                  href={`/shop?c=${c.key}`}
                  draggable={false}
                  className={`group flex shrink-0 snap-start items-center gap-3 rounded-full py-2 pl-5 pr-2 text-sm font-medium text-background/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-highlight/60 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight ${GLASS}`}
                >
                  <span className="whitespace-nowrap">{c.displayName}</span>
                  <span className="rounded-full bg-background/10 px-2.5 py-1 text-xs tabular-nums text-background/60 transition-colors duration-300 group-hover:bg-highlight group-hover:text-highlight-foreground">
                    {c.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 rounded-full bg-background py-2 pl-7 pr-2 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-highlight hover:text-highlight-foreground active:scale-[0.98]"
          >
            Shop All Collections
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
