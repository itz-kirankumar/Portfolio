import { Button, Section, SectionHead } from '@/components/ui/primitives'
import Reveal from '@/components/ui/Reveal'

import { safeGet } from '@/lib/store'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'

export default async function SuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await safeGet(SERVICES_COLLECTION, slug, serviceSchema)

  const isDigital = service?.type === 'digital_download'

  return (
    <Section tone="paper">
      <div className="mx-auto max-w-2xl text-center py-20">
        <Reveal kind="up">
          <SectionHead
            align="center"
            heading={isDigital ? "Purchase Confirmed!" : "Booking Confirmed!"}
            intro={isDigital 
              ? "Thank you for your purchase. You can download your file below." 
              : "Thank you for booking a session. You'll receive a calendar invite shortly."}
          />
        </Reveal>

        <Reveal kind="up" delay={60}>
          <div className="mt-10 flex flex-col items-center gap-4">
            {isDigital && service?.fileUrl && (
              <Button href={service.fileUrl} variant="solid" size="lg" className="mb-4">
                Download Now
              </Button>
            )}
            <Button href="/" variant={isDigital && service?.fileUrl ? 'outline' : 'solid'} size="lg">
              Return Home
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
