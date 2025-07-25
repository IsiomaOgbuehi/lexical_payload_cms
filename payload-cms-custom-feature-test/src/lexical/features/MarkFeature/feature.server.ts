import { MarkNode } from './MarkNode'
import { createServerFeature } from '@payloadcms/richtext-lexical'

export const MarkFeature = createServerFeature({
  feature: {
    nodes: [{ node: MarkNode }],
    ClientFeature: 'src/lexical/features/MarkFeature/feature.client#MarkFormatClient',
  },
  key: 'markings',
})
