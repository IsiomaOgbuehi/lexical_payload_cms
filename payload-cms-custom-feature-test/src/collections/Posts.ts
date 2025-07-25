import { BlocksFeature, lexicalEditor, LinkFeature } from '@payloadcms/richtext-lexical'
import { CollectionConfig } from 'payload'
import { MarkFeatureServer } from '../lexical/features/MarkFeature/feature.server'
import { SuperscriptFeature } from '@/lexical/features/SuperscriptFeature/feature.server'

const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      label: '',
      name: 'content',
      type: 'richText'
    },
  ],
}

export default Posts

