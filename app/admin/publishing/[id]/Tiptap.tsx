'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Iframe } from './IframeExtension'
import { MediaPickerModal } from './MediaPickerModal'
import type { Media } from '@/lib/schemas/media'
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
  Link as LinkIcon,
  Library
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Tiptap({
  initialContent,
  onChange,
}: {
  initialContent?: string
  onChange: (html: string, json: string) => void
}) {
  const [showMediaPicker, setShowMediaPicker] = useState(false)

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
      Iframe,
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
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
            if (!coordinates) return false
            
            // Upload immediately
            const uploadFile = async () => {
              try {
                const reqRes = await fetch('/api/upload', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: file.name, type: file.type, size: file.size, folder: 'gallery' }),
                })
                const reqJson = await reqRes.json()
                if (!reqRes.ok) throw new Error(reqJson.error)

                await fetch(reqJson.signedUrl, {
                  method: 'PUT',
                  headers: reqJson.uploadHeaders,
                  body: file,
                })
                
                editor.chain().focus().insertContentAt(coordinates.pos, {
                  type: 'image',
                  attrs: { src: reqJson.url, alt: file.name }
                }).run()
              } catch (err: any) {
                alert(`Upload failed: ${err.message}`)
              }
            }
            uploadFile()
            return true
          }
        }
        return false
      }
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

  const handleMediaSelect = (media: Media) => {
    setShowMediaPicker(false)
    if (media.kind === 'image') {
      editor.chain().focus().insertContent([
        { type: 'image', attrs: { src: media.url, alt: media.alt || media.title || '' } },
        { type: 'paragraph' }
      ]).run()
    } else if (media.kind === 'video' || media.kind === 'embed') {
      editor.chain().focus().insertContent([
        { type: 'iframe', attrs: { src: media.url, title: media.title || '' } },
        { type: 'paragraph' }
      ]).run()
    } else {
      editor.chain().focus().setLink({ href: media.url }).insertContent(media.title || 'Download File').insertContent({ type: 'paragraph' }).run()
    }
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleStrike = () => editor.chain().focus().toggleStrike().run()
  const toggleCode = () => editor.chain().focus().toggleCode().run()
  const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run()
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run()
  const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run()
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run()

  const addImage = () => {
    const url = window.prompt('Image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    
    if (url === null) return // cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="border border-rule rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-rule bg-paper-deep/50 p-2">
        <MenuButton onClick={toggleH1} active={editor.isActive('heading', { level: 1 })}>
          <Heading1 className="size-4" />
        </MenuButton>
        <MenuButton onClick={toggleH2} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 className="size-4" />
        </MenuButton>
        <MenuButton onClick={toggleH3} active={editor.isActive('heading', { level: 3 })}>
          <Heading3 className="size-4" />
        </MenuButton>
        
        <div className="w-px h-6 bg-rule mx-1" />
        
        <MenuButton onClick={toggleBold} active={editor.isActive('bold')}>
          <Bold className="size-4" />
        </MenuButton>
        <MenuButton onClick={toggleItalic} active={editor.isActive('italic')}>
          <Italic className="size-4" />
        </MenuButton>
        <MenuButton onClick={toggleStrike} active={editor.isActive('strike')}>
          <Strikethrough className="size-4" />
        </MenuButton>
        <MenuButton onClick={toggleCode} active={editor.isActive('code')}>
          <Code className="size-4" />
        </MenuButton>

        <div className="w-px h-6 bg-rule mx-1" />

        <MenuButton onClick={toggleBulletList} active={editor.isActive('bulletList')}>
          <List className="size-4" />
        </MenuButton>
        <MenuButton onClick={toggleOrderedList} active={editor.isActive('orderedList')}>
          <ListOrdered className="size-4" />
        </MenuButton>
        <MenuButton onClick={toggleBlockquote} active={editor.isActive('blockquote')}>
          <Quote className="size-4" />
        </MenuButton>

        <div className="w-px h-6 bg-rule mx-1" />

        <MenuButton onClick={setLink} active={editor.isActive('link')}>
          <LinkIcon className="size-4" />
        </MenuButton>
        <MenuButton onClick={() => setShowMediaPicker(true)}>
          <Library className="size-4 text-coral-ink" />
        </MenuButton>
      </div>
      <div className="p-4 sm:p-6 min-h-[400px] prose-editor">
        <EditorContent editor={editor} />
      </div>
      
      {showMediaPicker && (
        <MediaPickerModal 
          onClose={() => setShowMediaPicker(false)}
          onSelect={handleMediaSelect}
        />
      )}
    </div>
  )
}
