import { safeGet } from '@/lib/store'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import ServiceEditor from './ServiceEditor'
import { PageHeader } from '@/components/admin/ui'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Service Editor' }

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  let data = null
  if (id !== 'new') {
    data = await safeGet(SERVICES_COLLECTION, id, serviceSchema)
    if (!data) {
      notFound()
    }
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/services" className="text-sm text-stone-500 hover:text-stone-900 mb-2 inline-block">
          &larr; Back to Services
        </Link>
        <PageHeader 
          title={id === 'new' ? 'New Service' : 'Edit Service'} 
          description={id === 'new' ? 'Create a new bookable offering.' : `Editing ${data?.title}`}
        />
      </div>
      <ServiceEditor id={id} initialData={data} />
    </>
  )
}
