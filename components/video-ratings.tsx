'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  Star,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { videos, formatPrice } from '@/lib/products'

type Reel = (typeof videos)[number]

function RatingBadge() {
  return (
    <div className="inline-flex w-fit items-center gap-3 self-start rounded-full border border-background/15 bg-background/5 py-2 pl-2 pr-4 backdrop-blur-md">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground">
        <BadgeCheck className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-highlight text-highlight" />
        ))}
      </span>
      <span className="text-xs font-medium text-background/90 md:text-sm">
        Rated 4.9/5 by 20,000+ happy customers
      </span>
    </div>
  )
}

function ReelCard({
  reel,
  index,
  onOpen,
}: {
  reel: Reel
  index: number
  onOpen: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative w-[68vw] shrink-0 snap-center sm:w-64 lg:w-[calc((100%-4.5rem)/4)]"
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-3xl border border-background/10 bg-background/5 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-background/35 group-hover:shadow-[0_0_48px_-8px] group-hover:shadow-background/25">
        <button
          type="button"
          onClick={onOpen}
          className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-background"
          aria-label={`Watch warehouse video ${index + 1} fullscreen`}
        />
        <video
          ref={videoRef}
          src={reel.src}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/50 via-transparent to-transparent" />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3">
          <span className="rounded-full border border-background/20 bg-foreground/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-background backdrop-blur-md">
            Reel {String(index + 1).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={togglePlay}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-background/20 bg-foreground/30 text-background backdrop-blur-md transition hover:bg-background hover:text-foreground"
            aria-label={playing ? 'Pause video' : 'Play video'}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="flex h-14 w-14 scale-75 items-center justify-center rounded-full border border-background/30 bg-background/15 text-background opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            <Maximize2 className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </motion.article>
  )
}

function ReelLightbox({
  index,
  onClose,
  onStep,
}: {
  index: number
  onClose: () => void
  onStep: (delta: number) => void
}) {
  const reel = videos[index]
  const videoRef = useRef<HTMLVideoElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [muted, setMuted] = useState(false)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onStep])

  useEffect(() => {
    setPlaying(true)
    const video = videoRef.current
    if (!video) return
    video.play().catch(() => {
      video.muted = true
      setMuted(true)
      void video.play()
    })
  }, [index])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  const controlClass =
    'flex h-11 w-11 items-center justify-center rounded-full border border-background/20 bg-background/10 text-background backdrop-blur-md transition hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background'

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Warehouse video ${index + 1} of ${videos.length}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-xl"
      onClick={onClose}
    >
      <button ref={closeRef} type="button" onClick={onClose} className={`${controlClass} absolute right-4 top-4`} aria-label="Close video">
        <X className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onStep(-1)
        }}
        className={`${controlClass} absolute left-4 top-1/2 hidden -translate-y-1/2 md:flex`}
        aria-label="Previous video"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onStep(1)
        }}
        className={`${controlClass} absolute right-4 top-1/2 hidden -translate-y-1/2 md:flex`}
        aria-label="Next video"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <motion.div
        key={reel.src}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative aspect-[9/16] h-[min(86vh,calc((100vw-2rem)*16/9))] overflow-hidden rounded-3xl border border-background/20 shadow-[0_0_80px_-10px] shadow-background/20"
      >
        <video
          ref={videoRef}
          src={reel.src}
          muted={muted}
          loop
          autoPlay
          playsInline
          onClick={togglePlay}
          className="h-full w-full cursor-pointer object-cover"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-foreground/85 to-transparent" />

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-background/60">
              {reel.product.brand} &middot; {index + 1}/{videos.length}
            </p>
            <Link
              href={`/product/${reel.product.slug}`}
              className="mt-1 line-clamp-1 text-base font-medium text-background underline-offset-4 hover:underline"
            >
              {reel.product.name}
            </Link>
            <p className="text-sm font-semibold text-background/85">{formatPrice(reel.product.price)}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={togglePlay} className={controlClass} aria-label={playing ? 'Pause video' : 'Play video'}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className={controlClass}
              aria-label={muted ? 'Unmute video' : 'Mute video'}
              aria-pressed={!muted}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function VideoRatings() {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false })
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [updateArrows])

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('article')
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !trackRef.current) return
    drag.current = { active: true, startX: e.clientX, startScroll: trackRef.current.scrollLeft, moved: false }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current
    if (!drag.current.active || !el) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 5 && !drag.current.moved) {
      drag.current.moved = true
      el.style.scrollSnapType = 'none'
      el.setPointerCapture(e.pointerId)
    }
    if (drag.current.moved) el.scrollLeft = drag.current.startScroll - dx
  }

  const endDrag = () => {
    const el = trackRef.current
    drag.current.active = false
    if (el) el.style.scrollSnapType = ''
  }

  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }

  const step = useCallback((delta: number) => {
    setOpenIndex((i) => (i === null ? i : (i + delta + videos.length) % videos.length))
  }, [])
  const close = useCallback(() => setOpenIndex(null), [])

  const arrowClass =
    'flex h-11 w-11 items-center justify-center rounded-full border border-background/20 text-background transition hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-30'

  return (
    <section aria-labelledby="warehouse-heading" className="overflow-hidden bg-foreground py-20 text-background md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-xl flex-col gap-5">
            <RatingBadge />
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-highlight">Unfiltered &amp; Unboxed</p>
              <h2 id="warehouse-heading" className="text-balance text-4xl font-semibold uppercase leading-none tracking-tight md:text-6xl">
                Straight From Our Warehouse
              </h2>
              <p className="text-pretty text-sm leading-relaxed text-background/60 md:text-base">
                Real bottles, real packing, real customers. Tap any reel to watch it fullscreen with sound.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => scrollByCard(-1)} disabled={!canPrev} className={arrowClass} aria-label="Scroll reels left">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => scrollByCard(1)} disabled={!canNext} className={arrowClass} aria-label="Scroll reels right">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={updateArrows}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
          className="-mx-4 mt-12 flex cursor-grab snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 select-none active:cursor-grabbing [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {videos.map((reel, i) => (
            <ReelCard key={reel.src} reel={reel} index={i} onOpen={() => setOpenIndex(i)} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 rounded-full border border-background/25 bg-background px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.25em] text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {openIndex !== null && <ReelLightbox index={openIndex} onClose={close} onStep={step} />}
      </AnimatePresence>
    </section>
  )
}
