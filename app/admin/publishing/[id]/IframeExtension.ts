import { Node, mergeAttributes } from '@tiptap/core'

export const Iframe = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: 'w-full aspect-video rounded-lg shadow-sm border border-rule',
      },
    }
  },

  addAttributes() {
    return {
      src: { default: null },
      width: { default: null },
      height: { default: null },
      frameborder: { default: '0' },
      allowfullscreen: { default: this.options.allowFullscreen ? 'true' : 'false' },
      title: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'iframe' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },
})
