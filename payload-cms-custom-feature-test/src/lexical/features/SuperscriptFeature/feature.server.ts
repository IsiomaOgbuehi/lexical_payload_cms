import { createServerFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { Config, Field, sanitizeFields } from 'payload';
import { FootnoteNode } from './FootnoteFeature/nodes/FootnoteNode';

export const SuperscriptFeature = createServerFeature({
  feature: async ({ config, parentIsLocalized, isRoot }) => {
    const inputFields: Field[] = [
      {
        name: 'footnote',
        type: 'richText',
        editor: lexicalEditor({
          features: ({ defaultFeatures }) => [
            ...defaultFeatures.filter((item) =>
              ['bold', 'italic', 'link', 'paragraph', 'strikethrough'].includes(item.key),
            ),
            InlineToolbarFeature(),
          ],
        }),
        label: 'Content',
        required: true,
      },
    ];

    // Synchronously sanitize fields
    const sanitizedFields = await sanitizeFields({
      config: config as unknown as Config,
      fields: inputFields,
      parentIsLocalized,
      requireFieldLevelRichTextEditor: isRoot,
      validRelationships: config.collections.map((c) => c.slug),
    });

    return {
      nodes: [{ node: FootnoteNode }],
      ClientFeature: 'src/lexical/features/SuperscriptFeature/feature.client#FootnoteFeatureClient',
      generateSchemaMap: () => {
        const map = new Map();
        map.set('fields', {
          fields: sanitizedFields,
        });
        return map;
      },
    };
  },
  key: 'footnote',
})
