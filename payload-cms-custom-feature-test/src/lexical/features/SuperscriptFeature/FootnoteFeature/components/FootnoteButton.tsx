import React, { JSX } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Superscript } from 'lucide-react'
import { FOOTNOTE_NUMBER_COMMAND } from '../plugins/FootnotePlugin'

export function FootnoteButton(): JSX.Element {
  const [editor] = useLexicalComposerContext()

  const handleClick = () => {
    editor.dispatchCommand(FOOTNOTE_NUMBER_COMMAND, undefined)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="toolbar-item spaced"
      aria-label="Insert footnote"
      title="Insert footnote"
    >
      <Superscript size={16} />
    </button>
  )
}