import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { safeGet, safeList } from '@/lib/store'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { Button, Section, NotebookCard } from '@/components/ui/primitives'
import Reveal from '@/components/ui/Reveal'
import { formatPrice, occupiedMins } from '@/lib/schemas/service'

export const revalidate = 3600

export async function generateStaticParams() {
  const services = await safeList(SERVICES_COLLECTION, serviceSchema)
  return services.filter((s) => s.active).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await safeGet(SERVICES_COLLECTION, slug, serviceSchema)
  if (!service || !service.active) return {}
  return {
    title: service.title,
    description: service.summary,
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await safeGet(SERVICES_COLLECTION, slug, serviceSchema)

  if (!service || !service.active) {
    notFound()
  }

  const bookNowUrl = service.paymentMode === 'link' ? service.paymentLinkUrl : `/services/${service.slug}/book`

  return (
    <Section tone="paper">
      <div className="mx-auto max-w-3xl">
        <Reveal kind="up">
          <div className="mb-10 text-center">
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
              {service.title}
            </h1>
            <p className="mt-4 text-lg text-ink-soft max-w-xl mx-auto">
              {service.summary}
            </p>
          </div>
        </Reveal>

        <Reveal kind="up" delay={60}>
          <NotebookCard className="mb-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 text-center md:text-left">
                <p className="font-display text-4xl font-semibold text-ink">
                  {formatPrice(service.priceInPaise, service.currency)}
                </p>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink-soft">
                  {occupiedMins(service)} minute session
                </p>
              </div>

              <div className="flex justify-center md:justify-end md:shrink-0">
                <Button href={bookNowUrl} variant="solid" size="lg" className="w-full sm:w-auto">
                  Book Now
                </Button>
              </div>
            </div>

            {service.highlights.length > 0 ? (
              <div className="mt-8 border-t border-rule pt-8">
                <ul className="grid gap-4 sm:grid-cols-2">
                  {service.highlights.map((h, i) => (
                    <li key={i} className="flex gap-3 text-[0.95rem] leading-relaxed text-ink-soft">
                      <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-coral" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </NotebookCard>
        </Reveal>

        {service.body ? (
          <Reveal kind="up" delay={120}>
            <div 
              className="prose prose-lg prose-ink mx-auto"
              dangerouslySetInnerHTML={{ __html: service.body }} 
            />
          </Reveal>
        ) : null}

        <Reveal kind="up" delay={180}>
          <div className="mt-16 text-center">
            <Button href={bookNowUrl} variant="solid" size="lg">
              Book Now
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
