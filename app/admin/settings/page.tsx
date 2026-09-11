import { PageHeader, Panel, BTN, BTN_PRIMARY } from '@/components/admin/ui'
import { Download, HardDrive } from 'lucide-react'
import { ExportButton } from './ExportButton'

export const metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings & System"
        description="Manage backups, data portability, and high-level platform configuration."
      />

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Panel 
          title="Data Portability" 
          description="Download a complete JSON backup of your database, including all posts, media metadata, services, bookings, and theme settings."
        >
          <div className="flex items-center gap-4 mt-2">
            <div className="flex size-12 items-center justify-center rounded-lg bg-paper-deep border border-rule">
              <HardDrive className="size-6 text-ink-soft" />
            </div>
            <div>
              <p className="text-[0.95rem] font-medium text-ink">Full Database Export</p>
              <p className="text-[0.85rem] text-ink-soft">Includes 6 collections.</p>
            </div>
            <div className="ml-auto">
              <ExportButton />
            </div>
          </div>
        </Panel>
      </div>
    </>
  )
}
