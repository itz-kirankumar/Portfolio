import { Button, NotebookCard } from '@/components/ui/primitives'
import Reveal from '@/components/ui/Reveal'
import { Service, formatPrice, occupiedMins } from '@/lib/schemas/service'

export function ServicesList({ services }: { services: Service[] }) {
  if (!services.length) {
    return (
      <div className="text-center py-20 text-ink-soft">
        <p>No services currently available.</p>
      </div>
    )
  }

  return (
    <div className="mt-12 space-y-8">
      {services.map((service, i) => (
        <Reveal kind="up" delay={i * 90} key={service.id}>
          <NotebookCard>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                    <a href={`/services/${service.slug}`} className="hover:text-coral transition-colors">
                      {service.title}
                    </a>
                  </h3>
                  <span className="rounded-full bg-coral-soft px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-coral-ink">
                    {occupiedMins(service)} mins
                  </span>
                </div>

                <p className="mt-3 text-[1.05rem] leading-relaxed text-ink/90">
                  {service.summary}
                </p>

                {service.highlights.length > 0 ? (
                  <ul className="mt-5 space-y-2.5">
                    {service.highlights.map((h, j) => (
                      <li key={j} className="flex gap-3 text-[0.93rem] leading-relaxed text-ink-soft">
                        <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-coral" />
                        {h}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="flex flex-col gap-4 md:w-48 md:shrink-0 md:items-end">
                <div className="text-left md:text-right">
                  <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                    {formatPrice(service.priceInPaise, service.currency)}
                  </p>
                  <p className="mt-1 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-ink-soft">
                    {service.paymentMode === 'free' ? 'No cost' : 'Per session'}
                  </p>
                </div>

                <Button
                  href={`/services/${service.slug}`}
                  variant="solid"
                  className="w-full sm:w-auto"
                >
                  View details
                </Button>
              </div>
            </div>
          </NotebookCard>
        </Reveal>
      ))}
    </div>
  )
}
