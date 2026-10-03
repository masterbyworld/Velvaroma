import { Truck } from 'lucide-react'

export function OfferShowcase() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-4 md:px-8">
      <BundleOfferCard />
    </section>
  )
}

export function BundleOfferCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-full overflow-hidden rounded-2xl bg-foreground text-background ${className}`}
      role="group"
      aria-label="Buy 2 get 1 free offer"
    >
      <div className="flex items-center justify-center gap-2 px-3 py-5 sm:gap-4 sm:px-6">
        <Tile title="Bottle 1" sub="Premium Scent" className="min-w-0 flex-1 sm:max-w-32" />
        <span aria-hidden="true" className="text-xl font-light text-background/50 sm:text-2xl">+</span>
        <Tile title="Bottle 2" sub="Premium Scent" className="min-w-0 flex-1 sm:max-w-32" />
        <span aria-hidden="true" className="text-xl font-light text-background/50 sm:text-2xl">=</span>
        <Tile title="Bottle 3" sub="100% Free" highlight className="min-w-0 flex-1 sm:max-w-32" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-background/10 bg-background/5 px-3 py-3 text-center text-xs sm:text-sm">
        <Truck className="h-4 w-4 shrink-0 text-sale" aria-hidden="true" />
        <span className="font-bold uppercase tracking-wide">Free Express Shipping</span>
        <span className="uppercase tracking-wide text-background/60">On Buy 2 Get 1 Today</span>
      </div>
    </div>
  )
}

function Tile({
  title,
  sub,
  highlight = false,
  className = 'w-24 sm:w-32',
}: {
  title: string
  sub: string
  highlight?: boolean
  className?: string
}) {
  return (
    <div
      className={`flex ${className} flex-col items-center justify-center rounded-xl px-2 py-4 text-center ${
        highlight ? 'bg-sale text-white' : 'border border-background/15'
      }`}
    >
      <span className="text-sm font-bold sm:text-base">{title}</span>
      <span className={`mt-0.5 text-[10px] uppercase tracking-wider ${highlight ? 'text-white/80' : 'text-background/50'}`}>
        {sub}
      </span>
    </div>
  )
}
