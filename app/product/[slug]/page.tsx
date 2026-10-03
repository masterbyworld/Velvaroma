import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductDetail } from '@/components/product-detail'
import { UrgencySection } from '@/components/urgency-section'
import { ProductTabs } from '@/components/product-tabs'
import { HappyCustomers } from '@/components/happy-customers'
import { WhyVelvaroma } from '@/components/why-velvaroma'
import { FragranceCollection } from '@/components/fragrance-collection'
import { RelatedByBrand } from '@/components/related-by-brand'
import { VideoRatings } from '@/components/video-ratings'
import { RecentlyViewed } from '@/components/recently-viewed'
import { InstagramSupport } from '@/components/instagram-support'
import { getProduct, products, relatedProducts } from '@/lib/products'

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return { title: 'Not Found — Velvaroma' }
  return {
    title: `${product.name} — ${product.inspiredBy} | Velvaroma`,
    description: product.description,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const related = relatedProducts(slug, 8)

  return (
    <main>
      <SiteHeader />
      <ProductDetail product={product} />
      <UrgencySection />
      <ProductTabs product={product} />
      <section id="reviews">
        <HappyCustomers />
      </section>
      <WhyVelvaroma />
      <FragranceCollection showOffer={false} />
      <RelatedByBrand products={related} brand={product.brand} />
      <VideoRatings />
      <RecentlyViewed currentSlug={slug} />
      <InstagramSupport />
      <SiteFooter />
    </main>
  )
}
