import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $getSelection, $isElementNode, $isRangeSelection, COMMAND_PRIORITY_LOW, createCommand, LexicalCommand, LexicalNode } from 'lexical'
import { JSX, useEffect, useRef } from 'react'
import { FootnoteNode, $isFootnoteNode, $createFootnoteNode } from '../nodes/FootnoteNode'
import { FootnoteModal } from '../components/FootnoteModal'
import { LinkPayload } from 'node_modules/@payloadcms/richtext-lexical/dist/features/link/client/plugins/floatingLinkEditor/types'
import { TOGGLE_LINK_COMMAND } from 'node_modules/@payloadcms/richtext-lexical/dist/features/link/nodes/LinkNode'

export const FOOTNOTE_NUMBER_COMMAND: LexicalCommand<void> = createCommand(
  'FOOTNOTE_NUMBER_COMMAND',
)

export const REMOVE_FOOTNOTE_COMMAND = createCommand<FootnoteNode>('REMOVE_FOOTNOTE_COMMAND')

let footnoteCounter = 0

// Helper function to collect all footnotes in document order
function $getAllFootnotes(): FootnoteNode[] {
  const root = $getRoot();
  const footnotes: FootnoteNode[] = [];
  
  function traverse(node: LexicalNode): void {
    if ($isFootnoteNode(node)) {
      footnotes.push(node);
    }
    
    if ($isElementNode(node)) {
      const children = node.getChildren();
      for (const child of children) {
        traverse(child);
      }
    }
  }
  
  traverse(root);
  return footnotes;
}

// Helper function to re-number all footnotes
function $renumberFootnotes(): void {
  const footnotes = $getAllFootnotes();
  
  footnotes.forEach((footnote, index) => {
    const newNumber = index + 1;
    const writableNode = footnote.getWritable();
    writableNode.__number = newNumber;
  });
  
  // Update the global counter to match the highest number
  footnoteCounter = footnotes.length;
}

export function FootnotePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      FOOTNOTE_NUMBER_COMMAND,
      (payload: LinkPayload) => {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, payload)
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            footnoteCounter += 1
            const footnoteId = `footnote-${Date.now()}-${footnoteCounter}`
            const footnoteNode = $createFootnoteNode(footnoteId, footnoteCounter)
            
            selection.insertNodes([footnoteNode])
            
            // Open modal for entering footnote content
            setTimeout(() => {
              const domElement = editor.getElementByKey(footnoteNode.getKey())
              
              if (domElement) {
              window.dispatchEvent(new CustomEvent('openFootnoteModal', {
                detail: {
                  footnoteNode,
                  anchorElement: domElement,
                },
              }));
            } else {
              console.warn('Footnote DOM element not found for key:', footnoteNode.getKey());
            }
            }, 100)
          }
        })
        return true
      },
      1
    )
  }, [editor])

  // Remove FooteNote
  useEffect(() => {
  return editor.registerCommand(
    REMOVE_FOOTNOTE_COMMAND,
    (nodeToRemove: FootnoteNode) => {
      if(!nodeToRemove || !nodeToRemove.isAttached()) return true
      editor.update(() => {
        nodeToRemove.remove();
        $renumberFootnotes()
      })
      return true;
    },
    COMMAND_PRIORITY_LOW
  );
}, [editor])

  return <FootnoteModal />
}
