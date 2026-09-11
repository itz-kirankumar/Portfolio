import type { Metadata } from 'next'
import { safeList } from '@/lib/store'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { Section, SectionHead } from '@/components/ui/primitives'
import { ServicesList } from '@/components/site/ServicesList'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Services',
  description: 'Book a 1:1 session or mentorship call.',
}

export default async function ServicesIndex() {
  const allServices = await safeList(SERVICES_COLLECTION, serviceSchema)
  const activeServices = allServices
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order)

  return (
    <Section tone="paper">
      <SectionHead
        eyebrow="Work With Me"
        heading="Services & Mentorship"
        intro="Book a session to discuss product strategy, get your resume reviewed, or talk through a career transition."
      />
      <ServicesList services={activeServices} />
    </Section>
  )
}
