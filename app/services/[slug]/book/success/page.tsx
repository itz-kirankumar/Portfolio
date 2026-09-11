import { Button, Section, SectionHead } from '@/components/ui/primitives'
import Reveal from '@/components/ui/Reveal'

export default function SuccessPage() {
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-2xl text-center py-20">
        <Reveal kind="up">
          <SectionHead
            align="center"
            heading="Booking Confirmed!"
            intro="Thank you for booking a session. You'll receive a calendar invite shortly."
          />
        </Reveal>

        <Reveal kind="up" delay={60}>
          <div className="mt-10">
            <Button href="/" variant="solid" size="lg">
              Return Home
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
