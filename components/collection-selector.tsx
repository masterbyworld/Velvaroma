import { CollectionPicker } from '@/components/collection-picker'

export function CollectionSelector() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <CollectionPicker
        defaultBrand="Creed"
        heading="Shop by Collection"
        showOffer={false}
        description="Explore authentic fragrances crafted by world-renowned perfume houses. Switch between houses below to discover their signature scents."
      />
    </section>
  )
}
