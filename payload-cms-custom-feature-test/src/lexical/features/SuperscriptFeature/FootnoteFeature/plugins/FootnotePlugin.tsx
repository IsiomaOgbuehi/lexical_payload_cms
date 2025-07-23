import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, createCommand, LexicalCommand } from 'lexical'
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

export function FootnotePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const lastShownIdRef = useRef<string | null>(null);


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
                  anchorElement: domElement, // ✅ DOM node of the new footnote
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

  useEffect(() => {
  return editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        const footnoteNode = nodes.find(node => $isFootnoteNode(node)) as FootnoteNode | undefined;

        if (footnoteNode) {
          lastShownIdRef.current = footnoteNode.getId()
          const domElement = editor.getElementByKey(footnoteNode.getKey());

          if (domElement) {
            window.dispatchEvent(
              new CustomEvent('openFootnoteModal', {
                detail: {
                  footnoteNode,
                  anchorElement: domElement,
                },
              })
            );
          }
        }
      }
    });
  });
}, [editor]);

//   useEffect(() => {
//   return editor.registerUpdateListener(({ editorState }) => {
//     editorState.read(() => {
//       const selection = $getSelection()

//       if ($isRangeSelection(selection)) {
//         const anchorNode = selection.anchor.getNode()
//         let footnoteNode: FootnoteNode | null = null

//         // Case 1: Cursor is directly on a FootnoteNode
//         if ($isFootnoteNode(anchorNode)) {
//           footnoteNode = anchorNode
//         }

//         // Case 2: Cursor is inside a TextNode sibling of a FootnoteNode
//         if (!footnoteNode && anchorNode.getPreviousSibling()) {
//           const prev = anchorNode.getPreviousSibling()
//           if ($isFootnoteNode(prev)) {
//             footnoteNode = prev
//           }
//         }

//         // Case 3: Cursor is inside the parent that contains FootnoteNode
//         if (!footnoteNode && anchorNode.getParent()) {
//           const maybe = anchorNode.getParent()
//           if ($isFootnoteNode(maybe)) {
//             footnoteNode = maybe
//           }
//         }

//         if (footnoteNode) {
//           const id = footnoteNode.getId()
//           if (id !== lastShownIdRef.current) {
//             lastShownIdRef.current = id

//             const domElement = editor.getElementByKey(footnoteNode.getKey())
//             if (domElement) {
//               window.dispatchEvent(
//                 new CustomEvent('openFootnoteModal', {
//                   detail: {
//                     footnoteNode,
//                     anchorElement: domElement,
//                   },
//                 })
//               )
//             }
//           }
//         } else {
//           // Reset on move out of footnote
//           lastShownIdRef.current = null
//         }
//       } else {
//         lastShownIdRef.current = null
//       }
//     })
//   })
// }, [editor])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'SUP' && target.hasAttribute('data-footnote-id')) {
        event.preventDefault()
        const footnoteId = target.getAttribute('data-footnote-id')
        
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const nodes = selection.getNodes()
            const footnoteNode = nodes.find(node => 
              $isFootnoteNode(node) && (node as FootnoteNode).getId() === footnoteId
            ) as FootnoteNode | undefined
            
            if (footnoteNode) {
              // Open modal for editing footnote
              window.dispatchEvent(new CustomEvent('openFootnoteModal', {
                detail: { footnoteNode, anchorElement: target, }
              }))
            }
          }
        })
      }
    }

    const editorElement = editor.getRootElement()
    if (editorElement) {
      editorElement.addEventListener('click', handleClick)
      return () => editorElement.removeEventListener('click', handleClick)
    }
  }, [editor])

  // Remove FooteNote
  useEffect(() => {
  return editor.registerCommand(
    REMOVE_FOOTNOTE_COMMAND,
    (nodeToRemove: FootnoteNode) => {
      editor.update(() => {
        nodeToRemove.remove();
      })
      return true;
    },
    COMMAND_PRIORITY_LOW
  );
}, [editor])

  return <FootnoteModal />
}
