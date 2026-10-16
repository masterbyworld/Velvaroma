import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ContactView } from '@/components/contact-view'

export const metadata: Metadata = {
  title: 'Contact — Velvaroma Fragrance',
  description: 'Get in touch with the Velvaroma team. Email support and live chat.',
}

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />
      <ContactView />
      <SiteFooter />
    </main>
  )
}
