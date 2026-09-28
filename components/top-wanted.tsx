import { CollectionPicker } from '@/components/collection-picker'

export function TopWanted() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <CollectionPicker
          defaultBrand="Louis Vuitton"
          eyebrow="Loved by thousands"
          heading="Top Wanted Collection"
          showOffer={false}
        />
      </div>
    </section>
  )
}
