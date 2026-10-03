'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Gift, Truck } from 'lucide-react'

export function OfferShowcase() {
  return (
    <section className="mx-auto w-full max-w-md px-4 py-3">
      <BundleOfferCard />
    </section>
  )
}

const EASE = [0.22, 1, 0.36, 1] as const

export function BundleOfferCard({ className = '' }: { className?: string }) {
  const reduceMotion = useReducedMotion()

  const container: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE, staggerChildren: reduceMotion ? 0 : 0.12, delayChildren: 0.15 },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.94 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
  }

  return (
    <motion.div
      role="group"
      aria-label="Buy 2 get 1 free offer"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className={`relative isolate w-full overflow-hidden rounded-3xl border border-background/10 bg-gradient-to-br from-foreground via-primary to-foreground p-1.5 text-background shadow-xl shadow-foreground/20 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-16 -z-10 h-40 w-40 rounded-full bg-sale/25 blur-3xl"
      />

      <motion.div variants={item} className="flex items-center justify-between gap-3 px-3 pt-2.5 sm:px-4">
        <span className="inline-flex items-center gap-1 rounded-full border border-background/15 bg-background/5 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-background/80 backdrop-blur">
          <Gift className="h-3 w-3 text-sale" aria-hidden="true" />
          Bundle Deal
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-background/50">Buy 2 Get 1</span>
      </motion.div>

      <div className="flex items-stretch justify-center gap-1 px-1.5 pb-2.5 pt-4 sm:gap-2 sm:px-3">
        <BottleCard variants={item} title="Bottle 1" sub="Premium Scent" />
        <Operator variants={item} symbol="+" />
        <BottleCard variants={item} title="Bottle 2" sub="Premium Scent" />
        <Operator variants={item} symbol="=" />
        <BottleCard variants={item} title="Bottle 3" sub="100% Free" free />
      </div>

      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 rounded-2xl border border-background/10 bg-background/5 px-3 py-2 text-center text-[10px] backdrop-blur sm:text-xs"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sale/15">
          <Truck className="h-3 w-3 text-sale" aria-hidden="true" />
        </span>
        <span className="font-bold uppercase tracking-wide">Free Express Shipping</span>
        <span className="uppercase tracking-wide text-background/60">On Buy 2 Get 1 Today</span>
      </motion.div>
    </motion.div>
  )
}

function Operator({ symbol, variants }: { symbol: string; variants: Variants }) {
  return (
    <motion.span
      variants={variants}
      aria-hidden="true"
      className="flex shrink-0 items-center text-base font-light text-background/40 sm:text-lg"
    >
      {symbol}
    </motion.span>
  )
}

function BottleCard({
  title,
  sub,
  free = false,
  variants,
}: {
  title: string
  sub: string
  free?: boolean
  variants: Variants
}) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      className={`group relative flex min-w-0 flex-1 cursor-default flex-col items-center gap-1.5 rounded-2xl px-1.5 pb-2 pt-3 text-center transition-colors duration-300 sm:max-w-28 ${
        free
          ? 'bg-sale text-white shadow-md shadow-sale/40 ring-1 ring-white/20'
          : 'border border-background/10 bg-background/5 hover:border-background/30 hover:bg-background/10'
      }`}
    >
      {free && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-background px-2 py-px text-[8px] font-bold uppercase tracking-widest text-sale shadow">
          Free
        </span>
      )}

      <BottleShape free={free} />

      <div className="flex min-w-0 flex-col items-center">
        <span className="text-xs font-bold sm:text-sm">{title}</span>
        <span
          className={`text-[9px] font-medium uppercase tracking-wider ${
            free ? 'text-white/85' : 'text-background/50'
          }`}
        >
          {sub}
        </span>
      </div>
    </motion.div>
  )
}

function BottleShape({ free }: { free: boolean }) {
  return (
    <div aria-hidden="true" className="flex flex-col items-center transition-transform duration-500 group-hover:-rotate-6">
      <div className={`h-2 w-3 rounded-t ${free ? 'bg-white' : 'bg-background/60'}`} />
      <div className={`h-0.5 w-1.5 ${free ? 'bg-white/70' : 'bg-background/30'}`} />
      <div
        className={`flex h-7 w-6 items-center justify-center rounded-lg border sm:h-8 sm:w-7 ${
          free ? 'border-white/50 bg-white/20' : 'border-background/25 bg-background/10'
        }`}
      >
        <div className={`h-2 w-3 rounded-sm sm:w-3.5 ${free ? 'bg-white/80' : 'bg-background/30'}`} />
      </div>
    </div>
  )
}
