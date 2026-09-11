import { getSingleton } from '@/lib/store'
import { THEME_COLLECTION, THEME_DOC, themeSchema, DEFAULT_THEME } from '@/lib/schemas/theme'
import ThemeEditor from './ThemeEditor'
import { PageHeader } from '@/components/admin/ui'

export const metadata = { title: 'Personalisation' }

export default async function ThemePage() {
  const theme = await getSingleton(THEME_COLLECTION, THEME_DOC, themeSchema, DEFAULT_THEME)

  return (
    <>
      <PageHeader
        title="Personalisation"
        description="Global theme settings. Change colors, layout options, and toggle features."
      />
      <ThemeEditor initialData={theme} />
    </>
  )
}
