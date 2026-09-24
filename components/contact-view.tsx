'use client'

import { motion } from 'framer-motion'
import { Mail, MessageCircle, Truck, ArrowUpRight, Clock } from 'lucide-react'

const SUPPORT_EMAIL = 'Support@velvaroma.com'
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  'Velvaroma Support Request',
)}&body=${encodeURIComponent('Hi Velvaroma team,\n\n')}`

function Facebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.03 1.46-4.03 4.14v2.31H7.85V13h2.71v8h2.94z" />
    </svg>
  )
}

function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

const highlights = [
  { icon: Clock, title: 'Fast Response', detail: 'We reply within 1–4 hours' },
  { icon: MessageCircle, title: 'Real People', detail: 'Fragrance experts, not bots' },
  { icon: Truck, title: 'Free Shipping', detail: 'On every order over $80' },
]

const socials = [
  { Icon: Instagram, label: 'Instagram', handle: '@velva_roma_shop', href: 'https://www.instagram.com/velva_roma_shop' },
  { Icon: Facebook, label: 'Facebook', handle: 'Velvaroma', href: 'https://web.facebook.com/profile.php?id=61593878290061#' },
]

export function ContactView() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">We&apos;re here to help</p>
        <h1 className="mt-4 text-balance text-4xl font-medium text-foreground md:text-6xl">Get In Touch</h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          Questions about an order, a scent, or a recommendation? Send us a message and our team will get back to you personally.
        </p>
      </motion.div>

      {/* Primary email action card */}
      <motion.a
        href={MAILTO}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="group relative mt-12 flex flex-col items-center overflow-hidden rounded-2xl bg-foreground px-6 py-14 text-center text-background md:px-12"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background/10 ring-1 ring-background/20 transition-transform duration-300 group-hover:scale-110">
          <Mail className="h-7 w-7" />
        </span>
        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-background/60">Email our support team</p>
        <p className="mt-3 font-serif text-2xl font-medium tracking-wide md:text-4xl">{SUPPORT_EMAIL}</p>
        <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-foreground transition-transform duration-300 group-hover:scale-[1.03]">
          Compose Message
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </motion.a>

      {/* Highlights */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {highlights.map((h, i) => (
          <motion.div
            key={h.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="flex flex-col items-center gap-3 rounded-xl border border-border p-6 text-center"
          >
            <h.icon className="h-6 w-6 text-foreground" />
            <p className="font-medium text-foreground">{h.title}</p>
            <p className="text-sm text-muted-foreground">{h.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* Social */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mt-8 grid gap-4 sm:grid-cols-2"
      >
        {socials.map(({ Icon, label, handle, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl border border-border p-6 transition-colors hover:border-foreground"
          >
            <span className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-left">
                <span className="block font-medium text-foreground">{label}</span>
                <span className="block text-sm text-muted-foreground">{handle}</span>
              </span>
            </span>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </a>
        ))}
      </motion.div>
    </div>
  )
}
