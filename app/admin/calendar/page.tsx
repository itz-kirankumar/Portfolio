import { getSingleton } from '@/lib/store'
import { AVAILABILITY_COLLECTION, AVAILABILITY_DOC, availabilitySchema, DEFAULT_AVAILABILITY } from '@/lib/schemas/availability'
import CalendarEditor from './CalendarEditor'
import { PageHeader } from '@/components/admin/ui'

export const metadata = { title: 'Calendar & Availability' }

export default async function CalendarPage() {
  const availability = await getSingleton(
    AVAILABILITY_COLLECTION, 
    AVAILABILITY_DOC, 
    availabilitySchema, 
    DEFAULT_AVAILABILITY
  )

  const serviceAccountEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || ''

  return (
    <>
      <PageHeader
        title="Calendar & Availability"
        description="Set your weekly schedule and blocked dates."
      />
      <CalendarEditor initialData={availability} serviceAccountEmail={serviceAccountEmail} />
    </>
  )
}
