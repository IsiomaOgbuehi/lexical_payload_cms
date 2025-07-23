import React from 'react'
import '../styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { FootnoteEditor } from './FootnoteEditor'
// import { LexicalEditor } from '@payloadcms/richtext-lexical/lexical'
import { generateFootnoteHTML } from '../../utils/generateFootnoteHtml'
// import InlineRichText from './Richtext'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Drawer } from '@payloadcms/ui/elements/Drawer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { SerializedEditorState } from 'node_modules/lexical/LexicalEditorState'
import { SerializedLexicalNode } from 'node_modules/lexical/LexicalNode'

interface IEditProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void,
    footnoteContent: string,
    setFootnoteContent: (data: SerializedEditorState<SerializedLexicalNode> | null) => void
    // node?: FootnoteNode
    // children: React.ReactNode
    // saveContent: (content: string) => void
}

export const EditFootnoteModal: React.FC<IEditProps> = ({isOpen, setIsOpen, footnoteContent, setFootnoteContent }) => {
    const [editor] = useLexicalComposerContext()

    const handleSave = () => {
        console.log('EDITOR:===', editor)
        const { individualFootnotes, footnotesHtml, htmlWithSuperscripts } = generateFootnoteHTML(editor)

        console.log('FOORTNOTES HTML:', footnotesHtml)
        console.log('HTML WITH SUPERSCRIPTS:', htmlWithSuperscripts)
        console.log('INDIVIDUAL FOOTNOTES:', individualFootnotes)

         Object.entries(individualFootnotes).forEach(([footnoteNumber, html]) => {
            // Save to memory, localStorage, API, etc.
            console.log(`Footnote ${footnoteNumber}:`, html)
         })
        // const [editor] = useLexicalEditor()
    }


    if (!isOpen) return null
    return (
        <div className="edit_footnote_modal">
        {/* Modal content goes here */}
        <div className='edit_modal_header'>
            <h2>Edit Footnote</h2>
            <button onClick={() => setIsOpen(false)} className='modal_container_action_btn_2'><FontAwesomeIcon color='#000' icon={faClose} /></button>
        </div>
        
        <FootnoteEditor
              content={footnoteContent}
              handleSave={setFootnoteContent}
            />
            {/* <InlineRichText /> */}
            {/* <Drawer slug={''} children={lexicalEditor()}></Drawer> */}
        </div>
    )
}
