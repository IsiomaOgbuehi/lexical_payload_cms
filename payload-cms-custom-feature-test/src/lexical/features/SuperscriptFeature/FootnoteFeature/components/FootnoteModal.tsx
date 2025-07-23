import React, { useState, useEffect, JSX } from 'react'
import { $getRoot, $getSelection, $isElementNode, $isRangeSelection, LexicalEditor, RootNode } from 'lexical'
import { $isFootnoteNode, FootnoteNode } from '../nodes/FootnoteNode'
// import { Button } from '@/components/ui/button'
import { FootnoteEditor } from './FootnoteEditor'
import Modal from './Modal'
// import AlertBox from '@/components/AlertBox'
import { faEdit, faClose } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EditFootnoteModal } from './EditFootnoteModal'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { JSXConvertersFunction, LinkJSXConverter, RichText as RichTextConverter } from '@payloadcms/richtext-lexical/react'
import type { LexicalNode, SerializedEditorState, SerializedLexicalNode, SerializedRootNode } from '@payloadcms/richtext-lexical/lexical'
import { DefaultNodeTypes, SerializedLinkNode } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import { getPayloadPopulateFn } from '@payloadcms/richtext-lexical'
// import { RichTextRenderer } from '../../utils/richtextJsxConverter'
import { SerializeLexical } from '../../utils/serializeLexical'
import { REMOVE_FOOTNOTE_COMMAND } from '../plugins/FootnotePlugin'

// const sampleData: SerializedEditorState = {
//   "root": {
//     "children": [
//       {
//         "children": [
//           {
//             "children": [
//               {
//                 "detail": 0,
//                 "format": 0,
//                 "mode": "normal",
//                 "style": "",
//                 "text": "http://example.com",
//                 "type": "text",
//                 "version": 1
//               }
//             ],
//             "direction": "ltr",
//             "format": "",
//             "indent": 0,
//             "type": "link",
//             "version": 1,
//             "rel": "noreferrer",
//             "target": null,
//             "title": null,
//             "url": "http://example.com"
//           }
//         ],
//         "direction": "ltr",
//         "format": "",
//         "indent": 0,
//         "type": "paragraph",
//         "version": 1,
//         "textFormat": 0,
//         "textStyle": ""
//       },
//       {
//         "children": [],
//         "direction": null,
//         "format": "",
//         "indent": 0,
//         "type": "paragraph",
//         "version": 1,
//         "textFormat": 0,
//         "textStyle": ""
//       },
//       {
//         "children": [
//           {
//             "detail": 0,
//             "format": 0,
//             "mode": "normal",
//             "style": "",
//             "text": "Just seeing this stuff now",
//             "type": "text",
//             "version": 1
//           }
//         ],
//         "direction": "ltr",
//         "format": "",
//         "indent": 0,
//         "type": "paragraph",
//         "version": 1,
//         "textFormat": 0,
//         "textStyle": ""
//       }
//     ],
//     "direction": "ltr",
//     "format": "",
//     "indent": 0,
//     "type": "root",
//     "version": 1
//   }
// } satisfies SerializedRootNode // from '@payloadcms/richtext-lexical/react'

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {

  if(linkNode.fields.url && linkNode.fields.url.length) {
//    return <a href={linkNode.fields.url} rel="noopener noreferrer" target="_blank">
// {linkNode.fields.url }           </a> 
return linkNode.fields.url
  }
  if (!linkNode.fields.doc) return '#';

  
  const doc = linkNode.fields?.doc;
  if (!doc) return linkNode.fields.url ?? '#';

  const { relationTo, value } = linkNode.fields.doc!

  if (!value || typeof value !== 'object' || !('slug' in value)) {
    return '#';
  }

  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  console.log('RelationTo:', relationTo)
  console.log('Value:', value)
  
  const slug = value.slug

  switch (relationTo) {
    case 'posts':
      return `/posts/${slug}`
    case 'categories':
      return `/category/${slug}`
    case 'pages':
      return `/${slug}`
    default:
      return `/${relationTo}/${slug}`
  }
}

