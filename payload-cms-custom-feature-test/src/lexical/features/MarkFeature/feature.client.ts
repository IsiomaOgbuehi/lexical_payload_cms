'use client'
import {
  createClientFeature,
  toolbarFormatGroupWithItems,
} from '@payloadcms/richtext-lexical/client'
import { $isMarkNode, MarkNode } from './MarkNode'
import { MarkPlugin, TOGGLE_HIGHLIGHT_COMMAND } from './MarkPlugin'
import { MarkButton } from './MarkButton'
import { $getSelection, $isRangeSelection } from '@payloadcms/richtext-lexical/lexical'

export const MarkFormatClient = createClientFeature({
  nodes: [MarkNode],
  plugins: [{ Component: MarkPlugin, position: 'normal' }],
  toolbarInline: {
    groups: [
      toolbarFormatGroupWithItems([
        {
          ChildComponent: MarkButton,
          key: 'mark',
          onSelect: ({ editor }) => {
            editor.dispatchCommand(TOGGLE_HIGHLIGHT_COMMAND, undefined)
          },
          order: 5,
          isActive: ({ editor }) => {
            let isActive = false

            editor.getEditorState().read(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                const nodes = selection.getNodes()
                isActive = nodes.some((node) => $isMarkNode(node))
              }
            })

            return isActive
          }
        },
      ]),
    ],
  },
})
