'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Gift, Truck } from 'lucide-react'

export function OfferShowcase() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-4 md:px-8">
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
      className={`relative isolate w-full overflow-hidden rounded-[2rem] border border-background/10 bg-gradient-to-br from-foreground via-primary to-foreground p-2 text-background shadow-2xl shadow-foreground/30 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-sale/25 blur-3xl"
      />

      <motion.div variants={item} className="flex items-center justify-between gap-3 px-4 pb-1 pt-4 sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-background/15 bg-background/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-background/80 backdrop-blur">
          <Gift className="h-3.5 w-3.5 text-sale" aria-hidden="true" />
          Bundle Deal
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50">Buy 2 Get 1</span>
      </motion.div>

      <div className="flex items-stretch justify-center gap-1.5 px-2 py-5 sm:gap-3 sm:px-5">
        <BottleCard variants={item} title="Bottle 1" sub="Premium Scent" />
        <Operator variants={item} symbol="+" />
        <BottleCard variants={item} title="Bottle 2" sub="Premium Scent" />
        <Operator variants={item} symbol="=" />
        <BottleCard variants={item} title="Bottle 3" sub="100% Free" free />
      </div>

      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-[1.5rem] border border-background/10 bg-background/5 px-4 py-3 text-center text-xs backdrop-blur sm:text-sm"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sale/15">
          <Truck className="h-4 w-4 text-sale" aria-hidden="true" />
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
      className="flex shrink-0 items-center text-lg font-light text-background/40 sm:text-2xl"
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
      whileHover={{ y: -6, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      className={`group relative flex min-w-0 flex-1 cursor-default flex-col items-center gap-3 rounded-[1.5rem] px-2 pb-4 pt-5 text-center transition-colors duration-300 sm:max-w-36 ${
        free
          ? 'bg-sale text-white shadow-lg shadow-sale/40 ring-1 ring-white/20'
          : 'border border-background/10 bg-background/5 hover:border-background/30 hover:bg-background/10'
      }`}
    >
      {free && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-background px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-sale shadow">
          Free
        </span>
      )}

      <BottleShape free={free} />

      <div className="flex min-w-0 flex-col items-center">
        <span className="text-sm font-bold sm:text-base">{title}</span>
        <span
          className={`mt-0.5 text-[10px] font-medium uppercase tracking-wider ${
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
      <div className={`h-2.5 w-4 rounded-t-md ${free ? 'bg-white' : 'bg-background/60'}`} />
      <div className={`h-1 w-2 ${free ? 'bg-white/70' : 'bg-background/30'}`} />
      <div
        className={`flex h-10 w-8 items-center justify-center rounded-xl border sm:h-12 sm:w-10 ${
          free ? 'border-white/50 bg-white/20' : 'border-background/25 bg-background/10'
        }`}
      >
        <div className={`h-3 w-4 rounded-sm sm:w-5 ${free ? 'bg-white/80' : 'bg-background/30'}`} />
      </div>
    </div>
  )
}
