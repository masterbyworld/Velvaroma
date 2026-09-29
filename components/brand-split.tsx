'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function BrandSplit() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="order-2 md:order-1"
      >
        <h2 className="text-balance text-4xl font-medium leading-tight text-foreground md:text-5xl">
          Define Your Presence with Tom Ford.
        </h2>
        <p className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
          Bold, provocative and unapologetically luxurious. Discover Tom Ford-inspired scents built on rich oud, velvet
          vanilla, warm amber and white florals — made for those who own every room they enter.
        </p>
        <Link
          href="/collections/tom-ford"
          className="mt-8 inline-flex bg-primary px-8 py-4 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          View Collection
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative order-1 aspect-square w-full overflow-hidden md:order-2"
      >
        <Image
          src="/images/tom-ford-fucking-fabulous.png"
          alt="Tom Ford Fucking Fabulous Eau de Parfum bottle surrounded by oud wood, white flowers, vanilla pods and amber"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain"
          priority
        />
      </motion.div>
    </section>
  )
}
