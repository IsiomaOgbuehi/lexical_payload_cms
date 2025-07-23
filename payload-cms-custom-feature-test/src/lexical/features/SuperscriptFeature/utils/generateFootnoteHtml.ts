// generateFootnoteHTML.ts

import { EditorState, LexicalEditor, LexicalNode } from 'lexical'
import { $generateHtmlFromNodes } from '@lexical/html'
import { $getRoot, $isElementNode } from 'lexical'

interface FootnoteRenderResult {
  htmlWithSuperscripts: string
  footnotesHtml: string
  individualFootnotes: Record<number, string>
}

// Helper function to check if a node is a footnote node
// You'll need to implement this based on your FootnoteNode structure
function $isFootnoteNode(node: LexicalNode): node is any {
  // Replace 'FootnoteNode' with your actual footnote node class name
  return node.getType() === 'footnote'
}

export function generateFootnoteHTML(editor: LexicalEditor): FootnoteRenderResult {
  let superscriptHtml = ''
  const footnoteItems: string[] = []
  const individualFootnotes: Record<number, string> = {}
  const supMap = new Map<string, number>()
  let count = 1

  // First pass: Generate HTML and process superscripts
  console.log('Generating footnote HTML...', editor)
  editor.getEditorState().read(() => {
    try {
      // Generate clean HTML from the editor state
      const htmlString = $generateHtmlFromNodes(editor, null)

      // Create a temporary container to manipulate the HTML
      const container = document.createElement('div')
      container.innerHTML = htmlString

      // Find and process footnote spans
      const spans = container.querySelectorAll('span[data-footnote-id]')
      spans.forEach((span) => {
        const id = span.getAttribute('data-footnote-id')
        const sup = span.querySelector('sup')

        if (!id || !sup) return

        const number = count
        // Update the superscript with proper linking
        sup.innerHTML = `<a href="#footnote-ref-${number}" id="footnote-anchor-${number}">${number}</a>`
        supMap.set(id, number)
        count++
      })

      superscriptHtml = container.innerHTML
    } catch (error) {
      console.error('Error generating superscript HTML:', error)
      superscriptHtml = ''
    }
  })

  // Second pass: Extract footnote content
  editor.getEditorState().read(() => {
    try {
      const root = $getRoot()

      // Traverse the editor state to find footnote nodes
      function traverseNodes(node: LexicalNode) {
        if ($isFootnoteNode(node)) {
          const id = (node as any).getId?.()
          const num = supMap.get(id)

          if (!num || !id) return

          try {
            // Get footnote content - adjust this based on your FootnoteNode structure
            const content = (node as any).getContent?.()

            if (content) {
              let html = ''

              // If content is an editor state JSON string
              if (typeof content === 'string') {
                try {
                  const footnoteState = editor.parseEditorState(content)
                  editor.setEditorState(footnoteState)
                  editor.getEditorState().read(() => {
                    html = $generateHtmlFromNodes(editor, null)
                  })
                } catch (parseError) {
                  console.warn('Failed to parse footnote content as editor state:', parseError)
                  html = content // Use as-is if parsing fails
                }
              }
              // If content is already HTML or plain text
              else if (typeof content === 'string') {
                html = content
              }
              // If content is an EditorState object
              else if (content && typeof content.read === 'function') {
                content.read(() => {
                  html = $generateHtmlFromNodes(editor, null)
                })
              }

              if (html) {
                footnoteItems.push(`<li id="footnote-ref-${num}">
                  ${html}
                  <a href="#footnote-anchor-${num}"> ↩</a>
                </li>`)
                individualFootnotes[num] = html
              }
            }
          } catch (contentError) {
            console.error(`Error processing footnote ${id}:`, contentError)
          }
        }

        // Recursively traverse child nodes
        if ($isElementNode(node)) {
          const children = node.getChildren()
          children.forEach(traverseNodes)
        }
      }

      // Start traversal from root
      traverseNodes(root)
    } catch (error) {
      console.error('Error extracting footnote content:', error)
    }
  })

  const footnotesHtml =
    footnoteItems.length > 0
      ? `
    <footer class="footnotes">
      <h3>Footnotes</h3>
      <ol>
        ${footnoteItems.join('\n')}
      </ol>
    </footer>
  `
      : ''

  return {
    htmlWithSuperscripts: superscriptHtml,
    footnotesHtml,
    individualFootnotes,
  }
}

// Alternative version if you have access to footnote data separately
export function generateFootnoteHTMLFromData(
  editor: LexicalEditor,
  footnotes: Array<{ id: string; content: string }>,
): FootnoteRenderResult {
  let superscriptHtml = ''
  const footnoteItems: string[] = []
  const individualFootnotes: Record<number, string> = {}

  editor.getEditorState().read(() => {
    try {
      const htmlString = $generateHtmlFromNodes(editor, null)
      const container = document.createElement('div')
      container.innerHTML = htmlString

      const supMap = new Map<string, number>()
      let count = 1

      // Process superscripts
      const spans = container.querySelectorAll('span[data-footnote-id]')
      spans.forEach((span) => {
        const id = span.getAttribute('data-footnote-id')
        const sup = span.querySelector('sup')

        if (!id || !sup) return

        const number = count
        sup.innerHTML = `<a href="#footnote-ref-${number}" id="footnote-anchor-${number}">${number}</a>`
        supMap.set(id, number)
        count++
      })

      superscriptHtml = container.innerHTML

      // Generate footnote list from provided data
      footnotes.forEach(({ id, content }) => {
        const num = supMap.get(id)
        if (!num) return

        footnoteItems.push(`<li id="footnote-ref-${num}">
          ${content}
          <a href="#footnote-anchor-${num}"> ↩</a>
        </li>`)
        individualFootnotes[num] = content
      })
    } catch (error) {
      console.error('Error generating footnote HTML from data:', error)
    }
  })

  const footnotesHtml =
    footnoteItems.length > 0
      ? `
    <footer class="footnotes">
      <h3>Footnotes</h3>
      <ol>
        ${footnoteItems.join('\n')}
      </ol>
    </footer>
  `
      : ''

  return {
    htmlWithSuperscripts: superscriptHtml,
    footnotesHtml,
    individualFootnotes,
  }
}
