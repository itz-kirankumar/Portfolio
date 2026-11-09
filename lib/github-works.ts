// lib/github-works.ts
//
// Automatic ingestion of recent public work from Kiran's own GitHub profile —
// the same account the site's curated works already link their source code to
// (itz-kirankumar). This is what keeps the wall current without manual entry:
// any new public, non-fork repository shows up on the next revalidate.
//
// Protections, deliberately conservative:
// - forks are excluded (a fork is someone else's project; showing it as
//   Kiran's work would be misattribution);
// - archived repos are excluded;
// - a repo needs a description or a homepage, otherwise there is nothing
//   truthful to say about it;
// - only repos with a commit in the last 18 months (the wall is for recent
//   work; older repos belong in the curated seed if they matter);
// - known non-project repos (profile config, first-steps tutorials) are
//   excluded by name;
// - timestamps are the repo's real pushed_at / created_at, nothing inferred;
// - any fetch or parse failure yields an empty list, never an error page.

import type { Work } from '@/lib/schemas/work'

const GITHUB_USER = 'itz-kirankumar'
const RECENT_WINDOW_MS = 1000 * 60 * 60 * 24 * 30 * 18 // ~18 months
const EXCLUDE_REPOS = new Set(['itz-kirankumar', 'git_test'])

type GhRepo = {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  fork: boolean
  archived: boolean
  pushed_at: string
  created_at: string
}

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

const slugify = (name: string) =>
  `gh-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`

/** Repo names already represented by a curated work (source URL or title). */
function curatedRepoNames(works: Work[]): Set<string> {
  const names = new Set<string>()
  for (const w of works) {
    names.add(w.title.toLowerCase())
    const m = w.sourceUrl.match(/github\.com\/[^/]+\/([^/?#]+)/i)
    if (m) names.add(m[1].toLowerCase())
  }
  return names
}

export async function getGitHubWorks(existing: Work[]): Promise<Work[]> {
  let repos: GhRepo[]
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    repos = (await res.json()) as GhRepo[]
  } catch {
    return []
  }
  if (!Array.isArray(repos)) return []

  const curated = curatedRepoNames(existing)
  const cutoff = Date.now() - RECENT_WINDOW_MS

  return repos
    .filter((r) => {
      if (r.fork || r.archived) return false
      if (EXCLUDE_REPOS.has(r.name)) return false
      if (!r.description && !r.homepage) return false
      if (Date.parse(r.pushed_at) < cutoff) return false
      if (curated.has(r.name.toLowerCase())) return false
      return true
    })
    .map((r): Work => {
      const liveUrl = r.homepage && /^https?:\/\//.test(r.homepage) ? r.homepage : ''
      const what = r.description?.trim()
      return {
        id: slugify(r.name),
        slug: slugify(r.name),
        title: r.name,
        tagline: what ?? 'Open-source repository',
        kind: 'experiment',
        // A public repo with recent commits is not a launched product -
        // 'building' is the only truthful status the enum offers here.
        status: 'building',
        period: `Active ${monthYear(r.pushed_at)}`,
        summary: what
          ? `${what} Public repository, listed automatically from the GitHub profile this site links to.`
          : 'Public repository, listed automatically from the GitHub profile this site links to.',
        body: [
          what ?? 'An open-source repository.',
          `This entry is generated automatically from the public ${GITHUB_USER} GitHub profile. Last public commit ${monthYear(r.pushed_at)}; the repository is the source of truth.`,
        ].join('\n\n'),
        coverUrl: `https://opengraph.githubassets.com/1/${GITHUB_USER}/${r.name}`,
        liveUrl,
        sourceUrl: r.html_url,
        tags: ['open source'],
        highlights: [],
        metrics: [],
        featured: false,
        order: 900,
        createdAt: Math.floor(Date.parse(r.created_at) / 1000) || 0,
        updatedAt: Math.floor(Date.parse(r.pushed_at) / 1000) || 0,
      }
    })
}
