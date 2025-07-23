import { createServerFeature, LinkFeatureServerProps } from '@payloadcms/richtext-lexical'
import { FootnoteNode } from './FootnoteFeature/nodes/FootnoteNode'

export const SuperscriptFeature = createServerFeature({
  feature: {
    nodes: [{ node: FootnoteNode }],
    ClientFeature: 'src/lexical/features/SuperscriptFeature/feature.client#SuperscriptClient',
  },
  key: 'superscripts',
})