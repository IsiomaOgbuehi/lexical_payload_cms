import React, { useState, useEffect, JSX } from 'react'
import { $getRoot, $isElementNode } from 'lexical'
import { $isFootnoteNode, FootnoteNode } from '../nodes/FootnoteNode'
import Modal from './Modal'
import { faEdit, faClose } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { LexicalNode, SerializedEditorState, SerializedLexicalNode, SerializedRootNode } from '@payloadcms/richtext-lexical/lexical'
import { SerializeLexical } from '../../utils/serializeLexical'
import { REMOVE_FOOTNOTE_COMMAND } from '../plugins/FootnotePlugin'
import '../styles.css'
import { FieldsDrawer, useEditorConfigContext, useLexicalDrawer } from '@payloadcms/richtext-lexical/client'
import { Data, FormState } from 'payload'
import { formatDrawerSlug, useEditDepth } from '@payloadcms/ui'


export function FootnoteModal(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [currentFootnote, setCurrentFootnote] = useState<FootnoteNode | null>(null)
  const [footnoteContent, setFootnoteContent] = useState('')
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  const [showEditModal, setShowEditModal] = useState(false)

  const [editor] = useLexicalComposerContext()
  const [editorState, setEditorState] = useState<SerializedEditorState<SerializedLexicalNode> | null>(null)

  const editDepth = useEditDepth()
    const drawerSlug = formatDrawerSlug({
      slug: '',
      depth: editDepth,
    })
    const { toggleDrawer } = useLexicalDrawer(drawerSlug)

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
      toggleDrawer()
    }
     

    const handleOnMouseEnter = (event: CustomEvent) => {
      const { node, json, content, anchorElement } = event.detail

      setCurrentFootnote(node as FootnoteNode)
      if (json !== null) {
      setFootnoteContent(JSON.stringify(json, null, 2))
      }
      setEditorState(json)
      if (anchorElement instanceof HTMLElement) {
        const rect = anchorElement.getBoundingClientRect()
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        })
      }
      setIsOpen(true)
      setShowEditModal(true)
    }

    const handleOnClick = (event: CustomEvent) => {
      setFootnoteContent('')
      const { node, json, content, anchorElement } = event.detail

      setCurrentFootnote(node as FootnoteNode)
      if(json) {
      setFootnoteContent(JSON.stringify(json))
      }
      setEditorState(json)
      setIsOpen(true)
      if (anchorElement instanceof HTMLElement) {
        const rect = anchorElement.getBoundingClientRect()
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        })
      }
      setShowEditModal(true)
    }

    window.addEventListener('openFootnoteModal', handleOpenModal as EventListener)
    window.addEventListener('footnoteClick', handleOnClick as EventListener)
    window.addEventListener('footnoteMouseEnter', handleOnMouseEnter as EventListener)
    
    return () => {
      window.removeEventListener('openFootnoteModal', handleOpenModal as EventListener)
      window.removeEventListener('footnoteClick', handleOnClick as EventListener)
      window.removeEventListener('footnoteMouseEnter', handleOnMouseEnter as EventListener)

    }
  }, [])

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
    
    const foundNode = findFootnoteNode(root)
    
    if (foundNode) {
      // Get writable reference and update JSON
      const writableNode = foundNode.getWritable();
      writableNode.__json = data;
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
    toggleDrawer()
    setShowEditModal(true)
  
  }

  const {
      fieldProps: { schemaPath },
    } = useEditorConfigContext() 


    return (
      <>
      {showEditModal &&  <Modal isOpen={isOpen} setIsOpen={setIsOpen} position={position} >
      <section style={{color: '#000', textOverflow: 'ellipsis'}} className="modal_container_lexical_content">
        {editorState !== null && <SerializeLexical nodes={editorState.root.children} /> }  {/**<RichTextConverter data={editorState} converters={jsxConverters} />   <div dangerouslySetInnerHTML={{ __html: htmlString }} /> **/}
      </section>
      <button type='button' onClick={disPlayTextEditor} className='modal_container_action_btn'><FontAwesomeIcon color='#000' icon={faEdit} /></button>
      <button type='button' onClick={handleClose} className='modal_container_action_btn'><FontAwesomeIcon color='#000' icon={faClose} /></button>
    </Modal>
  }
    <FieldsDrawer
            className="lexical-link-edit-drawer"
            drawerSlug={drawerSlug}
            drawerTitle='Add/Edit Footnote'
            data={{footnote: editorState} as Data}
            featureKey="footnote"
            handleDrawerSubmit={(fields: FormState, data) => {
              editor.update(() => {
                handleSave(data.footnote as SerializedEditorState<SerializedLexicalNode>)
              })
            }}
            schemaPath={schemaPath}
            schemaPathSuffix="fields"
          />
          </>
    )
}