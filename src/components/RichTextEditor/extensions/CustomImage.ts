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
        parseHTML: (element) => element.style.float || element.getAttribute('data-align') || 'left',
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const { align, class: currentClass, style: currentStyle, ...otherAttributes } = HTMLAttributes;

    let finalAttributes = { ...otherAttributes };

    // --- Class Handling --- 
    let otherClasses = (currentClass || '').split(' ').filter((c: string) => c && c.trim() && !c.startsWith('align-') && c !== 'custom-image');
    let finalClasses = ['custom-image', ...otherClasses]; 
    
    // --- Style Handling ---
    let style = currentStyle || '';

    // Clean up existing float/display/margin styles from inline style attribute
    style = style.replace(/float\s*:\s*(left|right|none)\s*;?/gi, '');
    style = style.replace(/display\s*:\s*block\s*;?/gi, '');
    style = style.replace(/margin-left\s*:\s*auto\s*;?/gi, '');
    style = style.replace(/margin-right\s*:\s*auto\s*;?/gi, '');
    style = style.replace(/;\s*;/g, ';'); 
    style = style.trim().replace(/^;|;$/g, ''); 

    let appliedStyle = style ? style + (style.endsWith(';') ? '' : ';') : '';

    // Apply alignment via style and add class
    if (align === 'left') {
      appliedStyle += ' float: left;';
      finalClasses.push('align-left');
    } else if (align === 'right') {
      appliedStyle += ' float: right;';
      finalClasses.push('align-right');
    } else if (align === 'center') {
      appliedStyle += ' display: block; margin-left: auto; margin-right: auto;';
      finalClasses.push('align-center');
    } 

    // Assign final class and style
    finalAttributes.class = finalClasses.filter((c: string) => c && c.trim()).join(' ').trim(); 
    finalAttributes.style = appliedStyle.trim().replace(/^;|;$/g, ''); 
    if (!finalAttributes.style) {
        delete finalAttributes.style; 
    }

    finalAttributes['data-align'] = align; 

    return ['img', mergeAttributes(finalAttributes)];
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]:not([src^="data:"])',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          const element = dom as HTMLImageElement;

          let determinedAlign: 'left' | 'center' | 'right' | null = null; 
          const dataAlign = element.getAttribute('data-align');
          const floatStyle = element.style.float;
          const displayStyle = element.style.display;
          const marginLeftStyle = element.style.marginLeft;
          const marginRightStyle = element.style.marginRight;

          if (dataAlign === 'left' || dataAlign === 'center' || dataAlign === 'right') {
            determinedAlign = dataAlign;
          } else if (floatStyle === 'left') {
            determinedAlign = 'left';
          } else if (floatStyle === 'right') {
            determinedAlign = 'right';
          } else if (displayStyle === 'block' && marginLeftStyle === 'auto' && marginRightStyle === 'auto') {
            determinedAlign = 'center';
          }
          
          interface ImageAttributes {
            src: string | null;
            alt: string | null;
            title: string | null;
            width: string | null;
            height: string | null;
            class: string | null;
            style: string | null;
            align: 'left' | 'center' | 'right' | null;
          }

          const attrs: ImageAttributes = {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            title: element.getAttribute('title'),
            width: element.getAttribute('width'),
            height: element.getAttribute('height'),
            class: element.getAttribute('class'),
            style: element.getAttribute('style'),
            align: determinedAlign 
          };
          return attrs;
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