import React, { JSX } from 'react'
import { Superscript } from 'lucide-react'

export function FootnoteButton(): JSX.Element {

  return (
    <button
      type="button"
      className="toolbar-item spaced"
      aria-label="Insert footnote"
      title="Insert footnote"
    >
      <Superscript size={16} />
    </button>
  )
}