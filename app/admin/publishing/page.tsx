import { safeList } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import Link from 'next/link'
import { Plus, PenLine } from 'lucide-react'
import { PageHeader, EmptyState, BTN_PRIMARY } from '@/components/admin/ui'
import { ListItemActions } from '@/components/admin/ListItemActions'
import { deletePost, setPostStatus } from './actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Publishing' }

export default async function PublishingPage() {
  const posts = await safeList(POSTS_COLLECTION, postSchema, {
    orderBy: ['createdAt', 'desc']
  })

  return (
    <>
      <PageHeader
        title="Publishing"
        description="Manage your blog posts and newsletters."
        actions={
          <Link href="/admin/publishing/new" className={BTN_PRIMARY}>
            <Plus className="size-3.5" />
            New Post
          </Link>
        }
      />

      {posts.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<PenLine className="size-6 text-ink-soft" />}
            title="No posts found"
            description="Create your first blog post to get started."
            action={
              <Link href="/admin/publishing/new" className={BTN_PRIMARY}>
                Write a post
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-rule bg-card shadow-sm">
          <ul className="divide-y divide-rule">
            {posts.map((post) => {
              const badge = (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.7rem] uppercase tracking-wider font-mono ${
                  post.status === 'published' ? 'bg-coral-soft/50 text-coral-ink' :
                  post.status === 'scheduled' ? 'bg-blue-100/50 text-blue-800' :
                  'bg-rule text-ink-soft'
                }`}>
                  {post.status}
                </span>
              )
              const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-GB') : '-'
              return (
              <li key={post.id} className="flex items-start gap-2 px-5 py-4 transition hover:bg-paper-deep/50 sm:items-center">
                <Link href={`/admin/publishing/${post.id}`} className="flex flex-1 items-center gap-4 min-w-0">
                  <div className="flex-1 min-w-0">
                    {/* Mobile: full title wraps so the row stays identifiable;
                        desktop: single-line truncate. */}
                    <p className="font-medium text-[0.95rem] text-ink sm:truncate">
                      {post.title || 'Untitled Post'}
                    </p>
                    <p className="mt-1 hidden text-[0.82rem] text-ink-soft truncate sm:block">
                      {post.excerpt || 'No excerpt'}
                    </p>
                    <div className="mt-2 flex items-center gap-3 sm:hidden">
                      {badge}
                      <span className="text-[0.82rem] text-ink-soft">{date}</span>
                    </div>
                  </div>
                  <div className="hidden items-center gap-4 shrink-0 sm:flex">
                    {badge}
                    <span className="text-[0.82rem] text-ink-soft w-24 text-right">
                      {date}
                    </span>
                  </div>
                </Link>
                <div className="shrink-0">
                  <ListItemActions
                    kindLabel="post"
                    title={post.title || 'Untitled Post'}
                    status={post.status}
                    liveHref={post.status === 'published' ? `/writing/${post.id}` : undefined}
                    onToggleStatus={setPostStatus.bind(null, post.id, post.status === 'published' ? 'draft' : 'published')}
                    onDelete={deletePost.bind(null, post.id)}
                  />
                </div>
              </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )
}
