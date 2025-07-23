import React, { JSX, useEffect, useState } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import { ListNode, ListItemNode } from '@lexical/list'
import { ToolbarPlugin } from './FootnoteToolbar'
import { ErrorBoundaryType } from 'node_modules/@lexical/react/shared/useDecorators'
import { $isTextNode, DOMConversionMap, DOMExportOutput, DOMExportOutputMap, EditorState, isHTMLElement, Klass, LexicalEditor, LexicalNode, ParagraphNode, SerializedEditorState, SerializedLexicalNode, TextNode } from '@payloadcms/richtext-lexical/lexical'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'


interface FootnoteEditorProps {
  content: string
  handleSave: (data: SerializedEditorState<SerializedLexicalNode> | null) => void
}

const theme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    strikethrough: 'line-through',
  },
  link: 'text-blue-600 underline cursor-pointer',
}

export function FootnoteEditor({ content, handleSave }: FootnoteEditorProps): JSX.Element {
    const [editorState, setEditorState] = useState<SerializedEditorState<SerializedLexicalNode> | null>(null)
  
  const initialConfig = {
    namespace: 'FootnoteEditor',
    theme,
    onError: (error: Error) => {
      console.error(error)
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      LinkNode,
      AutoLinkNode,
      ListNode,
      ListItemNode,
    ],
  }
  const [editor] = useLexicalComposerContext()

  ////////

  const placeholder = 'Enter some rich text...';

const removeStylesExportDOM = (
  editor: LexicalEditor,
  target: LexicalNode,
): DOMExportOutput => {
  const output = target.exportDOM(editor);
  if (output && isHTMLElement(output.element)) {
    // Remove all inline styles and classes if the element is an HTMLElement
    // Children are checked as well since TextNode can be nested
    // in i, b, and strong tags.
    for (const el of [
      output.element,
      ...output.element.querySelectorAll('[style],[class],[dir="ltr"]'),
    ]) {
      el.removeAttribute('class');
      el.removeAttribute('style');
      if (el.getAttribute('dir') === 'ltr') {
        el.removeAttribute('dir');
      }
    }
  }
  return output;
}

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
])

const getExtraStyles = (element: HTMLElement): string => {
  // Parse styles from pasted input, but only if they match exactly the
  // sort of styles that would be produced by exportDOM
  let extraStyles = '';
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  if (fontSize! !== '' && fontSize! !== '15px') {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor! !== '' && backgroundColor! !== 'rgb(255, 255, 255)') {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color! !== '' && color! !== 'rgb(0, 0, 0)') {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
};

const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {};

  // Wrap all TextNode importers with a function that also imports
  // the custom styles implemented by the playground
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const {forChild} = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }

  return importMap;
}

  const editorConfig = {
    editorState: content ? editor.parseEditorState(JSON.parse(content)) : null,
  html: {
    export: exportMap,
    import: constructImportMap(),
  },
  namespace: 'FootnoteEditor',
  nodes: [ParagraphNode, TextNode, HeadingNode,
      QuoteNode,
      LinkNode,
      AutoLinkNode,
      ListNode,
      ListItemNode,],
  onError(error: Error) {
    throw error;
  },
  theme: {
  code: 'editor-code',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
  },
  image: 'editor-image',
  link: 'editor-link',
  list: {
    listitem: 'editor-listitem',
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
  },
  ltr: 'ltr',
  paragraph: 'editor-paragraph',
  placeholder: 'editor-placeholder',
  quote: 'editor-quote',
  rtl: 'rtl',
  text: {
    bold: 'editor-text-bold',
    code: 'editor-text-code',
    hashtag: 'editor-text-hashtag',
    italic: 'editor-text-italic',
    overflowed: 'editor-text-overflowed',
    strikethrough: 'editor-text-strikethrough',
    underline: 'editor-text-underline',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
  },
},
}

const handleSaveFromEditor = () => {
  handleSave(editorState) 
  // const editorState = editor.getEditorState();
  // editorState.read(() => {
  //   const json = editorState.toJSON();
  //   console.log('Saved JSON:', json);
  //   handleSave(editorState)  // Call the provided handleSave function with the JSON data
  //   // Save to DB or wherever
  // });
};

  return ( 
    <div style={{ width: '100%', height: '100%', }}>
      {/* <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-32 p-3 focus:outline-none" />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                Enter footnote content...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary as unknown as ErrorBoundaryType}
          />
        </div>
        <HistoryPlugin />
        <LinkPlugin />
        <ListPlugin />
      </LexicalComposer> */}
      
      <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="editor_placeholder_2">{placeholder}</div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin />
          <ListPlugin />
          <OnChangePlugin onChange={(editorState: EditorState) => {
        editorState.read(() => {
          const json = editorState.toJSON();
          setEditorState(json)
          console.log('Editor state changed:', json);
          // onChange(json);
        });
      }} />
        </div>
        <button type='button' onClick={handleSaveFromEditor} style={{width: '100%', marginTop: '4px'}}>Save</button>
      </div>
    </LexicalComposer>
    </div>
  )
}

function parseAllowedFontSize(fontSize: string) {
  throw new Error('Function not implemented.')
}
function parseAllowedColor(backgroundColor: string) {
  throw new Error('Function not implemented.')
}

