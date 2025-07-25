'use client'
import {
  createClientFeature,
  toolbarFormatGroupWithItems,
} from '@payloadcms/richtext-lexical/client'
import { SuperscriptButton } from './SuperscriptButton'
import { FootnotePlugin } from './FootnoteFeature/plugins/FootnotePlugin'
import { FOOTNOTE_NUMBER_COMMAND } from './FootnoteFeature/plugins/FootnotePlugin'
import { FootnoteNode } from './FootnoteFeature/nodes/FootnoteNode'

export const FootnoteFeatureClient = createClientFeature({
  nodes: [FootnoteNode],
  plugins: [{ Component: FootnotePlugin, position: 'normal' }],
  toolbarInline: {
    groups: [
      toolbarFormatGroupWithItems([
        {
          key: 'footnote',
          ChildComponent: SuperscriptButton,
          order: 6,
          onSelect: ({ editor }) => {
            editor.dispatchCommand(FOOTNOTE_NUMBER_COMMAND, undefined)
          },
        },
      ]),
    ],
  },
})