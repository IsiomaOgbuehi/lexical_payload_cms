'use client'
import {
  createClientFeature,
  TOGGLE_LINK_COMMAND,
  toolbarFormatGroupWithItems,
} from '@payloadcms/richtext-lexical/client'
import { SuperscriptButton } from './SuperscriptButton'
import { FootnotePlugin } from './FootnoteFeature/plugins/FootnotePlugin'
import { FootnoteNode } from './FootnoteFeature/nodes/FootnoteNode'
import { FOOTNOTE_NUMBER_COMMAND } from './FootnoteFeature/plugins/FootnotePlugin'
import { LinkFeature as BaseLinkFeature, LinkFields, LinkNode } from '@payloadcms/richtext-lexical'
import { $getSelection, LexicalNode } from '@payloadcms/richtext-lexical/lexical'

export const SuperscriptClient = createClientFeature({
  nodes: [FootnoteNode],
  plugins: [{ Component: FootnotePlugin, position: 'normal' }],
  toolbarInline: {
    groups: [
      toolbarFormatGroupWithItems([
        {
          key: 'superscript',
          ChildComponent: SuperscriptButton,
          order: 6,
          onSelect: ({ editor, isActive }) => {
            editor.dispatchCommand(FOOTNOTE_NUMBER_COMMAND, undefined)
            // If you want to toggle a link, provide a valid LinkPayload object, e.g.:
            //  editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
            // Or remove the command if not needed:
            // editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url: 'https://example.com' })

            // if (!isActive) {
            //   let selectedText: string | undefined
            //   let selectedNodes: LexicalNode[] = []
            //   editor.getEditorState().read(() => {
            //     selectedText = $getSelection()?.getTextContent()
            //     // We need to selected nodes here before the drawer opens, as clicking around in the drawer may change the original selection
            //     selectedNodes = $getSelection()?.getNodes() ?? []
            //   })

            //   if (!selectedText?.length) {
            //     return
            //   }

            //   const linkFields: Partial<LinkFields> = {
            //     doc: null,
            //   }

            //   editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
            //     fields: linkFields,
            //     selectedNodes,
            //     text: selectedText,
            //   })
            // } else {
            //   // remove link
            //   editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
            // }
          },
        },
      ]),
    ],
  },
})