const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
})

export function FootnoteModal(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [currentFootnote, setCurrentFootnote] = useState<FootnoteNode | null>(null)
  const [footnoteContent, setFootnoteContent] = useState('')
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  const [showEditModal, setShowEditModal] = useState(false)

  const [editor] = useLexicalComposerContext()
  const [editorState, setEditorState] = useState<SerializedEditorState<SerializedLexicalNode> | null>(null)

 useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      setFootnoteContent('')
      
      const { footnoteNode, anchorElement } = event.detail
      
      setCurrentFootnote(footnoteNode as FootnoteNode)
      if(footnoteNode.getJsonContent() !== null) {
      setFootnoteContent(JSON.stringify(footnoteNode.getJsonContent()))
    }
      setEditorState(footnoteNode.getJsonContent())
      setIsOpen(true)

      // Calculate position
      if (anchorElement instanceof HTMLElement) {
        const rect = anchorElement.getBoundingClientRect()
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        })
      }
    }

    const handleOnMouseEnter = (event: CustomEvent) => {
      const { node, json, content } = event.detail

      setCurrentFootnote(node as FootnoteNode)
      if (json !== null) {
      setFootnoteContent(JSON.stringify(json, null, 2))
      }
      setEditorState(json)
      console.log('Current Footnote Node:', content)
      console.log('Footnote JSON:', json)
      setIsOpen(true)
    }

    const handleOnClick = (event: CustomEvent) => {
      setFootnoteContent('')
      const { node, json, content, anchorElement } = event.detail

      setCurrentFootnote(node as FootnoteNode)
      if(json) {
      setFootnoteContent(JSON.stringify(json))
      }
      setEditorState(json)
      console.log('Clicked Footnote Node:', content)
      console.log('Footnote JSON:', json)
      setIsOpen(true)
      // if (anchorElement instanceof HTMLElement) {
      //   const rect = anchorElement.getBoundingClientRect()
      //   setPosition({
      //     top: rect.bottom + window.scrollY,
      //     left: rect.left + window.scrollX,
      //   })
      // }
    }

    window.addEventListener('openFootnoteModal', handleOpenModal as EventListener)
    // window.addEventListener('footnoteHover', handleOnMouseEnter as EventListener)
    window.addEventListener('footnoteClick', handleOnClick as EventListener)
    
    return () => {
      window.removeEventListener('openFootnoteModal', handleOpenModal as EventListener)
      // window.removeEventListener('footnoteHover', handleOnMouseEnter as EventListener)
      window.removeEventListener('footnoteClick', handleOnClick as EventListener)
    }
  }, [])

  // const handleSave = (data: SerializedEditorState<SerializedLexicalNode> | null) => {
  //   editor.update(() => {
  //     // const footnoteId = (envTarget as HTMLElement)?.getAttribute('data-footnote-id')
  //     // console.log('FOOTNOTE ID:', footnoteId)
      
  //     const selection = $getSelection()
  //     if ($isRangeSelection(selection)) {
  //       const nodes = selection.getNodes()
  //                 const footnoteNode = nodes.find(node => 
  //                   $isFootnoteNode(node) && (node as FootnoteNode).getId() === currentFootnote?.getId()
  //                 ) as FootnoteNode | undefined
                  
  //                 if (footnoteNode) {
  //                  console.log('Current Footnote Node:', footnoteNode) 
  //                  footnoteNode.setJsonContent(data);
  //         console.log('Footnote Node - json:', footnoteNode.getJsonContent());
  //                 }
  //     }



  //     // if (currentFootnote instanceof FootnoteNode) {
  //     //   console.log('Current Footnote Node before update:', currentFootnote);
  //     //   console.log('Data to save:', currentFootnote.__id, currentFootnote.__number, currentFootnote.__content, data);
  //     //   try{
  //     //     currentFootnote.setJsonContent(data);
  //     //     console.log('Footnote Node - json:', currentFootnote.getJsonContent());
  //     //   } catch(error) {
  //     //     console.error('Error setting JSON content:', error);
  //     //   } // Use the setter to update the node's JSON content
  //     //   console.log('Updated Footnote Node - json:', currentFootnote.getJsonContent());
  //     // }
  //   });

  //   // editor.update(() => {

  //   //   if (currentFootnote instanceof FootnoteNode) {
        
  //   //     // const node = currentFootnote as FootnoteNode
  //   //     console.log('Current Footnote Node:', currentFootnote)
  //   //     // const nodeKey = currentFootnote.getKey()
  //   //     const updatedJson = data as SerializedEditorState<SerializedLexicalNode>
  //   //     console.log('Node Data', updatedJson)
        
  //   //     const updated = new FootnoteNode(currentFootnote.__id, currentFootnote.__number, currentFootnote.__content, updatedJson, currentFootnote.__key);
  //   //     const replacement = currentFootnote.replace(updated)
  //   //     console.log('Replacement Node:', currentFootnote)
  //   //     console.log('Updated Footnote Node - json:', replacement.__json)
      
  //   //   }
  //   // });

  //   setEditorState(data)
    
  //   // if (currentFootnote) {
  //   //   editor.update(() => {
  //   //     currentFootnote.setContent(footnoteContent)
  //   //   })
  //   // }
  //   // setIsOpen(false)
  //   setShowEditModal(false)
  //   // setCurrentFootnote(null)

  //   setFootnoteContent(JSON.stringify(data, null, 2)) // Save the content as JSON string
  // }

  const handleSave = (data: SerializedEditorState<SerializedLexicalNode> | null) => {
  editor.update(() => {
    if (!currentFootnote) return;
    
    // Find the footnote node by traversing the entire root
    const root = $getRoot();
    
    const findFootnoteNode = (node: LexicalNode): FootnoteNode | null => {
      if ($isFootnoteNode(node) && node.getId() === currentFootnote.getId()) {
        return node;
      }
      
      if ($isElementNode(node)) {
        const children = node.getChildren();
        for (const child of children) {
          const result = findFootnoteNode(child);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    const foundNode = findFootnoteNode(root);
    console.log('Found Footnote Node:', foundNode);
    
    if (foundNode) {
      // Get writable reference and update JSON
      const writableNode = foundNode.getWritable();
      writableNode.__json = data;
      console.log('Updated footnote node JSON:', writableNode.getJsonContent());
      console.log('Footnote Node - json:', foundNode);
    }
  });
  
  setEditorState(data);
  setShowEditModal(false);
  setFootnoteContent(JSON.stringify(data));
};


  const handleClose = () => {
    setIsOpen(false)
    setCurrentFootnote(null)
    setFootnoteContent('')
    editor.dispatchCommand(REMOVE_FOOTNOTE_COMMAND, currentFootnote as FootnoteNode);
  }

  const disPlayTextEditor = () => {
    console.log('CONTENT', footnoteContent)
    setShowEditModal(true)
  }

  if(showEditModal) {
    return <EditFootnoteModal isOpen={showEditModal} setIsOpen={setShowEditModal} footnoteContent={footnoteContent} setFootnoteContent={handleSave} />
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} position={position} >
      <section style={{color: '#000', textOverflow: 'ellipsis'}} className="modal_container_lexical_content">
        {editorState !== null && <SerializeLexical nodes={editorState.root.children} /> }  {/**<RichTextConverter data={editorState} converters={jsxConverters} />   <div dangerouslySetInnerHTML={{ __html: htmlString }} /> **/}
      </section>
      <button type='button' onClick={disPlayTextEditor} className='modal_container_action_btn'><FontAwesomeIcon color='#000' icon={faEdit} /></button>
      <button type='button' onClick={handleClose} className='modal_container_action_btn'><FontAwesomeIcon color='#000' icon={faClose} /></button>
    </Modal>
  )
}