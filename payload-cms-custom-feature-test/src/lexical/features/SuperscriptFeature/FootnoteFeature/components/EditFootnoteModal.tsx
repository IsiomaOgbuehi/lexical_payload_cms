import React from 'react'
import '../styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { FootnoteEditor } from './FootnoteEditor'
import { SerializedEditorState } from 'node_modules/lexical/LexicalEditorState'
import { SerializedLexicalNode } from 'node_modules/lexical/LexicalNode'

interface IEditProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void,
    footnoteContent: string,
    setFootnoteContent: (data: SerializedEditorState<SerializedLexicalNode> | null) => void
}

export const EditFootnoteModal: React.FC<IEditProps> = ({isOpen, setIsOpen, footnoteContent, setFootnoteContent }) => {
    
    if (!isOpen) return null
    return (
        <div className="edit_footnote_modal">
        <div className='edit_modal_header'>
            <h2>Edit Footnote</h2>
            <button onClick={() => setIsOpen(false)} className='modal_container_action_btn_2'><FontAwesomeIcon color='#000' icon={faClose} /></button>
        </div>
        
        <FootnoteEditor
              content={footnoteContent}
              handleSave={setFootnoteContent}
            />
        </div>
    )
}
