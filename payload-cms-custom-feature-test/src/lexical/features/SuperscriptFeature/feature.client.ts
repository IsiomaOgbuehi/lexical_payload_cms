'use client'
import {
  createClientFeature,
  toolbarFormatGroupWithItems,
} from '@payloadcms/richtext-lexical/client'
import { SuperscriptButton } from './SuperscriptButton'
import { FootnotePlugin } from './FootnoteFeature/plugins/FootnotePlugin'
import { FootnoteNode } from './FootnoteFeature/nodes/FootnoteNode'
import { FOOTNOTE_NUMBER_COMMAND } from './FootnoteFeature/plugins/FootnotePlugin'

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
          },
        },
      ]),
    ],
  },
})
