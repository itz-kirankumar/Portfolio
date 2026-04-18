'use client'
// components/editor/TiptapEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExt from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import YoutubeExt from '@tiptap/extension-youtube'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon,
  Minus, Undo, Redo
} from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
}

export default function TiptapEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExt,
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false }),
      YoutubeExt.configure({ controls: true }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-36 focus:outline-none text-white/80 text-sm leading-relaxed px-4 py-3',
      },
    },
  })

  if (!editor) return null

  const iconSize = 14

  const btn = (active: boolean, action: () => void, icon: React.ReactNode, title: string) => (
    <button
      type="button"
      title={title}
      onClick={action}
      className={`p-1.5 rounded-lg transition-all ${
        active
          ? 'bg-[#7ef0c8]/20 text-[#7ef0c8]'
          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
      }`}
    >
      {icon}
    </button>
  )

  const addLink = () => {
    const url = window.prompt('Enter URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Image URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const addYoutube = () => {
    const url = window.prompt('YouTube URL')
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#13131a]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-white/5 bg-[#0d0d14]">
        {btn(editor.isActive('bold'),      () => editor.chain().focus().toggleBold().run(),      <Bold size={iconSize} />,        'Bold')}
        {btn(editor.isActive('italic'),    () => editor.chain().focus().toggleItalic().run(),    <Italic size={iconSize} />,      'Italic')}
        {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon size={iconSize} />, 'Underline')}
        {btn(editor.isActive('strike'),    () => editor.chain().focus().toggleStrike().run(),    <Strikethrough size={iconSize} />, 'Strikethrough')}

        <div className="w-px h-4 bg-white/10 mx-1" />

        {btn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 size={iconSize} />, 'H1')}
        {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={iconSize} />, 'H2')}

        <div className="w-px h-4 bg-white/10 mx-1" />

        {btn(editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),  <List size={iconSize} />,        'Bullet List')}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={iconSize} />, 'Numbered List')}

        <div className="w-px h-4 bg-white/10 mx-1" />

        {btn(false, addLink,    <LinkIcon size={iconSize} />,  'Add Link')}
        {btn(false, addImage,   <ImageIcon size={iconSize} />, 'Add Image')}

        {/* YouTube button using text instead of icon */}
        <button
          type="button"
          title="Embed YouTube"
          onClick={addYoutube}
          className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 text-xs font-medium"
        >
          YT
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {btn(false, () => editor.chain().focus().setHorizontalRule().run(), <Minus size={iconSize} />, 'Divider')}
        {btn(false, () => editor.chain().focus().undo().run(), <Undo size={iconSize} />, 'Undo')}
        {btn(false, () => editor.chain().focus().redo().run(), <Redo size={iconSize} />, 'Redo')}

        <div className="ml-auto">
          <input
            type="color"
            defaultValue="#ffffff"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            title="Text Color"
          />
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}