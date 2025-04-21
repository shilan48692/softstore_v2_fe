import { Image } from '@tiptap/extension-image'
import { mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: { // Corrected name to match the extension
      setImage: (options: {
        src: string
        alt?: string
        title?: string
        width?: string | number
        height?: string | number
        class?: string // Allow adding custom classes
        style?: string // Allow adding custom inline styles
        align?: 'left' | 'center' | 'right' // Add alignment option
      }) => ReturnType
    }
  }
}

export const CustomImage = Image.extend({
  name: 'customImage', // Use the same name here

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return { width: attributes.width }
        },
        parseHTML: (element) => element.getAttribute('width'),
      },
      height: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {}
          }
          return { height: attributes.height }
        },
        parseHTML: (element) => element.getAttribute('height'),
      },
      class: { // Add class attribute
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.class) {
            return {}
          }
          return { class: attributes.class }
        },
        parseHTML: (element) => element.getAttribute('class'),
      },
      style: { // Add style attribute
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {}
          }
          return { style: attributes.style }
        },
        parseHTML: (element) => element.getAttribute('style'),
      },
      align: { // Add align attribute
        default: 'left', // Default alignment
        renderHTML: (attributes) => {
          // Handled in renderHTML wrapper below
          return {}
        },
        parseHTML: (element) => element.style.float || element.getAttribute('data-align') || 'left',
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const { align, ...otherAttributes } = HTMLAttributes
    let finalAttributes = otherAttributes
    let style = otherAttributes.style || ''
    const classes = ['custom-image'] // Base class for styling

    // Clean up existing float/display styles before applying alignment
    style = style.replace(/float\s*:\s*(left|right|center|none)\s*;?/gi, '')
    style = style.replace(/display\s*:\s*block\s*;?/gi, '')
    style = style.replace(/margin\s*:\s*auto\s*;?/gi, '') // Remove margin auto if setting float

    if (align === 'left') {
      style += ' float: left;'
      classes.push('align-left')
    } else if (align === 'right') {
      style += ' float: right;'
      classes.push('align-right')
    } else if (align === 'center') {
      style += ' display: block; margin-left: auto; margin-right: auto;'
      classes.push('align-center')
    }
    finalAttributes.style = style.trim()
    finalAttributes.class = (finalAttributes.class ? finalAttributes.class + ' ' : '') + classes.join(' ')
    finalAttributes['data-align'] = align // Store alignment for parsing

    return ['img', mergeAttributes(finalAttributes)]
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]:not([src^="data:"])',
        getAttrs: (dom) => {
            if (typeof dom === 'string') return {};
            const element = dom as HTMLImageElement;
            const align = element.style.float || element.getAttribute('data-align') || 'left';
            return {
                src: element.getAttribute('src'),
                alt: element.getAttribute('alt'),
                title: element.getAttribute('title'),
                width: element.getAttribute('width'),
                height: element.getAttribute('height'),
                class: element.getAttribute('class'),
                style: element.getAttribute('style'),
                align: align
            };
        },
      },
    ]
  },

  addCommands() {
    return {
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})

export default CustomImage 