'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Gift, Pause, Play } from 'lucide-react'
import { collections, type CollectionInfo } from '@/lib/products'

const SPOTLIGHT_BRANDS = ['YSL', 'Tom Ford', 'Creed', 'Chanel']
const FEATURED_COUNT = 10
const AUTOPLAY_MS = 2000

type Filter = 'popular' | 'a-z'

function FeaturedCard({
  c,
  index,
  active,
  playing,
  onActivate,
  cardRef,
}: {
  c: CollectionInfo
  index: number
  active: boolean
  playing: boolean
  onActivate: () => void
  cardRef: (el: HTMLLIElement | null) => void
}) {
  return (
    <li
      ref={cardRef}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${FEATURED_COUNT}: ${c.displayName}`}
      className="flex shrink-0 snap-center py-3"
    >
      <Link
        href={`/shop?c=${c.key}`}
        draggable={false}
        onFocus={onActivate}
        onMouseEnter={onActivate}
        className={`group relative flex h-40 w-44 flex-col justify-between overflow-hidden rounded-2xl border-2 p-4 transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 sm:h-44 sm:w-52 sm:p-5 ${
          active
            ? 'scale-[1.04] border-foreground bg-foreground text-background shadow-xl shadow-foreground/15'
            : 'border-foreground/15 bg-background text-foreground hover:border-foreground'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-[10px] font-semibold uppercase tracking-[0.25em] transition-colors duration-500 ${
              active ? 'text-background/60' : 'text-foreground/50'
            }`}
          >
            {String(index + 1).padStart(2, '0')} / House
          </span>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 group-hover:rotate-45 ${
              active ? 'border-background bg-background text-foreground' : 'border-foreground/20 text-foreground'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-balance text-xl font-bold leading-tight tracking-tight sm:text-2xl">{c.displayName}</h3>
          <p className={`text-xs transition-colors duration-500 ${active ? 'text-background/70' : 'text-foreground/60'}`}>
            <span className="font-bold">{c.count}</span> signature scents
          </p>
        </div>

        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-background/15">
          {active && (
            <motion.span
              key={`${c.key}-${playing}`}
              className="block h-full origin-left bg-background"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: playing ? 1 : 0 }}
              transition={{ duration: playing ? AUTOPLAY_MS / 1000 : 0.2, ease: 'linear' }}
            />
          )}
        </span>
      </Link>
    </li>
  )
}

export function FragranceCollection() {
  const reduceMotion = useReducedMotion()
  const [filter, setFilter] = useState<Filter>('popular')
  const [active, setActive] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [inView, setInView] = useState(false)

  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const cardRefs = useRef<(HTMLLIElement | null)[]>([])
  const railRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })

  const featured = useMemo(() => {
    const picked = SPOTLIGHT_BRANDS.map((name) =>
      collections.find((c) => c.displayName.toLowerCase() === name.toLowerCase()),
    ).filter((c): c is CollectionInfo => Boolean(c))
    const rest = [...collections].sort((a, b) => b.count - a.count).filter((c) => !picked.includes(c))
    return [...picked, ...rest].slice(0, FEATURED_COUNT)
  }, [])

  const railItems = useMemo(() => {
    const list = [...collections]
    return filter === 'popular'
      ? list.sort((a, b) => b.count - a.count)
      : list.sort((a, b) => a.displayName.localeCompare(b.displayName))
  }, [filter])

  const playing = !userPaused && !hovering && inView && !reduceMotion

  const go = useCallback(
    (dir: 1 | -1) => setActive((i) => (i + dir + featured.length) % featured.length),
    [featured.length],
  )

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => go(1), AUTOPLAY_MS)
    return () => window.clearTimeout(id)
  }, [playing, active, go])

  useEffect(() => {
    const track = trackRef.current
    const card = cardRefs.current[active]
    if (!track || !card) return
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [active, reduceMotion])

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

  const controlBtn =
    'flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground text-foreground transition-all duration-300 hover:bg-foreground hover:text-background active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2'

  return (
    <section
      ref={sectionRef}
      aria-labelledby="fragrance-collection-heading"
      className="relative overflow-hidden bg-background py-16 text-foreground md:py-24"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 md:gap-12 md:px-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border-2 border-foreground py-1 pl-1 pr-4 text-xs md:text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sale px-3 py-1 font-bold uppercase tracking-wider text-background">
              <Gift className="h-3.5 w-3.5" aria-hidden="true" />
              Buy 2, Get 1 Free
            </span>
            <span className="font-medium text-foreground/70">Add any 3 — pay for only 2</span>
          </div>

          <h2
            id="fragrance-collection-heading"
            className="text-balance text-4xl font-bold uppercase leading-none tracking-tight md:text-6xl"
          >
            The Fragrance Collection
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-foreground/60">
            {collections.length} celebrated houses, reimagined. Choose a maison to explore its signature line —
            limited time offer at Velvaroma.
          </p>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured fragrance houses"
          className="flex flex-col gap-5"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em]">Featured houses</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? 'Play carousel' : 'Pause carousel'}
                className={controlBtn}
              >
                {userPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button type="button" onClick={() => go(-1)} aria-label="Previous house" className={controlBtn}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next house" className={controlBtn}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <ul
            ref={trackRef}
            aria-live={playing ? 'off' : 'polite'}
            className="flex gap-3 overflow-x-auto px-2 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
          >
            {featured.map((c, i) => (
              <FeaturedCard
                key={c.key}
                c={c}
                index={i}
                active={i === active}
                playing={playing}
                onActivate={() => setActive(i)}
                cardRef={(el) => {
                  cardRefs.current[i] = el
                }}
              />
            ))}
          </ul>

          <div className="flex justify-center gap-1.5" aria-hidden="true">
            {featured.map((c, i) => (
              <button
                key={c.key}
                type="button"
                tabIndex={-1}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === active ? 'w-8 bg-foreground' : 'w-1.5 bg-foreground/20 hover:bg-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t-2 border-foreground/10 pt-8">
          <div className="flex items-center gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em]">All houses</p>
            <div role="tablist" aria-label="Sort houses" className="flex rounded-full border-2 border-foreground p-0.5">
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
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
                    filter === value ? 'bg-foreground text-background' : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent"
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
              className="flex cursor-grab snap-x gap-2.5 overflow-x-auto scroll-smooth px-1 py-2 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
            >
              {railItems.map((c) => (
                <Link
                  key={c.key}
                  href={`/shop?c=${c.key}`}
                  draggable={false}
                  className="group flex shrink-0 snap-start items-center gap-2.5 rounded-full border-2 border-foreground/15 bg-background py-1.5 pl-4 pr-1.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                >
                  <span className="whitespace-nowrap">{c.displayName}</span>
                  <span className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs tabular-nums text-foreground/60 transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
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
            className="group inline-flex items-center gap-3 rounded-full bg-foreground py-2 pl-7 pr-2 text-sm font-bold text-background transition-all duration-300 hover:shadow-lg hover:shadow-foreground/20 active:scale-[0.98]"
          >
            Shop All Collections
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
