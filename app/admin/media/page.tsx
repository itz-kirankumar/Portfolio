import Link from 'next/link'
import { safeList } from '@/lib/store'
import { MEDIA_COLLECTION, mediaSchema, kindLabel } from '@/lib/schemas/media'
import { Plus, Image as ImageIcon } from 'lucide-react'
import { BTN_PRIMARY, PageHeader, EmptyState } from '@/components/admin/ui'
import MediaDropzone from '@/components/admin/MediaDropzone'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Media' }

export default async function MediaListPage() {
  const mediaItems = await safeList(MEDIA_COLLECTION, mediaSchema, {
    orderBy: ['createdAt', 'desc']
  })

  return (
    <MediaDropzone>
      <PageHeader
        title="Media Library"
        description="Manage your uploaded files and embeds."
        actions={
          <Link href="/admin/media/new" className={BTN_PRIMARY}>
            <Plus className="size-3.5" />
            Add Media
          </Link>
        }
      />

      {mediaItems.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<ImageIcon className="size-6 text-ink-soft" />}
            title="No media found"
            description="You haven't added any media yet."
            action={
              <Link href="/admin/media/new" className={BTN_PRIMARY}>
                Add your first media
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-rule bg-card shadow-sm">
          <ul className="divide-y divide-rule">
            {mediaItems.map((item) => (
              <li key={item.id} className="transition hover:bg-paper-deep/50">
                <Link href={`/admin/media/${item.id}`} className="flex items-center gap-5 px-5 py-4">
                  <div className="w-14 h-14 bg-paper-deep rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden border border-rule">
                    {item.thumbUrl ? (
                      <img src={item.thumbUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="size-5 text-ink-soft/70" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[0.95rem] text-ink truncate">
                      {item.title || item.url || 'Untitled'}
                    </p>
                    <p className="mt-1 text-[0.82rem] text-ink-soft truncate font-mono uppercase tracking-[0.1em]">
                      {kindLabel(item.kind)} {item.platform ? `· ${item.platform}` : ''}
                    </p>
                  </div>
                  <div className="text-[0.82rem] text-ink-soft whitespace-nowrap">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'Unknown'}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </MediaDropzone>
  )
}
