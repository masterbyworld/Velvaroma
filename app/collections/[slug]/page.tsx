import { notFound, redirect } from 'next/navigation'
import { collectionsCatalog } from '@/lib/products'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default async function CollectionSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = collectionsCatalog.find(
    (c) => slugify(c.brand) === slug || c.key.toLowerCase() === slug.toLowerCase(),
  )
  if (!collection) notFound()
  redirect(`/shop?c=${collection.key}`)
}
