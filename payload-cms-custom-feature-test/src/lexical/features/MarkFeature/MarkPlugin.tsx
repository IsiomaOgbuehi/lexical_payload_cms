import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createTextNode, $getSelection, $isRangeSelection, $isTextNode, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand, TextNode } from 'lexical'
import { useEffect } from 'react'
import { $createMarkNode, $isMarkNode } from './MarkNode'
import type { PluginComponent } from '@payloadcms/richtext-lexical'

export const TOGGLE_HIGHLIGHT_COMMAND: LexicalCommand<void> = createCommand(
  'TOGGLE_HIGHLIGHT_COMMAND',
)

export const MarkPlugin: PluginComponent = () => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      TOGGLE_HIGHLIGHT_COMMAND,
      () => {
        const selection = $getSelection()

        if (!$isRangeSelection(selection)) {
          return false
        }

        // Get the selected text
        const selectedText = selection.getTextContent()
        
        if (!selectedText) {
          return false
        }

        // Get all nodes in the selection
        const nodes = selection.getNodes()
        
        // Check if any selected node is already highlighted
        const hasHighlight = nodes.some((node) => $isMarkNode(node))
        console.log('IS HIGHLIGHTED:', hasHighlight)

        if (hasHighlight) {
          // Remove highlight: convert highlighted nodes back to text nodes
          nodes.forEach(node => {
            if ($isMarkNode(node)) {
              const textNode = new TextNode(node.getTextContent())
              textNode.setFormat(node.getFormat())
              textNode.setStyle(node.getStyle())
              node.replace(textNode)
            }
          })
        } else {
          // Add highlight: convert selected text to highlighted nodes
          const anchor = selection.anchor
          const focus = selection.focus
          
          // Handle the case where selection spans multiple nodes
          if (nodes.length === 1 && $isTextNode(nodes[0])) {
            const textNode = nodes[0]
            const anchorOffset = anchor.offset
            const focusOffset = focus.offset
            const isBackward = selection.isBackward()
            const startOffset = isBackward ? focusOffset : anchorOffset
            const endOffset = isBackward ? anchorOffset : focusOffset

            // Split the text node if needed
            if (startOffset === 0 && endOffset === textNode.getTextContent().length) {
              // Entire node is selected
              const highlightNode = $createMarkNode(textNode.getTextContent())
              highlightNode.setFormat(textNode.getFormat())
              highlightNode.setStyle(textNode.getStyle())
              textNode.replace(highlightNode)
            } else {
              // Partial selection - split the node
              const textContent = textNode.getTextContent()
              const beforeText = textContent.slice(0, startOffset)
              const selectedText = textContent.slice(startOffset, endOffset)
              const afterText = textContent.slice(endOffset)

              const nodes = []
              
              // Create before text node if needed
              if (beforeText) {
                const beforeNode = $createTextNode(beforeText)
                beforeNode.setFormat(textNode.getFormat())
                beforeNode.setStyle(textNode.getStyle())
                nodes.push(beforeNode)
              }
              
              // Create highlighted node
              const highlightNode = $createMarkNode(selectedText)
              highlightNode.setFormat(textNode.getFormat())
              highlightNode.setStyle(textNode.getStyle())
              nodes.push(highlightNode)
              
              // Create after text node if needed
              if (afterText) {
                const afterNode = $createTextNode(afterText)
                afterNode.setFormat(textNode.getFormat())
                afterNode.setStyle(textNode.getStyle())
                nodes.push(afterNode)
              }

              // Replace the original node with the split nodes
              textNode.replace(nodes[0])
              if (nodes.length > 1) {
                for (let i = 1; i < nodes.length; i++) {
                  nodes[i - 1].insertAfter(nodes[i])
                }
              }
            }
          } else {
            // Multiple nodes selected - convert each text node to highlight
            nodes.forEach(node => {
              if ($isTextNode(node)) {
                const highlightNode = $createMarkNode(node.getTextContent())
                highlightNode.setFormat(node.getFormat())
                highlightNode.setStyle(node.getStyle())
                node.replace(highlightNode)
              }
            })
          }
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
