import { CollectionPicker } from '@/components/collection-picker'

export function CollectionsView() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <CollectionPicker
        as="h1"
        defaultBrand="Creed"
        heading="Shop by Collection"
        description="Explore authentic fragrances crafted by world-renowned perfume houses. Switch between houses below to discover their signature scents."
        limit={20}
      />
    </section>
  )
}
