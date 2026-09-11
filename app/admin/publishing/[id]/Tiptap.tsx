'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Link as LinkIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Tiptap({
  initialContent,
  onChange,
}: {
  initialContent?: string
  onChange: (html: string, json: string) => void
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Write your post here...',
      }),
    ],
    content: initialContent ? JSON.parse(initialContent) : '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), JSON.stringify(editor.getJSON()))
    },
    editorProps: {
      attributes: {
        class: 'prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[400px]',
      },
    },
  })

  if (!editor) {
    return null
  }

  const MenuButton = ({
    onClick,
    active,
    disabled,
    children,
  }: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-1.5 rounded text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition disabled:opacity-50',
        active && 'bg-stone-200 text-stone-900 font-medium'
      )}
    >
      {children}
    </button>
  )

  const addImage = () => {
    const url = window.prompt('Image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="border border-rule rounded-md overflow-hidden bg-card">
      <div className="flex flex-wrap items-center gap-1 border-b border-rule bg-paper-deep/50 p-1">
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold className="size-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic className="size-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
          <UnderlineIcon className="size-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
          <Strikethrough className="size-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
          <Code className="size-4" />
        </MenuButton>
        <div className="w-px h-4 bg-rule mx-1" />
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
          <Heading1 className="size-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 className="size-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          <Heading3 className="size-4" />
        </MenuButton>
        <div className="w-px h-4 bg-rule mx-1" />
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List className="size-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered className="size-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          <Quote className="size-4" />
        </MenuButton>
        <div className="w-px h-4 bg-rule mx-1" />
        <MenuButton onClick={setLink} active={editor.isActive('link')}>
          <LinkIcon className="size-4" />
        </MenuButton>
        <MenuButton onClick={addImage}>
          <ImageIcon className="size-4" />
        </MenuButton>
      </div>
      <div className="p-4 sm:p-6 min-h-[400px] prose-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
